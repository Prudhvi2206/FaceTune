import type { Track } from "@/types/music";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

/**
 * Clean raw YouTube title and channel name into a clean, Spotify-like Title & Artist structure.
 */
export function cleanYouTubeMetadata(rawTitle: string, channelName: string): { title: string; artist: string } {
  let clean = rawTitle
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Remove parenthetical/bracketed promotional clutter like (Official Music Video), [Lyrical Video], etc.
  clean = clean.replace(/[\(\[]\s*(official\s*(music\s*|lyric\s*)?video|official\s*audio|lyrical|lyrics|hd|4k|audio\s*only|clip|full\s*song|video\s*song)\s*[\)\]]/gi, "");

  let title = clean.trim();
  let artist = channelName.replace(/\s*-\s*Topic$/i, "").trim(); // Remove "- Topic" suffix from official YouTube Music uploads

  // Try to parse title formats like "Artist - Song" or "Song | Artist"
  if (clean.includes(" - ")) {
    const parts = clean.split(" - ");
    artist = parts[0].trim();
    title = parts[1].trim();
  } else if (clean.includes(" | ")) {
    const parts = clean.split(" | ");
    title = parts[0].trim();
    // If the channel name is generic, try using the first pipe segment as the artist
    if (parts[1] && (artist.toLowerCase().includes("music") || artist.toLowerCase().includes("vevo"))) {
      artist = parts[1].trim();
    }
  } else if (clean.includes(": ")) {
    const parts = clean.split(": ");
    artist = parts[0].trim();
    title = parts[1].trim();
  }

  // Remove trailing promotional words
  title = title.replace(/\s*(official\s*(music\s*)?video|official\s*audio|lyric\s*video|lyrical|lyrics|video|audio|full\s*song)$/gi, "").trim();
  
  // Clean double quotes/single quotes
  title = title.replace(/^["']|["']$/g, "").trim();

  return { title, artist };
}

/**
 * Fallback public YouTube search scraper that parses ytInitialData.
 * Bypasses the need for a YouTube API key and avoids daily quota limits.
 */
export async function scrapeYouTubeSearch(
  query: string,
  limit: number = 10
): Promise<Track[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) return [];
    const html = await res.text();

    const startPattern = "ytInitialData = ";
    const startIdx = html.indexOf(startPattern);
    if (startIdx === -1) return [];

    const dataStart = startIdx + startPattern.length;
    const endIdx = html.indexOf("</script>", dataStart);
    if (endIdx === -1) return [];

    let jsonStr = html.substring(dataStart, endIdx).trim();
    if (jsonStr.endsWith(";")) {
      jsonStr = jsonStr.slice(0, -1);
    }

    const data = JSON.parse(jsonStr);

    const sections =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    let itemSection = null;
    for (const s of sections) {
      if (s.itemSectionRenderer) {
        itemSection = s.itemSectionRenderer;
        break;
      }
    }

    const items = itemSection?.contents || [];
    const tracks: Track[] = [];

    for (const item of items) {
      if (tracks.length >= limit) break;
      const video = item.videoRenderer;
      if (!video) continue;

      const videoId = video.videoId;
      if (!videoId) continue;

      // Clean the raw YouTube title and channel name
      const rawTitle = video.title?.runs?.[0]?.text || video.title?.simpleText || "";
      const rawChannel = video.ownerText?.runs?.[0]?.text || "";
      const { title, artist } = cleanYouTubeMetadata(rawTitle, rawChannel);

      const thumbnails = video.thumbnail?.thumbnails || [];
      const albumArt =
        thumbnails[thumbnails.length - 1]?.url || "/placeholder-album.svg";

      tracks.push({
        id: `yt-${videoId}`,
        title,
        artist,
        albumArt,
        duration: 0,
        streamUrl: "",
        source: "youtube" as const,
        youtubeId: videoId,
      });
    }

    return tracks;
  } catch (error) {
    console.error("Public YouTube scrape search error:", error);
    return [];
  }
}

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 10
): Promise<Track[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  // If key is not set or is a placeholder, use the public scraper directly
  if (!apiKey || apiKey === "placeholder") {
    return scrapeYouTubeSearch(query, maxResults);
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      videoCategoryId: "10", // Music category
      q: query,
      maxResults: maxResults.toString(),
      key: apiKey,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("YouTube API error:", res.status);
      return scrapeYouTubeSearch(query, maxResults);
    }

    const data = await res.json();

    return (data.items || []).map((item: YouTubeSearchItem) => {
      const { title, artist } = cleanYouTubeMetadata(item.snippet.title, item.snippet.channelTitle);
      return {
        id: `yt-${item.id.videoId}`,
        title,
        artist,
        albumArt:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          "/placeholder-album.svg",
        duration: 0,
        streamUrl: "",
        source: "youtube" as const,
        youtubeId: item.id.videoId,
      };
    });
  } catch (error) {
    console.error("YouTube search API error:", error);
    return scrapeYouTubeSearch(query, maxResults);
  }
}
