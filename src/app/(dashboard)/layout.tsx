"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MusicPlayer } from "@/components/music/MusicPlayer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={`relative flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
        }`}
      >
        <Header />
        <main className="flex-1 p-6 pb-28 overflow-y-auto">{children}</main>
        <MusicPlayer />
      </div>
    </div>
  );
}
