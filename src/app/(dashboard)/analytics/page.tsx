"use client";

import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react";
import { useEmotion } from "@/providers/EmotionProvider";
import { getEmotionEmoji } from "@/lib/utils";
import type { EmotionType } from "@/types/emotion";

const emotionColors: Record<EmotionType, string> = {
  happy: "#FACC15",
  sad: "#3B82F6",
  angry: "#EF4444",
  neutral: "#9CA3AF",
  surprised: "#F59E0B",
  fearful: "#8B5CF6",
  disgusted: "#10B981",
};

export default function AnalyticsPage() {
  const { emotionHistory } = useEmotion();

  // Calculate emotion distribution
  const distribution = emotionHistory.reduce<Record<string, number>>(
    (acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    },
    {}
  );

  const total = emotionHistory.length || 1;
  const sortedEmotions = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionType,
      count,
      percentage: Math.round((count / total) * 100),
    }));

  const dominantMood = sortedEmotions[0]?.emotion || "neutral";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">Analytics</h1>
        </div>
        <p className="text-muted-foreground">Track your emotional trends and listening habits</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Detections", value: emotionHistory.length, icon: TrendingUp },
          { label: "Dominant Mood", value: `${getEmotionEmoji(dominantMood)} ${dominantMood}`, icon: PieChart },
          { label: "Unique Moods", value: Object.keys(distribution).length, icon: BarChart3 },
          { label: "Today", value: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), icon: Calendar },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold font-[family-name:var(--font-outfit)] capitalize">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Emotion Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            Emotion Distribution
          </h3>
          {sortedEmotions.length > 0 ? (
            <div className="space-y-4">
              {sortedEmotions.map(({ emotion, count, percentage }) => (
                <div key={emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 capitalize">
                      <span>{getEmotionEmoji(emotion)}</span>
                      {emotion}
                    </span>
                    <span className="text-muted-foreground">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: emotionColors[emotion] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              Start detecting emotions to see your distribution here.
            </p>
          )}
        </div>

        {/* Recent Timeline */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Recent Mood Timeline
          </h3>
          {emotionHistory.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {emotionHistory
                .slice(-20)
                .reverse()
                .map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-xl">{getEmotionEmoji(entry.emotion)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{entry.emotion}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(entry.confidence * 100)}% confidence
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              No emotion history yet. Start detection to see your timeline.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
