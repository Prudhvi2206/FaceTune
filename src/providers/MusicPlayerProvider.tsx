"use client";

import React, { createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import { createPlayerStore, type PlayerStore } from "@/stores/playerStore";

const MusicPlayerContext = createContext<ReturnType<typeof createPlayerStore> | null>(null);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createPlayerStore());

  return (
    <MusicPlayerContext.Provider value={store}>
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
