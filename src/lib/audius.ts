import type { Track, Artist } from "@/types/music";

const AUDIUS_API_BASE = "https://discoveryprovider.audius.co/v1";

// Fallback discovery nodes
const DISCOVERY_NODES = [
  "https://discoveryprovider.audius.co",
  "https://discoveryprovider2.audius.co",
  "https://discoveryprovider3.audius.co",
  "https://audius-discovery-1.cultur3stake.com",
  "https://audius-discovery-2.cultur3stake.com",
];

let activeNode = DISCOVERY_NODES[0];

async function getHealthyNode(): Promise<string> {
  for (const node of DISCOVERY_NODES) {
    try {
      const res = await fetch(`${node}/health_check`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        activeNode = node;
        return node;
      }
    } catch {
      continue;
    }
  }
  return activeNode;
}

function getApiBase(): string {
  return `${activeNode}/v1`;
}

function mapTrack(raw: Record<string, unknown>): Track {
  const artwork = raw.artwork as Record<string, string> | null;
  const user = raw.user as Record<string, unknown> | null;

  return {
    id: raw.id as string,
    title: (raw.title as string) || "Unknown Track",
    artist: (user?.name as string) || "Unknown Artist",
    artistId: user?.id as string,
    albumArt:
      (artwork?.["480x480"] as string) ||
      (artwork?.["150x150"] as string) ||
      "/placeholder-album.svg",
    duration: (raw.duration as number) || 0,
    streamUrl: `${getApiBase()}/tracks/${raw.id}/stream`,
    genre: (raw.genre as string) || "",
    mood: (raw.mood as string) || "",
    source: "audius",
  };
}

export async function searchTracks(
  query: string,
  limit: number = 20
): Promise<Track[]> {
  try {
    await getHealthyNode();
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      app_name: "FaceTune",
    });

    const res = await fetch(`${getApiBase()}/tracks/search?${params}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data || []).map(mapTrack);
  } catch (error) {
    console.error("Audius search error:", error);
    return [];
  }
}

export async function getTrendingTracks(
  genre?: string,
  limit: number = 20
): Promise<Track[]> {
  try {
    await getHealthyNode();
    const params = new URLSearchParams({
      limit: limit.toString(),
      app_name: "FaceTune",
    });
    if (genre) params.set("genre", genre);

    const res = await fetch(`${getApiBase()}/tracks/trending?${params}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data || []).map(mapTrack);
  } catch (error) {
    console.error("Audius trending error:", error);
    return [];
  }
}

export async function getTrack(trackId: string): Promise<Track | null> {
  try {
    await getHealthyNode();
    const res = await fetch(
      `${getApiBase()}/tracks/${trackId}?app_name=FaceTune`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.data ? mapTrack(data.data) : null;
  } catch (error) {
    console.error("Audius get track error:", error);
    return null;
  }
}

export async function getStreamUrl(trackId: string): Promise<string> {
  await getHealthyNode();
  return `${getApiBase()}/tracks/${trackId}/stream?app_name=FaceTune`;
}

export async function getArtist(userId: string): Promise<Artist | null> {
  try {
    await getHealthyNode();
    const res = await fetch(
      `${getApiBase()}/users/${userId}?app_name=FaceTune`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const raw = data.data;
    if (!raw) return null;

    const profilePic = raw.profile_picture as Record<string, string> | null;

    return {
      id: raw.id as string,
      name: (raw.name as string) || "Unknown Artist",
      image:
        (profilePic?.["480x480"] as string) ||
        (profilePic?.["150x150"] as string) ||
        "/placeholder-artist.svg",
      bio: (raw.bio as string) || "",
      trackCount: (raw.track_count as number) || 0,
      followerCount: (raw.follower_count as number) || 0,
    };
  } catch (error) {
    console.error("Audius get artist error:", error);
    return null;
  }
}
