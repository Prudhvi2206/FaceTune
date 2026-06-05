"use client";

import React, { createContext, useContext, useRef, useCallback, useEffect } from "react";
import { useStore } from "zustand";
import { createPlayerStore, type PlayerStore } from "@/stores/playerStore";

const MusicPlayerContext = createContext<ReturnType<typeof createPlayerStore> | null>(null);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createPlayerStore>>(null);
  if (storeRef.current === null) {
    storeRef.current = createPlayerStore();
  }

  return (
    <MusicPlayerContext.Provider value={storeRef.current}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function usePlayerStore<T>(selector: (state: PlayerStore) => T): T {
  const store = useContext(MusicPlayerContext);
  if (!store) {
    throw new Error("usePlayerStore must be used within MusicPlayerProvider");
  }
  return useStore(store, selector);
}
