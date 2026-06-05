"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Music2, BarChart3, Clock, Heart } from "lucide-react";
import { useEmotion } from "@/providers/EmotionProvider";
import { getEmotionEmoji } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { emotionHistory } = useEmotion();

  const user = session?.user as Record<string, unknown> | undefined;
  const fullName = (user?.fullName as string) || session?.user?.name || "User";
  const username = (user?.username as string) || "user";
  const email = session?.user?.email || "";
  const image = session?.user?.image || "";

  // Calculate stats
  const moodCounts = emotionHistory.reduce<Record<string, number>>((acc, e) => {
    acc[e.emotion] = (acc[e.emotion] || 0) + 1;
    return acc;
  }, {});

  const topMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Profile Header */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-32 gradient-primary relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="w-24 h-24 rounded-full border-4 border-card overflow-hidden bg-accent">
            {image ? (
              <img src={image} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="mt-3">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">{fullName}</h1>
            <p className="text-muted-foreground">@{username}</p>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Detections", value: emotionHistory.length, icon: BarChart3 },
          { label: "Top Mood", value: topMood ? `${getEmotionEmoji(topMood[0])} ${topMood[0]}` : "N/A", icon: Heart },
          { label: "Unique Moods", value: Object.keys(moodCounts).length, icon: Music2 },
          { label: "Sessions", value: "1", icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl border border-border bg-card">
            <stat.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold font-[family-name:var(--font-outfit)] capitalize">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mood Distribution */}
      {Object.keys(moodCounts).length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 font-[family-name:var(--font-outfit)]">Your Mood Profile</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(moodCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, count]) => (
                <div
                  key={emotion}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-accent/50"
                >
                  <span className="text-lg">{getEmotionEmoji(emotion)}</span>
                  <span className="text-sm font-medium capitalize">{emotion}</span>
                  <span className="text-xs text-muted-foreground">×{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
