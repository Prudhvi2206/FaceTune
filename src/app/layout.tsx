import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "FaceTune – AI-Powered Emotion-Based Music",
  description:
    "Experience music that matches your mood. FaceTune uses AI-powered facial emotion detection to recommend the perfect songs in real time.",
  keywords: [
    "AI music",
    "emotion detection",
    "facial recognition",
    "mood music",
    "music streaming",
    "personalized playlists",
  ],
  openGraph: {
    title: "FaceTune – AI-Powered Emotion-Based Music",
    description:
      "Experience music that matches your mood. AI-powered facial emotion detection recommends the perfect songs in real time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
