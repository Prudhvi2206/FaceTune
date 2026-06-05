import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomMoodTrack extends Document {
  userId: mongoose.Types.ObjectId;
  emotion: "happy" | "sad" | "angry" | "neutral" | "surprised" | "fearful" | "disgusted";
  songId: string;
  songName: string;
  artistName: string;
  albumArt: string;
  source: "audius" | "youtube";
  streamUrl?: string;
  youtubeId?: string;
  duration: number;
  addedAt: Date;
}

const CustomMoodTrackSchema = new Schema<ICustomMoodTrack>({
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
    index: true,
  },
  songId: { type: String, required: true },
  songName: { type: String, required: true },
  artistName: { type: String, required: true },
  albumArt: { type: String, default: "" },
  source: {
    type: String,
    enum: ["audius", "youtube"],
    default: "audius",
  },
  streamUrl: { type: String, default: "" },
  youtubeId: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate song mappings for the same user and emotion
CustomMoodTrackSchema.index({ userId: 1, emotion: 1, songId: 1 }, { unique: true });

const CustomMoodTrack: Model<ICustomMoodTrack> =
  mongoose.models.CustomMoodTrack ||
  mongoose.model<ICustomMoodTrack>("CustomMoodTrack", CustomMoodTrackSchema);

export default CustomMoodTrack;
