"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Music2, TrendingUp, Clock, Sparkles, Play, X, Smile, Trash2 } from "lucide-react";
import { useEmotion } from "@/providers/EmotionProvider";
import { useEmotionDetection } from "@/hooks/useEmotionDetection";
import { usePlayerStore } from "@/providers/MusicPlayerProvider";
import { getGreeting, getEmotionEmoji } from "@/lib/utils";
import { getRandomQuery } from "@/lib/emotion-music-mapper";
import { toast } from "sonner";
import type { Track } from "@/types/music";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

function TrackCard({ track, onPlay }: { track: Track; onPlay: () => void }) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={onPlay}
      className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 text-left"
    >
      <div className="relative aspect-square bg-accent overflow-hidden">
        {track.albumArt && !track.albumArt.includes("placeholder") ? (
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full gradient-primary flex items-center justify-center">
            <Music2 className="w-10 h-10 text-white/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg shadow-cyan-500/30">
            <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
      </div>
    </motion.button>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const { currentEmotion, setCurrentEmotion, setIsDetecting } = useEmotion();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playTracks = usePlayerStore((s) => s.playTracks);

  const queryClient = useQueryClient();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeManageMood, setActiveManageMood] = useState<string>("happy");

  // Fetch all custom mood tracks mapping
  const { data: customTracksData } = useQuery({
    queryKey: ["custom-tracks"],
    queryFn: async () => {
      const res = await fetch("/api/emotions/custom");
      if (!res.ok) return { tracks: [] };
      return res.json();
    },
  });

  const allCustomTracks = customTracksData?.tracks || [];

  // Mutation to delete a custom mood track mapping
  const deleteCustomTrackMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/emotions/custom?id=${id}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["custom-mood-tracks"] });
      toast.success("Removed track from mood configuration");
    },
  });

  const {
    currentEmotion: detectedEmotion,
    isDetecting,
    isLoading: detectionLoading,
    videoRef,
    startDetection,
    stopDetection,
  } = useEmotionDetection({
    onEmotionChange: (result) => {
      setCurrentEmotion(result);
      setIsDetecting(true);
    },
  });

  const emotion = currentEmotion?.emotion || detectedEmotion?.emotion || "neutral";
  const confidence = currentEmotion?.confidence || detectedEmotion?.confidence || 0;

  // Map database customized tracks for currently active emotion
  const customizedTracks: Track[] = allCustomTracks
    .filter((t: any) => t.emotion === emotion)
    .map((t: any) => ({
      id: t.songId,
      title: t.songName,
      artist: t.artistName,
      albumArt: t.albumArt,
      duration: t.duration,
      streamUrl: t.streamUrl,
      source: t.source,
      youtubeId: t.youtubeId,
    }));

  // Fetch recommended tracks based on current emotion
  const { data: recommendedData } = useQuery({
    queryKey: ["recommended", emotion],
    queryFn: async () => {
      const query = getRandomQuery(emotion as "happy" | "sad" | "angry" | "neutral" | "surprised" | "fearful" | "disgusted");
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&limit=12`);
      return res.json();
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch trending tracks
  const { data: trendingData } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const res = await fetch("/api/music/trending?limit=12");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  const recommendedTracks: Track[] = recommendedData?.tracks || [];
  const trendingTracks: Track[] = trendingData?.tracks || [];

  const userName =
    (session?.user as Record<string, unknown>)?.fullName as string ||
    session?.user?.name ||
    "User";

  const handleToggleDetection = () => {
    if (isDetecting) {
      stopDetection();
      setIsDetecting(false);
    } else {
      startDetection();
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Welcome */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">
          {getGreeting()}, {userName.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Let your emotions guide the music
        </p>
      </motion.div>

      {/* Top Row - Webcam + Emotion Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Webcam Feed */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-500"
          style={isDetecting ? { boxShadow: '0 0 25px rgba(0, 200, 255, 0.12), 0 0 50px rgba(100, 100, 255, 0.06)' } : {}}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Live Emotion Detection</span>
            </div>
            <button
              onClick={handleToggleDetection}
              disabled={detectionLoading}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                isDetecting
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "gradient-primary text-white hover:opacity-90"
              }`}
            >
              {detectionLoading
                ? "Loading AI..."
                : isDetecting
                ? "Stop Detection"
                : "Start Detection"}
            </button>
          </div>

          <div className="relative aspect-video bg-accent/50 flex items-center justify-center webcam-container">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {!isDetecting && !detectionLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Click &quot;Start Detection&quot; to enable your webcam
                </p>
              </div>
            )}
            {isDetecting && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white font-medium">Live</span>
                </div>
                <div className="glass rounded-xl px-4 py-2">
                  <span className="text-2xl mr-2">{getEmotionEmoji(emotion)}</span>
                  <span className="text-sm text-white font-medium capitalize">{emotion}</span>
                  <span className="text-xs text-white/60 ml-2">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Emotion Status Card */}
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 glass-cyan">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Current Mood
            </h3>
            <div className="text-center">
              <div className="text-6xl mb-3">{getEmotionEmoji(emotion)}</div>
              <h2 className="text-2xl font-bold capitalize font-[family-name:var(--font-outfit)]">
                {emotion}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Confidence: {Math.round(confidence * 100)}%
              </p>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div
                  className="h-full rounded-full gradient-primary transition-all duration-500 shadow-sm shadow-cyan-500/30"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Songs Today</span>
                <span className="text-sm font-medium">{trendingTracks.length > 0 ? "12" : "0"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dominant Mood</span>
                <span className="text-sm font-medium capitalize">{emotion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Detection</span>
                <span className={`text-sm font-medium ${isDetecting ? "text-green-500" : "text-muted-foreground"}`}>
                  {isDetecting ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Customized Moods Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium">Customized Moods</h3>
              </div>
              <button
                onClick={() => setIsManageModalOpen(true)}
                className="text-xs text-primary hover:underline font-medium"
              >
                Manage
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: "happy", name: "Happy", emoji: "😊" },
                { key: "sad", name: "Sad", emoji: "😢" },
                { key: "angry", name: "Angry", emoji: "😠" },
                { key: "neutral", name: "Neutral", emoji: "😐" },
                { key: "surprised", name: "Surprised", emoji: "😲" },
                { key: "fearful", name: "Fearful", emoji: "😨" },
                { key: "disgusted", name: "Disgusted", emoji: "🤢" },
              ].slice(0, 4).map((mood) => {
                const count = allCustomTracks.filter((t: any) => t.emotion === mood.key).length;
                return (
                  <div key={mood.key} className="flex items-center justify-between p-2 rounded-lg bg-accent/40">
                    <span className="truncate">{mood.emoji} {mood.name}</span>
                    <span className="font-semibold text-primary">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Customized Mood Songs */}
      {customizedTracks.length > 0 && (
        <motion.section variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] gradient-text">
                Your Customized {getEmotionEmoji(emotion)} Songs
              </h2>
            </div>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {customizedTracks.map((track, i) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={() => playTracks(customizedTracks, i)}
              />
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Recommended for Your Mood */}
      <motion.section variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">
              Recommended for {getEmotionEmoji(emotion)} <span className="gradient-text">{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
            </h2>
          </div>
        </div>
        <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommendedTracks.slice(0, 6).map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={() => playTracks(recommendedTracks, i)}
            />
          ))}
          {recommendedTracks.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-accent animate-pulse" />
            ))}
        </motion.div>
      </motion.section>

      {/* Trending Now */}
      <motion.section variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">
              Trending Now
            </h2>
          </div>
        </div>
        <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trendingTracks.slice(0, 6).map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={() => playTracks(trendingTracks, i)}
            />
          ))}
          {trendingTracks.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-accent animate-pulse" />
            ))}
        </motion.div>
      </motion.section>

      {/* Manage Customized Moods Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">
                    Customize Mood Mappings
                  </h2>
                </div>
                <button
                  onClick={() => setIsManageModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mood Selection Tabs */}
              <div className="flex border-b border-border overflow-x-auto scrollbar-none px-4 bg-accent/20">
                {[
                  { key: "happy", name: "Happy", emoji: "😊" },
                  { key: "sad", name: "Sad", emoji: "😢" },
                  { key: "angry", name: "Angry", emoji: "😠" },
                  { key: "neutral", name: "Neutral", emoji: "😐" },
                  { key: "surprised", name: "Surprised", emoji: "😲" },
                  { key: "fearful", name: "Fearful", emoji: "😨" },
                  { key: "disgusted", name: "Disgusted", emoji: "🤢" },
                ].map((mood) => {
                  const count = allCustomTracks.filter((t: any) => t.emotion === mood.key).length;
                  const isActive = activeManageMood === mood.key;
                  return (
                    <button
                      key={mood.key}
                      onClick={() => setActiveManageMood(mood.key)}
                      className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-medium text-xs transition-all whitespace-nowrap ${
                        isActive
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{mood.emoji} {mood.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tracks List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {allCustomTracks.filter((t: any) => t.emotion === activeManageMood).length > 0 ? (
                  allCustomTracks
                    .filter((t: any) => t.emotion === activeManageMood)
                    .map((track: any) => (
                      <div
                        key={track._id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-accent/20 group hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-accent flex-shrink-0 relative">
                            {track.albumArt && !track.albumArt.includes("placeholder") ? (
                              <img src={track.albumArt} alt={track.songName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full gradient-primary flex items-center justify-center text-white">
                                <Music2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{track.songName}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              playTrack({
                                id: track.songId,
                                title: track.songName,
                                artist: track.artistName,
                                albumArt: track.albumArt,
                                duration: track.duration,
                                streamUrl: track.streamUrl,
                                source: track.source,
                                youtubeId: track.youtubeId,
                              });
                            }}
                            className="p-1.5 rounded-full hover:bg-accent text-primary hover:text-primary-foreground transition-all"
                            title="Play Song"
                          >
                            <Play className="w-4 h-4" fill="currentColor" />
                          </button>
                          <button
                            onClick={() => {
                              deleteCustomTrackMutation.mutate(track._id);
                            }}
                            disabled={deleteCustomTrackMutation.isPending}
                            className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <Smile className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3 animate-bounce" />
                    <p className="text-sm font-semibold">No Custom Mood Songs</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Assign songs to this mood by clicking the Smile emoji icon in the music player.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
