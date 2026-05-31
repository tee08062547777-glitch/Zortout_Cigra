import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { scrapeProducts, enrichProductsWithImages } from "@/lib/scraper";

interface DueSyncSetting {
  user_id: string;
  auto_sync_enabled: boolean;
  updated_at: string | null;
  created_at: string | null;
  sync_interval_minutes: number | null;
  last_sync_by_email: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const configuredSecret = process.env.CRON_SECRET;
    const providedSecret =
      req.nextUrl.searchParams.get("secret") ||
      req.headers.get("Authorization")?.replace("Bearer ", "");

    if (configuredSecret && providedSecret !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: settingsRows, error: settingsError } = await supabase
      .from("sync_settings")
      .select(
        "user_id, auto_sync_enabled, updated_at, created_at, sync_interval_minutes, last_sync_by_email",
      )
      .eq("auto_sync_enabled", true);

    if (settingsError) throw settingsError;

    const now = Date.now();
    const dueSettings = (settingsRows || []).filter(
      (settings: DueSyncSetting) => {
        const lastRunAt = settings.updated_at || settings.created_at;
        if (!lastRunAt) return true;

        const intervalMinutes = settings.sync_interval_minutes || 60;
        const elapsedMinutes =
          (now - new Date(lastRunAt).getTime()) / (1000 * 60);

        return elapsedMinutes >= intervalMinutes;
      },
    ) as DueSyncSetting[];

    if (dueSettings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users due for auto sync",
        syncedUsers: 0,
      });
    }

    const results = [];

    for (const settings of dueSettings) {
      try {
        const result = await syncForUser(
          settings.user_id,
          settings.last_sync_by_email,
        );
        results.push({
          userId: settings.user_id,
          success: true,
          count: result.count,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[CRON] Failed for user ${settings.user_id}:`, error);
        results.push({
          userId: settings.user_id,
          success: false,
          error: message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      syncedUsers: results.filter((result) => result.success).length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function syncForUser(userId: string, syncByEmail: string | null) {
  const { data: creds } = await supabase
    .from("api_credentials")
    .select("zort_cookie, zort_mid, zort_cs")
    .eq("user_id", userId)
    .single();

  const cookie = creds?.zort_cookie || process.env.ZORT_COOKIE || "";
  const mid = creds?.zort_mid || process.env.ZORT_MID || "212548";
  const cs = creds?.zort_cs || process.env.ZORT_CS || "n21g8113";
  const maxPage = Number(process.env.MAX_PAGE || 100);

  if (!cookie || cookie === "your_cookie_here") {
    throw new Error("ZORT_COOKIE not configured for this user");
  }

  console.log(`[CRON] Starting auto sync for user ${userId}...`);

  let products = await scrapeProducts(mid, cs, cookie, maxPage);
  products = await enrichProductsWithImages(products, mid, cookie);

  const dbProducts = products.map((product) => ({
    pid: BigInt(product.pid),
    sku: product.sku,
    product_name: product.productName,
    full_name: product.fullName,
    variant: product.variant || null,
    stock: product.stock,
    unit: product.unit || null,
    image_url: product.imageUrl,
  }));

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .neq("pid", 0);

  if (deleteError) throw deleteError;

  const batchSize = 100;
  for (let i = 0; i < dbProducts.length; i += batchSize) {
    const batch = dbProducts.slice(i, i + batchSize);
    const { error: insertError } = await supabase.from("products").insert(batch);
    if (insertError) throw insertError;
  }

  const syncedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("sync_settings")
    .update({
      last_sync_by_user_id: userId,
      last_sync_by_email: syncByEmail || userId,
      updated_at: syncedAt,
    })
    .eq("user_id", userId);

  if (updateError) {
    console.warn("[CRON] Metadata update failed, falling back:", updateError);
    const { error: fallbackError } = await supabase
      .from("sync_settings")
      .update({
        updated_at: syncedAt,
      })
      .eq("user_id", userId);

    if (fallbackError) throw fallbackError;
  }

  console.log(`[CRON] Completed user ${userId}. Inserted ${dbProducts.length}`);

  return { count: dbProducts.length };
}
