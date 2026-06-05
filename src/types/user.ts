// ============================================
// User Types
// ============================================

export interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  image?: string;
  favoriteGenres: string[];
  provider: "credentials" | "google" | "github";
  createdAt: Date;
  lastLogin: Date;
}

export interface UserSettings {
  darkMode: boolean;
  webcamEnabled: boolean;
  autoMusicSwitch: boolean;
  privacyMode: boolean;
}
