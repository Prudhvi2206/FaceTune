import { createStore } from "zustand/vanilla";
import type { Track } from "@/types/music";

export interface PlayerStore {
  // State
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: "off" | "one" | "all";
  isMini: boolean;
  isFullscreen: boolean;
  isQueueOpen: boolean;

  // Actions
  playTrack: (track: Track) => void;
  playTracks: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleMini: () => void;
  toggleFullscreen: () => void;
  toggleQueue: () => void;
}

export const createPlayerStore = () =>
  createStore<PlayerStore>((set, get) => ({
    currentTrack: null,
    queue: [],
    history: [],
    isPlaying: false,
    volume: 0.7,
    progress: 0,
    duration: 0,
    shuffle: false,
    repeat: "off",
    isMini: false,
    isFullscreen: false,
    isQueueOpen: false,

    playTrack: (track) => {
      const { currentTrack } = get();
      if (currentTrack) {
        set((s) => ({ history: [...s.history.slice(-49), currentTrack] }));
      }
      set({ currentTrack: track, isPlaying: true, progress: 0 });
    },

    playTracks: (tracks, startIndex = 0) => {
      const track = tracks[startIndex];
      const queue = tracks.filter((_, i) => i > startIndex);
      set({ currentTrack: track, queue, isPlaying: true, progress: 0 });
    },

    togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
    setPlaying: (playing) => set({ isPlaying: playing }),

    nextTrack: () => {
      const { queue, currentTrack, shuffle, repeat, history } = get();
      if (queue.length === 0 && repeat === "one") {
        set({ progress: 0 });
        return;
      }

      const newHistory = currentTrack
        ? [...history.slice(-49), currentTrack]
        : history;

      if (queue.length === 0) {
        if (repeat === "all" && history.length > 0) {
          set({
            currentTrack: newHistory[0],
            queue: newHistory.slice(1),
            history: [],
            progress: 0,
          });
        } else {
          set({ isPlaying: false });
        }
        return;
      }

      const nextIndex = shuffle ? Math.floor(Math.random() * queue.length) : 0;
      const next = queue[nextIndex];
      const newQueue = queue.filter((_, i) => i !== nextIndex);

      set({
        currentTrack: next,
        queue: newQueue,
        history: newHistory,
        progress: 0,
      });
    },

    prevTrack: () => {
      const { history, currentTrack, queue } = get();
      if (get().progress > 3) {
        set({ progress: 0 });
        return;
      }
      if (history.length === 0) return;

      const prev = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      const newQueue = currentTrack ? [currentTrack, ...queue] : queue;

      set({
        currentTrack: prev,
        queue: newQueue,
        history: newHistory,
        progress: 0,
      });
    },

    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),
    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

    toggleRepeat: () =>
      set((s) => ({
        repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
      })),

    addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),

    removeFromQueue: (index) =>
      set((s) => ({ queue: s.queue.filter((_, i) => i !== index) })),

    clearQueue: () => set({ queue: [] }),
    toggleMini: () => set((s) => ({ isMini: !s.isMini })),
    toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
    toggleQueue: () => set((s) => ({ isQueueOpen: !s.isQueueOpen })),
  }));
