import { NextRequest, NextResponse } from "next/server";
import { getTrendingTracks } from "@/lib/audius";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre") || undefined;
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const tracks = await getTrendingTracks(genre, limit);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Trending tracks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending tracks" },
      { status: 500 }
    );
  }
}
