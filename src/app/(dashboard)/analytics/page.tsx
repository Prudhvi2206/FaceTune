"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useEmotion } from "@/providers/EmotionProvider";
import { getEmotionEmoji } from "@/lib/utils";
import type { EmotionType } from "@/types/emotion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const emotionColors: Record<EmotionType, string> = {
  happy: "#FACC15",
  sad: "#3B82F6",
  angry: "#EF4444",
  neutral: "#9CA3AF",
  surprised: "#F59E0B",
  fearful: "#8B5CF6",
  disgusted: "#10B981",
};

const valenceMap: Record<EmotionType, number> = {
  happy: 3,
  surprised: 2,
  neutral: 1,
  sad: -1,
  angry: -2,
  fearful: -2,
  disgusted: -1,
};

export default function AnalyticsPage() {
  const { emotionHistory } = useEmotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) {
        setMounted(true);
      }
    }, 0);
    return () => {
      active = false;
    };
  }, []);

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

  // Format data for PieChart
  const pieData = sortedEmotions.map(({ emotion, count, percentage }) => ({
    name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    value: count,
    percentage,
    color: emotionColors[emotion],
  }));

  // Format data for Timeline AreaChart (chronological order)
  const timelineData = emotionHistory.slice(-15).map((entry, idx) => {
    const dateObj = new Date(entry.timestamp);
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return {
      index: idx + 1,
      time,
      emotion: entry.emotion,
      emoji: getEmotionEmoji(entry.emotion),
      valence: valenceMap[entry.emotion] || 0,
      confidence: Math.round(entry.confidence * 100),
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto pb-12"
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
          { label: "Dominant Mood", value: `${getEmotionEmoji(dominantMood)} ${dominantMood}`, icon: PieChartIcon },
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

      {/* Charts section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart: Emotion Distribution */}
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col h-[400px]">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-primary" />
            Emotion Distribution Share
          </h3>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 relative min-h-0">
            {mounted && emotionHistory.length > 0 ? (
              <>
                <div className="w-full sm:w-1/2 h-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 rounded-xl border border-border bg-popover text-popover-foreground text-xs shadow-xl backdrop-blur-md">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-muted-foreground mt-1">
                                  Detections: {data.value} ({data.percentage}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 flex flex-col gap-2 max-h-full overflow-y-auto pr-1">
                  {sortedEmotions.map(({ emotion, percentage, count }) => (
                    <div key={emotion} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: emotionColors[emotion] }}
                        />
                        <span className="capitalize">
                          {getEmotionEmoji(emotion)} {emotion}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center w-full">
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-muted-foreground">No distribution data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start detecting emotions to see your distribution.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Area Chart: Mood Trend Timeline */}
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col h-[400px]">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Vibe & Mood Progression
          </h3>

          <div className="flex-1 min-h-0">
            {mounted && emotionHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--gradient-start))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--gradient-end))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <YAxis
                    domain={[-3, 3]}
                    ticks={[-2, 0, 2]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (val > 0) return "Pos";
                      if (val < 0) return "Neg";
                      return "Neu";
                    }}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl border border-border bg-popover text-popover-foreground text-xs shadow-xl backdrop-blur-md space-y-1">
                            <p className="font-semibold text-muted-foreground">{data.time}</p>
                            <p className="text-sm flex items-center gap-1.5 capitalize font-bold">
                              <span>{data.emoji}</span>
                              <span>{data.emotion}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Confidence: <span className="text-primary font-medium">{data.confidence}%</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valence"
                    stroke="hsl(var(--gradient-start))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValence)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-muted-foreground">No progression data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chronological progression charts will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Timeline Table */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Recent Mood Logs
        </h3>
        {emotionHistory.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {emotionHistory
              .slice(-20)
              .reverse()
              .map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/50 border border-transparent hover:border-border transition-all"
                >
                  <span className="text-2xl">{getEmotionEmoji(entry.emotion)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{entry.emotion}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(entry.confidence * 100)}% confidence
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })} at{" "}
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
    </motion.div>
  );
}
