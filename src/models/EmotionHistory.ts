import mongoose, { Schema, Document, Model } from "mongoose";
import type { EmotionType } from "@/types/emotion";

export interface IEmotionHistory extends Document {
  userId: mongoose.Types.ObjectId;
  emotion: EmotionType;
  confidence: number;
  timestamp: Date;
  sessionId: string;
}

const EmotionHistorySchema = new Schema<IEmotionHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  emotion: {
    type: String,
    enum: ["happy", "sad", "angry", "neutral", "surprised", "fearful", "disgusted"],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
});

EmotionHistorySchema.index({ userId: 1, timestamp: -1 });

const EmotionHistory: Model<IEmotionHistory> =
  mongoose.models.EmotionHistory ||
  mongoose.model<IEmotionHistory>("EmotionHistory", EmotionHistorySchema);

export default EmotionHistory;
