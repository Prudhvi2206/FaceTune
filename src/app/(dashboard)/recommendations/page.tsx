"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Music2, Play, Sparkles } from "lucide-react";
import { useEmotion } from "@/providers/EmotionProvider";
import { usePlayerStore } from "@/providers/MusicPlayerProvider";
import { getRandomQuery } from "@/lib/emotion-music-mapper";
import { getEmotionEmoji } from "@/lib/utils";
import type { Track } from "@/types/music";
import type { EmotionType } from "@/types/emotion";

const allEmotions: EmotionType[] = [
  "happy", "sad", "angry", "neutral", "surprised", "fearful", "disgusted",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function RecommendationsPage() {
  const { currentEmotion } = useEmotion();
  const playTracks = usePlayerStore((s) => s.playTracks);
  const emotion = currentEmotion?.emotion || "neutral";

  // Fetch recommendations for current mood
  const { data: currentMoodData } = useQuery({
    queryKey: ["recommendations", emotion],
    queryFn: async () => {
      const query = getRandomQuery(emotion);
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&limit=10`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch a diverse set for all emotions
  const { data: diverseData } = useQuery({
    queryKey: ["recommendations-diverse"],
    queryFn: async () => {
      const results: Record<string, Track[]> = {};
      for (const em of ["happy", "sad", "neutral"]) {
        const query = getRandomQuery(em as EmotionType);
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        results[em] = data.tracks || [];
      }
      return results;
    },
    staleTime: 10 * 60 * 1000,
  });

  const currentTracks: Track[] = currentMoodData?.tracks || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">Recommendations</h1>
        </div>
        <p className="text-muted-foreground">Music curated for your mood</p>
      </div>

      {/* Current Mood Recommendations */}
      <section>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4 flex items-center gap-2">
          {getEmotionEmoji(emotion)} For Your Current Mood: <span className="capitalize gradient-text">{emotion}</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentTracks.map((track, i) => (
            <motion.button
              key={track.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.05 }}
              onClick={() => playTracks(currentTracks, i)}
              className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all text-left"
            >
              <div className="relative aspect-square bg-accent overflow-hidden">
                {track.albumArt && !track.albumArt.includes("placeholder") ? (
                  <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-white/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
            </motion.button>
          ))}
          {currentTracks.length === 0 &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square rounded-xl bg-accent animate-pulse" />
                <div className="h-4 bg-accent animate-pulse rounded w-3/4" />
              </div>
            ))}
        </div>
      </section>

      {/* Diverse Recommendations */}
      {diverseData &&
        Object.entries(diverseData).map(([em, tracks]) => (
          <section key={em}>
            <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4 flex items-center gap-2">
              {getEmotionEmoji(em)} <span className="capitalize">{em}</span> Vibes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(tracks as Track[]).map((track, i) => (
                <motion.button
                  key={track.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => playTracks(tracks as Track[], i)}
                  className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all text-left"
                >
                  <div className="relative aspect-square bg-accent overflow-hidden">
                    {track.albumArt && !track.albumArt.includes("placeholder") ? (
                      <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        ))}
    </motion.div>
  );
}
