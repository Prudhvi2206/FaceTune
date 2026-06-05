import type { EmotionType } from "@/types/emotion";
import type { EmotionMusicMapping } from "@/types/music";

const emotionMusicMap: Record<EmotionType, EmotionMusicMapping> = {
  happy: {
    genres: ["Pop", "Dance", "Electronic", "Hip-Hop"],
    moods: ["Upbeat", "Energetic", "Excited", "Happy"],
    queries: [
      "feel good pop",
      "happy vibes",
      "dance party",
      "upbeat hits",
      "feel good summer",
      "happy songs",
      "party anthems",
      "good mood",
    ],
  },
  sad: {
    genres: ["Acoustic", "Piano", "Ambient", "Folk"],
    moods: ["Melancholy", "Tender", "Calm", "Peaceful"],
    queries: [
      "acoustic calm",
      "piano relaxing",
      "sad songs",
      "emotional ballads",
      "melancholy acoustic",
      "tender piano",
      "rainy day music",
      "heartfelt songs",
    ],
  },
  angry: {
    genres: ["Rock", "Metal", "Punk", "Hip-Hop"],
    moods: ["Aggressive", "Intense", "Powerful", "Energetic"],
    queries: [
      "rock workout",
      "high energy rock",
      "intense workout",
      "aggressive beats",
      "power metal",
      "workout motivation",
      "intense electronic",
      "hard hitting",
    ],
  },
  neutral: {
    genres: ["Lo-Fi", "Instrumental", "Ambient", "Jazz"],
    moods: ["Chill", "Focused", "Relaxing", "Peaceful"],
    queries: [
      "lofi beats",
      "study music",
      "focus instrumental",
      "ambient chill",
      "concentration music",
      "lofi hip hop",
      "jazz instrumental",
      "background music",
    ],
  },
  surprised: {
    genres: ["Pop", "Electronic", "Indie", "Alternative"],
    moods: ["Excited", "Adventurous", "Upbeat", "Curious"],
    queries: [
      "trending music",
      "new releases",
      "popular songs",
      "discover new",
      "indie discoveries",
      "viral songs",
      "fresh finds",
      "chart toppers",
    ],
  },
  fearful: {
    genres: ["Ambient", "Classical", "New Age", "Nature"],
    moods: ["Calming", "Soothing", "Peaceful", "Meditative"],
    queries: [
      "meditation music",
      "nature sounds",
      "calming ambient",
      "relaxing classical",
      "stress relief",
      "peaceful meditation",
      "soothing sounds",
      "deep relaxation",
    ],
  },
  disgusted: {
    genres: ["Pop", "Dance", "Funk", "Soul"],
    moods: ["Uplifting", "Happy", "Positive", "Groovy"],
    queries: [
      "mood booster",
      "uplifting songs",
      "positive vibes",
      "feel good funk",
      "happy soul",
      "positive energy",
      "sunshine pop",
      "groovy beats",
    ],
  },
};

export function getEmotionMusicMapping(emotion: EmotionType): EmotionMusicMapping {
  return emotionMusicMap[emotion] || emotionMusicMap.neutral;
}

export function getRandomQuery(emotion: EmotionType): string {
  const mapping = getEmotionMusicMapping(emotion);
  const queries = mapping.queries;
  return queries[Math.floor(Math.random() * queries.length)];
}

export function getRandomGenre(emotion: EmotionType): string {
  const mapping = getEmotionMusicMapping(emotion);
  const genres = mapping.genres;
  return genres[Math.floor(Math.random() * genres.length)];
}

export function getRandomMood(emotion: EmotionType): string {
  const mapping = getEmotionMusicMapping(emotion);
  const moods = mapping.moods;
  return moods[Math.floor(Math.random() * moods.length)];
}
