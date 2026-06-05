"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Music2, Play, Trash2 } from "lucide-react";
import { usePlayerStore } from "@/providers/MusicPlayerProvider";
import type { Track } from "@/types/music";

export default function FavoritesPage() {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playTracks = usePlayerStore((s) => s.playTracks);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      return res.json();
    },
  });

  const favorites = data?.favorites || [];

  const tracks: Track[] = favorites.map((f: Record<string, unknown>) => ({
    id: f.songId as string,
    title: f.songName as string,
    artist: f.artistName as string,
    albumArt: (f.albumArt as string) || "",
    duration: (f.duration as number) || 0,
    streamUrl: f.streamUrl as string,
    source: (f.source as "audius" | "youtube") || "audius",
    youtubeId: f.youtubeId as string,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">Favorites</h1>
        </div>
        <p className="text-muted-foreground">Your saved songs</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-accent animate-pulse h-16" />
          ))}
        </div>
      ) : tracks.length > 0 ? (
        <div className="space-y-2">
          {tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all cursor-pointer"
              onClick={() => playTracks(tracks, i)}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-accent flex-shrink-0">
                {track.albumArt && !track.albumArt.includes("placeholder") ? (
                  <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center">
                    <Music2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-accent capitalize">
                {track.source}
              </span>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No favorites yet</h3>
          <p className="text-muted-foreground text-sm">
            Songs you love will appear here. Click the heart icon on any song to save it.
          </p>
        </div>
      )}
    </motion.div>
  );
}
