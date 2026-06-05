import mongoose, { Schema, Document, Model } from "mongoose";

export interface IListeningHistory extends Document {
  userId: mongoose.Types.ObjectId;
  songId: string;
  songName: string;
  artistName: string;
  albumArt?: string;
  emotionDuringPlayback: string;
  source: "audius" | "youtube";
  youtubeId?: string;
  duration: number;
  timestamp: Date;
}

const ListeningHistorySchema = new Schema<IListeningHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  songId: { type: String, required: true },
  songName: { type: String, required: true },
  artistName: { type: String, required: true },
  albumArt: { type: String, default: "" },
  emotionDuringPlayback: {
    type: String,
    enum: ["happy", "sad", "angry", "neutral", "surprised", "fearful", "disgusted"],
    default: "neutral",
  },
  source: {
    type: String,
    enum: ["audius", "youtube"],
    default: "audius",
  },
  youtubeId: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

ListeningHistorySchema.index({ userId: 1, timestamp: -1 });

const ListeningHistory: Model<IListeningHistory> =
  mongoose.models.ListeningHistory ||
  mongoose.model<IListeningHistory>("ListeningHistory", ListeningHistorySchema);

export default ListeningHistory;
