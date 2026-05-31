import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { scrapeProducts, enrichProductsWithImages } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mid = process.env.ZORT_MID || "212548";
    const cs = process.env.ZORT_CS || "n21g8113";
    let cookie = process.env.ZORT_COOKIE || "";
    const maxPage = Number(process.env.MAX_PAGE || 100);

    // ดึง credentials จาก database
    if (!cookie || cookie === "your_cookie_here") {
      const { data: creds } = await supabase
        .from("api_credentials")
        .select("zort_cookie, zort_mid, zort_cs")
        .eq("user_id", user.id)
        .single();

      if (creds?.zort_cookie) {
        cookie = creds.zort_cookie;
      }
    }

    if (!cookie) {
      return NextResponse.json(
        { error: "ZORT_COOKIE not configured. Please set it in settings." },
        { status: 400 },
      );
    }

    console.log(`[SYNC] Starting scrape for user ${user.id}...`);

    // Scrape products
    let products = await scrapeProducts(mid, cs, cookie, maxPage);
    console.log(`[SYNC] Scraped ${products.length} products`);

    // Enrich with images
    products = await enrichProductsWithImages(products, mid, cookie);
    console.log(`[SYNC] Enriched ${products.length} products with images`);

    // Transform to DB format
    const dbProducts = products.map((p) => ({
      pid: BigInt(p.pid),
      sku: p.sku,
      product_name: p.productName,
      full_name: p.fullName,
      variant: p.variant || null,
      stock: p.stock,
      unit: p.unit || null,
      image_url: p.imageUrl,
    }));

    // Delete old products and insert new ones
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .neq("pid", 0); // Delete all

    if (deleteError) {
      console.error("[SYNC] Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete old products" },
        { status: 500 },
      );
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < dbProducts.length; i += batchSize) {
      const batch = dbProducts.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("products")
        .insert(batch);

      if (insertError) {
        console.error("[SYNC] Insert error at batch", i, insertError);
        return NextResponse.json(
          { error: "Failed to insert products" },
          { status: 500 },
        );
      }
    }

    const syncedAt = new Date().toISOString();
    const syncMetadata = {
      last_sync_by_user_id: user.id,
      last_sync_by_email: user.email || null,
      updated_at: syncedAt,
    };

    const { error: syncMetadataError } = await supabase
      .from("sync_settings")
      .update(syncMetadata)
      .eq("user_id", user.id);

    if (syncMetadataError) {
      console.warn("[SYNC] Metadata update failed, falling back:", syncMetadataError);
      const { error: fallbackError } = await supabase
        .from("sync_settings")
        .update({
          updated_at: syncedAt,
        })
        .eq("user_id", user.id);

      if (fallbackError) {
        console.error("[SYNC] Sync settings update error:", fallbackError);
      }
    }

    console.log(`[SYNC] Completed. Inserted ${dbProducts.length} products`);

    return NextResponse.json({
      success: true,
      count: dbProducts.length,
      timestamp: syncedAt,
      syncedBy: user.email || null,
    });
  } catch (error) {
    console.error("[SYNC] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
