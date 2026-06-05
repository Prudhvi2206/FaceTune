import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getEmotionEmoji(emotion: string): string {
  const emojis: Record<string, string> = {
    happy: "😊",
    sad: "😔",
    angry: "😠",
    neutral: "😐",
    surprised: "😲",
    fearful: "😨",
    disgusted: "🤢",
  };
  return emojis[emotion.toLowerCase()] || "😐";
}

export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    happy: "var(--emotion-happy)",
    sad: "var(--emotion-sad)",
    angry: "var(--emotion-angry)",
    neutral: "var(--emotion-neutral)",
    surprised: "var(--emotion-surprised)",
    fearful: "var(--emotion-fearful)",
    disgusted: "var(--emotion-disgusted)",
  };
  return colors[emotion.toLowerCase()] || colors.neutral;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
