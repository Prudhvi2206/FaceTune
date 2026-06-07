"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { EmotionType, EmotionResult } from "@/types/emotion";

interface EmotionContextType {
  currentEmotion: EmotionResult | null;
  emotionHistory: EmotionResult[];
  isDetecting: boolean;
  setCurrentEmotion: (result: EmotionResult) => void;
  setIsDetecting: (detecting: boolean) => void;
  clearHistory: () => void;
}

const EmotionContext = createContext<EmotionContextType | null>(null);

export function EmotionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [currentEmotion, setCurrentEmotionState] = useState<EmotionResult | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionResult[]>([]);
  const [isDetecting, setIsDetectingState] = useState(false);
  const lastEmotionRef = useRef<EmotionType | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Hydrate history from MongoDB on mount/auth change
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/emotions?limit=100")
        .then((res) => res.json())
        .then((data) => {
          if (data?.history) {
            const mappedHistory = data.history.map((h: any) => ({
              emotion: h.emotion,
              confidence: h.confidence,
              timestamp: new Date(h.timestamp).getTime(),
              allEmotions: h.allEmotions || {},
            }));
            // History from API is descending, reverse it to match local chronological history state
            setEmotionHistory(mappedHistory.reverse());
          }
        })
        .catch((err) => console.error("Failed to load emotion history from DB:", err));
    }
  }, [status]);

  const setIsDetecting = useCallback((detecting: boolean) => {
    setIsDetectingState(detecting);
    if (!detecting) {
      sessionIdRef.current = null;
    } else if (!sessionIdRef.current) {
      sessionIdRef.current = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
  }, []);

  const setCurrentEmotion = useCallback((result: EmotionResult) => {
    setCurrentEmotionState(result);

    // Only add to history when emotion changes
    if (result.emotion !== lastEmotionRef.current) {
      lastEmotionRef.current = result.emotion;
      setEmotionHistory((prev) => [...prev.slice(-99), result]);

      // Persist to MongoDB if authenticated
      if (status === "authenticated") {
        if (!sessionIdRef.current) {
          sessionIdRef.current = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        }
        fetch("/api/emotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emotion: result.emotion,
            confidence: result.confidence,
            sessionId: sessionIdRef.current,
          }),
        }).catch((err) => console.error("Failed to persist emotion:", err));
      }
    }
  }, [status]);

  const clearHistory = useCallback(async () => {
    setEmotionHistory([]);
    lastEmotionRef.current = null;

    if (status === "authenticated") {
      try {
        const res = await fetch("/api/emotions", {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("Mood history cleared from database");
        } else {
          toast.error("Failed to clear database logs");
        }
      } catch (err) {
        console.error("Failed to delete emotion history:", err);
        toast.error("An error occurred while clearing history");
      }
    } else {
      toast.success("Local mood history cleared");
    }
  }, [status]);

  return (
    <EmotionContext.Provider
      value={{
        currentEmotion,
        emotionHistory,
        isDetecting,
        setCurrentEmotion,
        setIsDetecting,
        clearHistory,
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
}

export function useEmotion() {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error("useEmotion must be used within an EmotionProvider");
  }
  return context;
}
