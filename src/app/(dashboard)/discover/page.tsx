"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Compass, Search, Music2, Play, TrendingUp } from "lucide-react";
import { usePlayerStore } from "@/providers/MusicPlayerProvider";
import { useSearchParams } from "next/navigation";
import type { Track } from "@/types/music";

const genres = [
  { name: "Pop", gradient: "from-pink-500 to-rose-500" },
  { name: "Rock", gradient: "from-red-500 to-orange-500" },
  { name: "Electronic", gradient: "from-cyan-500 to-blue-500" },
  { name: "Hip-Hop", gradient: "from-indigo-500 to-violet-500" },
  { name: "Jazz", gradient: "from-amber-500 to-yellow-500" },
  { name: "Classical", gradient: "from-emerald-500 to-teal-500" },
  { name: "R&B", gradient: "from-fuchsia-500 to-pink-500" },
  { name: "Ambient", gradient: "from-sky-500 to-indigo-500" },
  { name: "Folk", gradient: "from-orange-500 to-amber-500" },
  { name: "Lo-Fi", gradient: "from-teal-500 to-cyan-500" },
  { name: "Dance", gradient: "from-green-500 to-emerald-500" },
  { name: "Acoustic", gradient: "from-slate-500 to-zinc-500" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    if (initialQuery) {
      let active = true;
      setTimeout(() => {
        if (active) {
          setSearchQuery(initialQuery);
          setSelectedGenre(null);
        }
      }, 0);
      return () => {
        active = false;
      };
    }
  }, [initialQuery]);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const playTracks = usePlayerStore((s) => s.playTracks);

  const searchTerm = searchQuery || selectedGenre || "";

  const { data, isLoading } = useQuery({
    queryKey: ["discover", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      else if (selectedGenre) params.set("q", selectedGenre);
      params.set("limit", "20");
      const res = await fetch(`/api/music/search?${params}`);
      return res.json();
    },
    enabled: !!searchTerm,
    staleTime: 5 * 60 * 1000,
  });

  const tracks: Track[] = data?.tracks || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">
            Discover
          </h1>
        </div>
        <p className="text-muted-foreground">Explore new music by genre and mood</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedGenre(null);
            }}
            placeholder="Search for songs, artists, or genres..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </motion.div>

      {/* Genre Grid */}
      <motion.section variants={fadeUp}>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4">
          Browse by Genre
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {genres.map((genre) => (
            <motion.button
              key={genre.name}
              variants={fadeUp}
              onClick={() => {
                setSelectedGenre(genre.name);
                setSearchQuery("");
              }}
              className={`relative p-4 rounded-xl bg-gradient-to-br ${genre.gradient} text-white font-medium text-sm hover:opacity-90 transition-all overflow-hidden group ${
                selectedGenre === genre.name
                  ? "ring-2 ring-white/50 scale-[1.02]"
                  : ""
              }`}
            >
              <span className="relative z-10">{genre.name}</span>
              <Music2 className="absolute -bottom-1 -right-1 w-10 h-10 text-white/20 group-hover:text-white/30 transition-colors" />
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Results */}
      {searchTerm && (
        <motion.section variants={fadeUp}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)]">
              {searchQuery ? `Results for "${searchQuery}"` : `${selectedGenre} Music`}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square rounded-xl bg-accent animate-pulse" />
                  <div className="h-4 bg-accent animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-accent animate-pulse rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : tracks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tracks.map((track, i) => (
                <motion.button
                  key={track.id}
                  variants={fadeUp}
                  onClick={() => playTracks(tracks, i)}
                  className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all text-left"
                >
                  <div className="relative aspect-square bg-accent overflow-hidden">
                    {track.albumArt && !track.albumArt.includes("placeholder") ? (
                      <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center">
                        <Music2 className="w-10 h-10 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
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
            </div>
          ) : (
            <div className="text-center py-16">
              <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tracks found. Try a different search.</p>
            </div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground font-medium">
        Loading Discover...
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}
