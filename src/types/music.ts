// ============================================
// Music Types
// ============================================

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  albumArt: string;
  duration: number;
  streamUrl: string;
  genre?: string;
  mood?: string;
  source: "audius" | "youtube";
  youtubeId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage: string;
  tracks: Track[];
  trackCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  bio?: string;
  trackCount?: number;
  followerCount?: number;
}

export interface MusicSearchResult {
  tracks: Track[];
  source: "audius" | "youtube";
  query: string;
  total: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: "off" | "one" | "all";
  isMini: boolean;
  isFullscreen: boolean;
}

export interface EmotionMusicMapping {
  genres: string[];
  moods: string[];
  queries: string[];
}
