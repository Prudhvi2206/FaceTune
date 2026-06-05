"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { usePlayerStore } from "@/providers/MusicPlayerProvider";
import YouTube from "react-youtube";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, ListMusic, Maximize2, Minimize2,
  Heart, X, ChevronDown, Trash2, Music2, Smile
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { toast } from "sonner";

export function MusicPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const isMini = usePlayerStore((s) => s.isMini);
  const isFullscreen = usePlayerStore((s) => s.isFullscreen);
  const isQueueOpen = usePlayerStore((s) => s.isQueueOpen);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleMini = usePlayerStore((s) => s.toggleMini);
  const toggleFullscreen = usePlayerStore((s) => s.toggleFullscreen);
  const toggleQueue = usePlayerStore((s) => s.toggleQueue);
  const queue = usePlayerStore((s) => s.queue);
  const history = usePlayerStore((s) => s.history);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playTracks = usePlayerStore((s) => s.playTracks);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  const audioRef = useRef<HTMLAudioElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const miniProgressBarRef = useRef<HTMLDivElement>(null);
  const fullscreenProgressBarRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Load favorites to toggle Heart status
  const { data: favsData } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) return { favorites: [] };
      return res.json();
    },
  });

  const favoritesList = favsData?.favorites || [];
  const isFavorite = currentTrack
    ? favoritesList.some((f: any) => f.songId === currentTrack.id)
    : false;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!currentTrack) return;
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: currentTrack.id,
          songName: currentTrack.title,
          artistName: currentTrack.artist,
          albumArt: currentTrack.albumArt,
          duration: currentTrack.duration,
          streamUrl: currentTrack.streamUrl,
          source: currentTrack.source,
          youtubeId: currentTrack.youtubeId,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      if (data?.action === "added") {
        toast.success("Added to favorites");
      } else {
        toast.success("Removed from favorites");
      }
    },
  });

  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState(false);

  // Load custom mood tracks
  const { data: customMoodData } = useQuery({
    queryKey: ["custom-mood-tracks"],
    queryFn: async () => {
      const res = await fetch("/api/emotions/custom");
      if (!res.ok) return { tracks: [] };
      return res.json();
    },
  });

  const customMoodTracks = customMoodData?.tracks || [];

  const toggleMoodMutation = useMutation({
    mutationFn: async (emotion: string) => {
      if (!currentTrack) return;
      const res = await fetch("/api/emotions/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion,
          songId: currentTrack.id,
          songName: currentTrack.title,
          artistName: currentTrack.artist,
          albumArt: currentTrack.albumArt,
          source: currentTrack.source,
          streamUrl: currentTrack.streamUrl,
          youtubeId: currentTrack.youtubeId,
          duration: currentTrack.duration,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["custom-mood-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["custom-tracks"] });
      if (data?.action === "added") {
        toast.success(`Assigned to ${data.track.emotion} mood`);
      } else {
        toast.success(`Removed from ${data.track.emotion} mood`);
      }
    },
  });

  // Handle switching audio sources securely
  useEffect(() => {
    if (!currentTrack) return;

    if (currentTrack.source === "audius") {
      // Pause YouTube if switching back to Audius
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }

      if (audioRef.current) {
        audioRef.current.src = currentTrack.streamUrl;
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    } else if (currentTrack.source === "youtube") {
      // Pause Audius if switching to YouTube
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById(currentTrack.youtubeId);
          if (isPlaying) {
            ytPlayerRef.current.playVideo();
          } else {
            ytPlayerRef.current.pauseVideo();
          }
        } catch {}
      }
    }
  }, [currentTrack]);

  // Sync play/pause commands to the active source player
  useEffect(() => {
    if (!currentTrack) return;

    if (isPlaying) {
      if (currentTrack.source === "audius" && audioRef.current) {
        audioRef.current.play().catch(() => {});
      } else if (currentTrack.source === "youtube" && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.playVideo();
        } catch {}
      }
    } else {
      if (currentTrack.source === "audius" && audioRef.current) {
        audioRef.current.pause();
      } else if (currentTrack.source === "youtube" && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }
    }
  }, [isPlaying, currentTrack]);

  // Sync volume level to both players
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (ytPlayerRef.current && currentTrack?.source === "youtube") {
      try {
        ytPlayerRef.current.setVolume(volume * 100);
      } catch {}
    }
  }, [volume, currentTrack]);

  // YouTube active progress check interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack?.source === "youtube" && ytPlayerRef.current) {
      interval = setInterval(() => {
        try {
          const time = ytPlayerRef.current.getCurrentTime();
          setProgress(time);
          const dur = ytPlayerRef.current.getDuration();
          if (dur && dur !== duration) {
            setDuration(dur);
          }
        } catch {}
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, duration, setProgress, setDuration]);

  // Audius state hooks
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && currentTrack?.source === "audius") {
      setProgress(audioRef.current.currentTime);
    }
  }, [setProgress, currentTrack]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && currentTrack?.source === "audius") {
      setDuration(audioRef.current.duration);
    }
  }, [setDuration, currentTrack]);

  const handleEnded = useCallback(() => {
    if (repeat === "one") {
      if (currentTrack?.source === "audius" && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else if (currentTrack?.source === "youtube" && ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(0);
        ytPlayerRef.current.playVideo();
      }
      setProgress(0);
    } else {
      nextTrack();
    }
  }, [repeat, nextTrack, currentTrack, setProgress]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>, targetRef: React.RefObject<HTMLDivElement | null>) => {
    if (!targetRef.current || !currentTrack) return;
    const rect = targetRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;

    if (currentTrack.source === "audius" && audioRef.current) {
      audioRef.current.currentTime = time;
    } else if (currentTrack.source === "youtube" && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(time, true);
      } catch {}
    }
    setProgress(time);
  };

  const handlePrev = () => {
    if (progress > 3 || history.length === 0) {
      if (currentTrack?.source === "audius" && audioRef.current) {
        audioRef.current.currentTime = 0;
      } else if (currentTrack?.source === "youtube" && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.seekTo(0, true);
        } catch {}
      }
      setProgress(0);
    } else {
      prevTrack();
    }
  };

  const handleNext = () => {
    if (queue.length === 0 && repeat === "one") {
      if (currentTrack?.source === "audius" && audioRef.current) {
        audioRef.current.currentTime = 0;
      } else if (currentTrack?.source === "youtube" && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.seekTo(0, true);
        } catch {}
      }
      setProgress(0);
    } else {
      nextTrack();
    }
  };

  const startDrag = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    targetRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (!targetRef.current || !currentTrack) return;
    setIsDragging(true);

    const getClientX = (event: any) => {
      if (event.touches && event.touches.length > 0) {
        return event.touches[0].clientX;
      }
      return event.clientX;
    };

    const calculateTime = (clientX: number) => {
      if (!targetRef.current) return 0;
      const rect = targetRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return percent * duration;
    };

    const clientX = getClientX(e);
    const initialTime = calculateTime(clientX);
    setDragProgress(initialTime);

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentClientX = (moveEvent as TouchEvent).touches && (moveEvent as TouchEvent).touches.length > 0
        ? (moveEvent as TouchEvent).touches[0].clientX
        : (moveEvent as MouseEvent).clientX;
      const time = calculateTime(currentClientX);
      setDragProgress(time);
    };

    const handleMouseUp = (upEvent: MouseEvent | TouchEvent) => {
      const finalClientX = (upEvent as TouchEvent).changedTouches && (upEvent as TouchEvent).changedTouches.length > 0
        ? (upEvent as TouchEvent).changedTouches[0].clientX
        : (upEvent as MouseEvent).clientX;
      const finalTime = calculateTime(finalClientX);
      
      if (currentTrack.source === "audius" && audioRef.current) {
        audioRef.current.currentTime = finalTime;
      } else if (currentTrack.source === "youtube" && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.seekTo(finalTime, true);
        } catch {}
      }
      setProgress(finalTime);

      setIsDragging(false);
      setDragProgress(null);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);
  };

  if (!currentTrack) return null;

  const displayProgress = dragProgress !== null ? dragProgress : progress;
  const progressPercent = duration > 0 ? (displayProgress / duration) * 100 : 0;

  return (
    <>
      {/* HTML5 Audio Player */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Hidden YouTube Player */}
      {currentTrack.source === "youtube" && (
        <div className="hidden">
          <YouTube
            videoId={currentTrack.youtubeId}
            opts={{
              height: "0",
              width: "0",
              playerVars: {
                autoplay: isPlaying ? 1 : 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
              },
            }}
            onReady={(event) => {
              ytPlayerRef.current = event.target;
              try {
                ytPlayerRef.current.setVolume(volume * 100);
                setDuration(ytPlayerRef.current.getDuration() || 0);
                if (isPlaying) {
                  ytPlayerRef.current.playVideo();
                }
              } catch {}
            }}
            onStateChange={(event) => {
              // event.data: 0 = ended, 1 = playing, 2 = paused
              if (event.data === 0) {
                handleEnded();
              } else if (event.data === 1) {
                setPlaying(true);
              } else if (event.data === 2) {
                setPlaying(false);
              }
            }}
            onError={() => {
              toast.error("Failed to play YouTube track. Skipping...");
              nextTrack();
            }}
          />
        </div>
      )}

      {/* Floating sliding Queue Drawer */}
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed right-0 top-0 w-80 md:w-96 bg-card/95 backdrop-blur-xl border-l border-border z-40 p-6 flex flex-col shadow-2xl",
              isMini ? "bottom-16" : "bottom-24"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg font-[family-name:var(--font-outfit)]">Play Queue</h3>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-accent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
                <button
                  onClick={toggleQueue}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Now Playing */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Now Playing
                </span>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
                    {currentTrack.albumArt ? (
                      <img src={currentTrack.albumArt} alt={currentTrack.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                        <Music2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                  </div>
                </div>
              </div>

              {/* Next Up */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Next Up ({queue.length})
                </span>
                {queue.length > 0 ? (
                  <div className="space-y-1.5">
                    {queue.map((track, i) => (
                      <div
                        key={`${track.id}-${i}`}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-accent/60 transition-all cursor-pointer"
                      >
                        <div
                          onClick={() => playTracks([currentTrack, ...queue], i + 1)}
                          className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-accent relative"
                        >
                          {track.albumArt ? (
                            <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                              <Music2 className="w-4 h-4" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                        <div
                          onClick={() => playTracks([currentTrack, ...queue], i + 1)}
                          className="min-w-0 flex-1"
                        >
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {track.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <button
                          onClick={() => removeFromQueue(i)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-6">
                    Queue is empty. Add songs from Discover or home.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Premium Apple Music-style Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: "40px" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "40px" }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col p-6 md:p-12 overflow-y-auto"
          >
            {/* Ambient album art aura shadow background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 select-none">
              <div
                className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] bg-cover bg-center filter blur-[100px] scale-110"
                style={{ backgroundImage: `url(${currentTrack.albumArt})` }}
              />
            </div>

            {/* Header controls */}
            <div className="relative flex items-center justify-between w-full max-w-5xl mx-auto z-10">
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full border border-border bg-card/40 backdrop-blur-md flex items-center justify-center hover:bg-accent transition-colors"
              >
                <ChevronDown className="w-6 h-6 text-foreground" />
              </button>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Now Playing
              </span>
              <button
                onClick={toggleQueue}
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center transition-colors backdrop-blur-md",
                  isQueueOpen
                    ? "bg-primary border-primary text-white"
                    : "border-border bg-card/40 hover:bg-accent text-foreground"
                )}
              >
                <ListMusic className="w-5 h-5" />
              </button>
            </div>

            {/* Main content grid */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-5xl mx-auto z-10 py-6">
              {/* Rotating breathing glowing cover art */}
              <div className="flex-1 flex justify-center">
                <motion.div
                  animate={{
                    scale: isPlaying ? [1, 1.03, 1] : 1,
                    boxShadow: isPlaying
                      ? [
                          "0 20px 60px rgba(0, 200, 255, 0.35)",
                          "0 20px 60px rgba(100, 100, 255, 0.55)",
                          "0 20px 60px rgba(0, 200, 255, 0.35)",
                        ]
                      : "0 20px 60px rgba(0, 0, 0, 0.4)",
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] rounded-3xl overflow-hidden bg-accent relative border border-white/10"
                >
                  {currentTrack.albumArt ? (
                    <img
                      src={currentTrack.albumArt}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center text-white text-5xl">
                      <Music2 className="w-20 h-20" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Title, controls, and volume */}
              <div className="flex-1 flex flex-col justify-center w-full max-w-md">
                <div className="flex items-center justify-between mb-8">
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-outfit)] truncate leading-tight">
                      {currentTrack.title}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground truncate mt-1">
                      {currentTrack.artist}
                    </p>
                  </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleFavoriteMutation.mutate()}
                    disabled={toggleFavoriteMutation.isPending}
                    className="w-12 h-12 rounded-full hover:bg-accent flex items-center justify-center transition-colors border border-border"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-transform active:scale-90",
                        isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
                      )}
                    />
                  </button>

                  {/* Fullscreen Custom Mood Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMoodMenuOpen(!isMoodMenuOpen)}
                      className={cn(
                        "w-12 h-12 rounded-full hover:bg-accent flex items-center justify-center transition-colors border border-border",
                        isMoodMenuOpen ? "text-primary bg-primary/10 border-primary/30" : "text-muted-foreground"
                      )}
                      title="Assign to Mood"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {isMoodMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-14 right-0 w-44 bg-card/98 border border-border rounded-xl shadow-xl z-50 p-2 backdrop-blur-md"
                        >
                          <p className="text-[10px] font-bold text-muted-foreground/80 px-2 py-1 uppercase select-none">
                            Map to Mood
                          </p>
                          <div className="space-y-0.5 mt-1">
                            {[
                              { key: "happy", name: "Happy", emoji: "😊" },
                              { key: "sad", name: "Sad", emoji: "😢" },
                              { key: "angry", name: "Angry", emoji: "😠" },
                              { key: "neutral", name: "Neutral", emoji: "😐" },
                              { key: "surprised", name: "Surprised", emoji: "😲" },
                              { key: "fearful", name: "Fearful", emoji: "😨" },
                              { key: "disgusted", name: "Disgusted", emoji: "🤢" },
                            ].map((mood) => {
                              const isAssigned = customMoodTracks.some(
                                (t: any) => t.songId === currentTrack.id && t.emotion === mood.key
                              );
                              return (
                                <button
                                  key={mood.key}
                                  onClick={() => {
                                    toggleMoodMutation.mutate(mood.key);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors hover:bg-accent",
                                    isAssigned ? "text-primary bg-primary/5 font-medium" : "text-foreground"
                                  )}
                                >
                                  <span>{mood.emoji} {mood.name}</span>
                                  {isAssigned && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                </div>

                {/* Progress bar timeline */}
                <div className="space-y-2.5 mb-8">
                  <div
                    ref={fullscreenProgressBarRef}
                    className="h-2 bg-muted rounded-full cursor-pointer relative group"
                    onMouseDown={(e) => startDrag(e, fullscreenProgressBarRef)}
                    onTouchStart={(e) => startDrag(e, fullscreenProgressBarRef)}
                  >
                    <div
                      className="h-full gradient-primary rounded-full relative transition-all"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-primary scale-0 group-hover:scale-100 transition-transform duration-150" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                    <span>{formatDuration(displayProgress)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>

                {/* Buttons controls */}
                <div className="flex items-center justify-center gap-6 md:gap-8 mb-10">
                  <button
                    onClick={toggleShuffle}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                      shuffle ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePrev}
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-accent text-foreground hover:text-primary transition-all active:scale-95"
                  >
                    <SkipBack className="w-7 h-7" fill="currentColor" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-cyan-500/25 active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" fill="currentColor" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" fill="currentColor" />
                    )}
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-accent text-foreground hover:text-primary transition-all active:scale-95"
                  >
                    <SkipForward className="w-7 h-7" fill="currentColor" />
                  </button>
                  <button
                    onClick={toggleRepeat}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                      repeat !== "off" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {repeat === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                  </button>
                </div>

                {/* Volume slider control */}
                <div className="flex items-center gap-3 px-4 py-2 border border-border bg-card/20 backdrop-blur-md rounded-2xl">
                  <button
                    onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-primary cursor-pointer rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main player bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 bg-card/90 backdrop-blur-xl border-t border-border/50 transition-all",
          isMini ? "h-16" : "h-24"
        )}
      >
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="absolute top-0 left-0 right-0 h-1 bg-muted cursor-pointer group"
          onMouseDown={(e) => startDrag(e, progressBarRef)}
          onTouchStart={(e) => startDrag(e, progressBarRef)}
        >
          <div
            className="h-full gradient-primary transition-all relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="h-full flex items-center justify-between px-4 md:px-6 pt-1">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-[30%] min-w-0">
            <div
              onClick={toggleFullscreen}
              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent cursor-pointer group relative"
            >
              {currentTrack.albumArt ? (
                <img
                  src={currentTrack.albumArt}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center">
                  <ListMusic className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="min-w-0 cursor-pointer" onClick={toggleFullscreen}>
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {currentTrack.title}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={() => toggleFavoriteMutation.mutate()}
              disabled={toggleFavoriteMutation.isPending}
              className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 ml-2"
            >
              <Heart className={cn("w-4 h-4", isFavorite ? "fill-primary text-primary" : "")} />
            </button>

            {/* Custom Mood Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMoodMenuOpen(!isMoodMenuOpen)}
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors flex-shrink-0 ml-2 relative p-1 rounded-full hover:bg-accent/40",
                  isMoodMenuOpen ? "text-primary bg-primary/10" : ""
                )}
                title="Assign to Mood"
              >
                <Smile className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isMoodMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-10 left-0 w-44 bg-card/98 border border-border rounded-xl shadow-xl z-50 p-2 backdrop-blur-md"
                  >
                    <p className="text-[10px] font-bold text-muted-foreground/80 px-2 py-1 uppercase select-none">
                      Map to Mood
                    </p>
                    <div className="space-y-0.5 mt-1">
                      {[
                        { key: "happy", name: "Happy", emoji: "😊" },
                        { key: "sad", name: "Sad", emoji: "😢" },
                        { key: "angry", name: "Angry", emoji: "😠" },
                        { key: "neutral", name: "Neutral", emoji: "😐" },
                        { key: "surprised", name: "Surprised", emoji: "😲" },
                        { key: "fearful", name: "Fearful", emoji: "😨" },
                        { key: "disgusted", name: "Disgusted", emoji: "🤢" },
                      ].map((mood) => {
                        const isAssigned = customMoodTracks.some(
                          (t: any) => t.songId === currentTrack.id && t.emotion === mood.key
                        );
                        return (
                          <button
                            key={mood.key}
                            onClick={() => {
                              toggleMoodMutation.mutate(mood.key);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors hover:bg-accent",
                              isAssigned ? "text-primary bg-primary/5 font-medium" : "text-foreground"
                            )}
                          >
                            <span>{mood.emoji} {mood.name}</span>
                            {isAssigned && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-[10px] font-bold uppercase text-muted-foreground/60 px-1.5 py-0.5 border border-border/60 bg-accent/30 rounded-md hidden lg:inline ml-2 select-none">
              {currentTrack.source}
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-1 w-[40%]">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                  shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrev}
                className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <SkipBack className="w-5 h-5" fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/25 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                )}
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <SkipForward className="w-5 h-5" fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                  repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {repeat === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>
            {!isMini && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground w-full max-w-md">
                <span className="w-10 text-right">{formatDuration(displayProgress)}</span>
                <div
                  ref={miniProgressBarRef}
                  className="flex-1 h-2 bg-muted rounded-full cursor-pointer relative group"
                  onMouseDown={(e) => startDrag(e, miniProgressBarRef)}
                  onTouchStart={(e) => startDrag(e, miniProgressBarRef)}
                >
                  <div
                    className="h-full gradient-primary rounded-full relative transition-all"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md border-2 border-primary scale-0 group-hover:scale-100 transition-transform duration-150" />
                  </div>
                </div>
                <span className="w-10">{formatDuration(duration)}</span>
              </div>
            )}
          </div>

          {/* Volume & Extras */}
          <div className="flex items-center gap-3 w-[30%] justify-end">
            <button
              onClick={toggleQueue}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isQueueOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <ListMusic className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2 w-28">
              <button
                onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-primary cursor-pointer bg-muted rounded-full outline-none"
              />
            </div>
            <button
              onClick={toggleMini}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMini ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
