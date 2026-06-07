"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Sun, Moon, Camera, Music, Shield, User, Bell } from "lucide-react";
import { toast } from "sonner";

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? "bg-primary" : "bg-muted"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const toggleSwitch = (
    value: boolean,
    setter: (v: boolean) => void,
    label: string
  ) => {
    setter(!value);
    toast.success(`${label} ${!value ? "enabled" : "disabled"}`);
  };

  const settingsSections = [
    {
      title: "Appearance",
      icon: Sun,
      items: [
        {
          label: "Dark Mode",
          description: "Switch between light and dark themes",
          control: (
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <ToggleSwitch
                enabled={theme === "dark"}
                onToggle={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  toast.success(`Switched to ${theme === "dark" ? "light" : "dark"} mode`);
                }}
              />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          ),
        },
      ],
    },
    {
      title: "Emotion Detection",
      icon: Camera,
      items: [
        {
          label: "Webcam Detection",
          description: "Enable real-time facial emotion detection",
          control: (
            <ToggleSwitch
              enabled={webcamEnabled}
              onToggle={() => toggleSwitch(webcamEnabled, setWebcamEnabled, "Webcam detection")}
            />
          ),
        },
        {
          label: "Auto Music Switching",
          description: "Automatically switch music when your emotion changes",
          control: (
            <ToggleSwitch
              enabled={autoSwitch}
              onToggle={() => toggleSwitch(autoSwitch, setAutoSwitch, "Auto music switching")}
            />
          ),
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          label: "Push Notifications",
          description: "Receive notifications for recommendations and updates",
          control: (
            <ToggleSwitch
              enabled={notifications}
              onToggle={() => toggleSwitch(notifications, setNotifications, "Notifications")}
            />
          ),
        },
      ],
    },
    {
      title: "Privacy",
      icon: Shield,
      items: [
        {
          label: "Data Processing",
          description: "All emotion detection is processed locally on your device",
          control: (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
              On-Device
            </span>
          ),
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">Settings</h1>
        </div>
        <p className="text-muted-foreground">Customize your FaceTune experience</p>
      </div>

      {settingsSections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <section.icon className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">{section.title}</h2>
          </div>
          <div className="divide-y divide-border">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
                {item.control}
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
