"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Search, Sun, Moon, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) {
        setMounted(true);
      }
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userName =
    (session?.user as Record<string, unknown>)?.fullName as string ||
    session?.user?.name ||
    "User";

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, playlists..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-accent/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-border hover:bg-cyan-500/5 hover:border-primary/30 transition-all"
          title="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <button className="w-9 h-9 rounded-xl flex items-center justify-center border border-border hover:bg-cyan-500/5 hover:border-primary/30 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full gradient-primary border-2 border-background" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-md shadow-cyan-500/20">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {userName.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
