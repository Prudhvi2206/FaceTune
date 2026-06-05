// ============================================
// Analytics Types
// ============================================

import type { EmotionType } from "./emotion";

export interface MoodStats {
  emotion: EmotionType;
  count: number;
  percentage: number;
  avgConfidence: number;
}

export interface ListeningStats {
  totalMinutes: number;
  tracksPlayed: number;
  topGenres: { genre: string; count: number }[];
  topArtists: { artist: string; count: number }[];
}

export interface DailyAnalytics {
  date: string;
  moodTimeline: { time: string; emotion: EmotionType; confidence: number }[];
  listeningActivity: { hour: number; minutes: number }[];
}

export interface WeeklyAnalytics {
  weekStart: string;
  weekEnd: string;
  moodDistribution: MoodStats[];
  topTracks: { trackName: string; artist: string; playCount: number }[];
  totalListeningMinutes: number;
}

export interface MonthlyAnalytics {
  month: string;
  emotionTrends: { date: string; dominant: EmotionType }[];
  favoriteGenres: { genre: string; percentage: number }[];
  favoriteArtists: { artist: string; playCount: number }[];
  totalListeningMinutes: number;
}

export interface MoodHeatmapData {
  date: string;
  emotion: EmotionType;
  intensity: number;
}
