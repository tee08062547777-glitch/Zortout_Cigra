import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "Unsupported image URL protocol" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(parsedUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Image request failed with ${response.status}` },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
