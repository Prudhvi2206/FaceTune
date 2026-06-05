import type { EmotionType, EmotionResult, NormalizedLandmark, BoundingBox } from "@/types/emotion";

// MediaPipe blendshape names we care about
const BLENDSHAPE_NAMES = {
  browDownLeft: "browDownLeft",
  browDownRight: "browDownRight",
  browInnerUp: "browInnerUp",
  browOuterUpLeft: "browOuterUpLeft",
  browOuterUpRight: "browOuterUpRight",
  cheekSquintLeft: "cheekSquintLeft",
  cheekSquintRight: "cheekSquintRight",
  eyeSquintLeft: "eyeSquintLeft",
  eyeSquintRight: "eyeSquintRight",
  eyeWideLeft: "eyeWideLeft",
  eyeWideRight: "eyeWideRight",
  jawForward: "jawForward",
  jawOpen: "jawOpen",
  mouthFrownLeft: "mouthFrownLeft",
  mouthFrownRight: "mouthFrownRight",
  mouthSmileLeft: "mouthSmileLeft",
  mouthSmileRight: "mouthSmileRight",
  mouthPressLeft: "mouthPressLeft",
  mouthPressRight: "mouthPressRight",
  mouthStretchLeft: "mouthStretchLeft",
  mouthStretchRight: "mouthStretchRight",
  mouthUpperUpLeft: "mouthUpperUpLeft",
  mouthUpperUpRight: "mouthUpperUpRight",
  noseSneerLeft: "noseSneerLeft",
  noseSneerRight: "noseSneerRight",
};

type BlendshapeMap = Record<string, number>;

function avg(...values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Rule-based blendshape-to-emotion classifier.
 * Returns scores for each emotion based on specific blendshape thresholds.
 */
function classifyEmotion(bs: BlendshapeMap): Record<EmotionType, number> {
  const smile = avg(bs.mouthSmileLeft || 0, bs.mouthSmileRight || 0);
  const frown = avg(bs.mouthFrownLeft || 0, bs.mouthFrownRight || 0);
  const browDown = avg(bs.browDownLeft || 0, bs.browDownRight || 0);
  const browInnerUp = bs.browInnerUp || 0;
  const browOuterUp = avg(bs.browOuterUpLeft || 0, bs.browOuterUpRight || 0);
  const eyeWide = avg(bs.eyeWideLeft || 0, bs.eyeWideRight || 0);
  const cheekSquint = avg(bs.cheekSquintLeft || 0, bs.cheekSquintRight || 0);
  const jawOpen = bs.jawOpen || 0;
  const jawForward = bs.jawForward || 0;
  const noseSneer = avg(bs.noseSneerLeft || 0, bs.noseSneerRight || 0);
  const mouthPress = avg(bs.mouthPressLeft || 0, bs.mouthPressRight || 0);
  const mouthStretch = avg(bs.mouthStretchLeft || 0, bs.mouthStretchRight || 0);
  const mouthUpperUp = avg(bs.mouthUpperUpLeft || 0, bs.mouthUpperUpRight || 0);
  const eyeSquint = avg(bs.eyeSquintLeft || 0, bs.eyeSquintRight || 0);

  // Happy: smile + cheek squint
  const happy = clamp01(smile * 1.5 + cheekSquint * 0.5 - frown * 0.5);

  // Sad: frown + brow inner up + eye squint + mouth press + no smile
  // MediaPipe frown values are subtle, so we boost the multipliers
  const sad = clamp01(
    frown * 2.0 + browInnerUp * 1.0 + eyeSquint * 0.4 + mouthPress * 0.3 - smile * 0.8
  );

  // Angry: brow down + jaw forward + mouth press
  const angry = clamp01(browDown * 1.5 + jawForward * 0.5 + mouthPress * 0.4 + noseSneer * 0.3 - smile * 0.5);

  // Surprised: eye wide + jaw open + brow outer up
  const surprised = clamp01(eyeWide * 1.0 + jawOpen * 0.7 + browOuterUp * 0.5 - browDown * 0.3);

  // Fearful: eye wide + brow inner up + mouth stretch (without jaw open surprise)
  const fearful = clamp01(
    eyeWide * 0.8 + browInnerUp * 0.7 + mouthStretch * 0.5 - jawOpen * 0.3
  );

  // Disgusted: nose sneer + mouth upper up
  const disgusted = clamp01(noseSneer * 1.4 + mouthUpperUp * 0.6 - smile * 0.3);

  // Neutral: inverse of max expression intensity
  // Lower threshold so subtle expressions can break through
  const maxExpression = Math.max(happy, sad, angry, surprised, fearful, disgusted);
  const neutral = clamp01(1 - maxExpression * 2.5);

  return { happy, sad, angry, neutral, surprised, fearful, disgusted };
}

export function processBlendshapes(
  blendshapeCategories: Array<{ categoryName: string; score: number }>
): EmotionResult {
  // Convert array to map
  const bs: BlendshapeMap = {};
  for (const category of blendshapeCategories) {
    bs[category.categoryName] = category.score;
  }

  const scores = classifyEmotion(bs);

  // Find dominant emotion
  let maxScore = 0;
  let dominantEmotion: EmotionType = "neutral";

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion as EmotionType;
    }
  }

  return {
    emotion: dominantEmotion,
    confidence: Math.round(maxScore * 100) / 100,
    allEmotions: scores,
    timestamp: Date.now(),
  };
}

export function extractLandmarks(
  faceLandmarks: Array<{ x: number; y: number; z: number }>
): NormalizedLandmark[] {
  return faceLandmarks.map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z,
  }));
}

export function extractBoundingBox(
  landmarks: NormalizedLandmark[],
  videoWidth: number,
  videoHeight: number
): BoundingBox | null {
  if (landmarks.length === 0) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const lm of landmarks) {
    if (lm.x < minX) minX = lm.x;
    if (lm.y < minY) minY = lm.y;
    if (lm.x > maxX) maxX = lm.x;
    if (lm.y > maxY) maxY = lm.y;
  }

  const padding = 0.05;
  return {
    x: Math.max(0, (minX - padding) * videoWidth),
    y: Math.max(0, (minY - padding) * videoHeight),
    width: Math.min(videoWidth, (maxX - minX + padding * 2) * videoWidth),
    height: Math.min(videoHeight, (maxY - minY + padding * 2) * videoHeight),
  };
}
