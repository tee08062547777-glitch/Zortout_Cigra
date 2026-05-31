import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
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

    const { data, error } = await supabase
      .from("api_credentials")
      .select("id, zort_mid, zort_cs")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({
      mid: data?.zort_mid || process.env.ZORT_MID || "212548",
      cs: data?.zort_cs || process.env.ZORT_CS || "n21g8113",
      hasCookie: data?.id ? true : false,
    });
  } catch (error) {
    console.error("[API] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { zort_cookie, zort_mid, zort_cs } = body;

    if (!zort_cookie || zort_cookie.trim() === "") {
      return NextResponse.json(
        { error: "ZORT_COOKIE is required" },
        { status: 400 },
      );
    }

    // Check if credentials already exist
    const { data: existing } = await supabase
      .from("api_credentials")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let result;
    if (existing) {
      // Update
      result = await supabase
        .from("api_credentials")
        .update({
          zort_cookie,
          zort_mid: zort_mid || process.env.ZORT_MID,
          zort_cs: zort_cs || process.env.ZORT_CS,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } else {
      // Insert
      result = await supabase.from("api_credentials").insert({
        user_id: user.id,
        zort_cookie,
        zort_mid: zort_mid || process.env.ZORT_MID,
        zort_cs: zort_cs || process.env.ZORT_CS,
      });
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({
      success: true,
      message: "Credentials saved successfully",
    });
  } catch (error) {
    console.error("[API] POST Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
