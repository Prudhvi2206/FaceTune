"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { processBlendshapes, extractLandmarks, extractBoundingBox } from "@/lib/emotion-detector";
import type { EmotionResult, NormalizedLandmark, BoundingBox } from "@/types/emotion";

interface UseEmotionDetectionOptions {
  onEmotionChange?: (result: EmotionResult) => void;
  detectionInterval?: number; // ms between detections, default 100 (10 FPS)
  stabilityThreshold?: number; // how many consistent readings before changing, default 3
}

interface UseEmotionDetectionReturn {
  currentEmotion: EmotionResult | null;
  landmarks: NormalizedLandmark[];
  boundingBox: BoundingBox | null;
  isDetecting: boolean;
  isLoading: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startDetection: () => Promise<void>;
  stopDetection: () => void;
}

export function useEmotionDetection(
  options: UseEmotionDetectionOptions = {}
): UseEmotionDetectionReturn {
  const {
    onEmotionChange,
    detectionInterval = 100,
    stabilityThreshold = 3,
  } = options;

  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[]>([]);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceLandmarkerRef = useRef<unknown>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const lastEmotionRef = useRef<string | null>(null);
  const stabilityCountRef = useRef(0);
  const lastDetectionTimeRef = useRef(0);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startDetection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Dynamically import MediaPipe to avoid SSR issues
      const { FaceLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath: "/models/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
          runningMode: "VIDEO",
          numFaces: 1,
        }
      );

      faceLandmarkerRef.current = faceLandmarker;
      setIsDetecting(true);
      setIsLoading(false);

      // Detection loop
      const detect = () => {
        if (!videoRef.current || !faceLandmarkerRef.current) return;
        if (videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        const now = performance.now();
        if (now - lastDetectionTimeRef.current < detectionInterval) {
          animFrameRef.current = requestAnimationFrame(detect);
          return;
        }
        lastDetectionTimeRef.current = now;

        try {
          const results = (faceLandmarkerRef.current as {
            detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
              faceBlendshapes?: Array<{ categories: Array<{ categoryName: string; score: number }> }>;
              faceLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
            };
          }).detectForVideo(videoRef.current, now);

          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const blendshapes = results.faceBlendshapes[0].categories;
            const emotionResult = processBlendshapes(blendshapes);

            // Stability check
            if (emotionResult.emotion === lastEmotionRef.current) {
              stabilityCountRef.current++;
            } else {
              stabilityCountRef.current = 1;
              lastEmotionRef.current = emotionResult.emotion;
            }

            if (stabilityCountRef.current >= stabilityThreshold) {
              setCurrentEmotion(emotionResult);
              onEmotionChange?.(emotionResult);
            }

            // Update landmarks
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              const lms = extractLandmarks(results.faceLandmarks[0]);
              setLandmarks(lms);

              const bb = extractBoundingBox(
                lms,
                videoRef.current!.videoWidth,
                videoRef.current!.videoHeight
              );
              setBoundingBox(bb);
            }
          } else {
            setLandmarks([]);
            setBoundingBox(null);
          }
        } catch {
          // Silently handle detection errors per frame
        }

        animFrameRef.current = requestAnimationFrame(detect);
      };

      animFrameRef.current = requestAnimationFrame(detect);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start detection";
      setError(
        message.includes("NotAllowed") || message.includes("Permission")
          ? "Camera access denied. Please allow camera access to use emotion detection."
          : message
      );
      setIsLoading(false);
    }
  }, [detectionInterval, stabilityThreshold, onEmotionChange]);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    currentEmotion,
    landmarks,
    boundingBox,
    isDetecting,
    isLoading,
    error,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
  };
}
