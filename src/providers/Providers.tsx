"use client";

if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args[0];
    if (typeof msg === "string") {
      if (
        msg.includes("Encountered a script tag while rendering React component") ||
        msg.includes("XNNPACK delegate") ||
        msg.includes("TensorFlow Lite") ||
        msg.includes("WebGL") ||
        msg.includes("delegate for")
      ) {
        return; // Ignore dev console warnings/informational messages that trigger Next.js overlays
      }
    }
    originalError(...args);
  };
}

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { MusicPlayerProvider } from "./MusicPlayerProvider";
import { EmotionProvider } from "./EmotionProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <EmotionProvider>
            <MusicPlayerProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "hsl(var(--card))",
                    color: "hsl(var(--card-foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                }}
              />
            </MusicPlayerProvider>
          </EmotionProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
