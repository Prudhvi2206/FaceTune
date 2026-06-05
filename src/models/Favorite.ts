import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
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

const FavoriteSchema = new Schema<IFavorite>({
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

FavoriteSchema.index({ userId: 1, songId: 1 }, { unique: true });

const Favorite: Model<IFavorite> =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>("Favorite", FavoriteSchema);

export default Favorite;
