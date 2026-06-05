"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Home,
  Compass,
  Clock,
  Music2,
  Heart,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/mood-history", icon: Clock, label: "Mood History" },
  { href: "/recommendations", icon: Music2, label: "Recommendations" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar-background border-r border-sidebar-border overflow-hidden"
    >
      {/* Ambient aurora glow along the right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link href="/home" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
            <Music className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold font-[family-name:var(--font-outfit)] whitespace-nowrap"
            >
              Face<span className="gradient-text">Tune</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "gradient-primary text-white shadow-lg shadow-cyan-500/20"
                  : "text-sidebar-foreground hover:bg-cyan-500/5 hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform",
                  isActive && "scale-110"
                )}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/80"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full px-3 py-2 rounded-xl text-sidebar-foreground hover:bg-cyan-500/5 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
