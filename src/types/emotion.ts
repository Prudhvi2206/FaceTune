// ============================================
// Emotion Types
// ============================================

export type EmotionType =
  | "happy"
  | "sad"
  | "angry"
  | "neutral"
  | "surprised"
  | "fearful"
  | "disgusted";

export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  allEmotions: Record<EmotionType, number>;
  timestamp: number;
}

export interface DetectionResult {
  emotion: EmotionResult;
  landmarks: NormalizedLandmark[];
  boundingBox: BoundingBox | null;
  blendshapes: Record<string, number>;
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EmotionHistoryEntry {
  _id?: string;
  userId: string;
  emotion: EmotionType;
  confidence: number;
  timestamp: Date;
  sessionId: string;
}
