import { NextRequest, NextResponse } from "next/server";
import { searchTracks, getTrendingTracks } from "@/lib/audius";
import { searchYouTubeVideos } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query && !genre) {
    return NextResponse.json(
      { error: "Query or genre parameter required" },
      { status: 400 }
    );
  }

  try {
    let tracks: any[] = [];

    if (query) {
      // Search YouTube first for highly accurate mainstream audio (Spotify-like experience)
      const ytTracks = await searchYouTubeVideos(query, limit);
      
      if (ytTracks && ytTracks.length >= 5) {
        // Return only YouTube results if sufficient to avoid cluttering with irrelevant Audius covers/remixes
        tracks = ytTracks;
      } else {
        // Fallback/augment with Audius if YouTube results are sparse or failed
        const audiusTracks = await searchTracks(query, limit).catch(() => []);
        tracks = [...ytTracks, ...audiusTracks].slice(0, limit);
      }
    } else if (genre) {
      // For genre requests, try Audius trending first
      const audiusTracks = await getTrendingTracks(genre, limit).catch(() => []);
      if (audiusTracks.length >= 5) {
        tracks = audiusTracks;
      } else {
        // Fallback to YouTube music search if Audius returns nothing for this genre
        tracks = await searchYouTubeVideos(`${genre} music`, limit);
      }
    }

    return NextResponse.json({ tracks, total: tracks.length });
  } catch (error) {
    console.error("Music search error:", error);
    return NextResponse.json(
      { error: "Failed to search music" },
      { status: 500 }
    );
  }
}
