import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  password?: string;
  image?: string;
  favoriteGenres: string[];
  provider: "credentials" | "google" | "github";
  createdAt: Date;
  lastLogin: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
