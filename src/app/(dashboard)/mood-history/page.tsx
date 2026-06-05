"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useEmotion } from "@/providers/EmotionProvider";
import { getEmotionEmoji } from "@/lib/utils";

export default function MoodHistoryPage() {
  const { emotionHistory, clearHistory } = useEmotion();

  const grouped = emotionHistory.reduce<Record<string, typeof emotionHistory>>(
    (acc, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    },
    {}
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">Mood History</h1>
          </div>
          <p className="text-muted-foreground">Your emotional journey over time</p>
        </div>
        {emotionHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
          >
            Clear History
          </button>
        )}
      </div>

      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped)
            .reverse()
            .map(([date, entries]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-1">
                  {date}
                </h3>
                <div className="space-y-2">
                  {entries
                    .slice()
                    .reverse()
                    .map((entry, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
                      >
                        <span className="text-2xl">{getEmotionEmoji(entry.emotion)}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm capitalize">{entry.emotion}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full gradient-primary"
                                style={{ width: `${entry.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(entry.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No mood history yet</h3>
          <p className="text-muted-foreground text-sm">
            Start detecting emotions from the Home page to build your mood history.
          </p>
        </div>
      )}
    </motion.div>
  );
}
