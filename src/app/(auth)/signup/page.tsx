"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Music, Mail, Lock, Eye, EyeOff, Loader2, User, AtSign, ImagePlus,
} from "lucide-react";
import { signupSchema } from "@/lib/validators";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfilePreview(base64);
      setFormData((p) => ({ ...p, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] !== undefined) {
          fieldErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create account");
        return;
      }

      // Auto sign in
      const signInRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Welcome to FaceTune! 🎵");
        router.push("/home");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    signIn(provider, { callbackUrl: "/home" });
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm";

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative text-center text-white">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Music className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold font-[family-name:var(--font-outfit)] mb-4">
            Join FaceTune
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Create your account and start experiencing music that adapts to your every emotion.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {["🎵 Smart Music", "😊 Emotion AI", "📊 Analytics"].map((item) => (
              <div key={item} className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur text-sm text-center">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-outfit)]">
              Face<span className="gradient-text">Tune</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground mb-6">
            Fill in your details to get started
          </p>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuth("github")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex justify-center mb-2">
              <label className="cursor-pointer group">
                <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-border group-hover:border-primary transition-colors flex items-center justify-center overflow-hidden bg-accent">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Add photo
                </p>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="John Doe"
                    className={inputClass}
                  />
                </div>
                {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                    placeholder="johndoe"
                    className={inputClass}
                  />
                </div>
                {errors.username && <p className="text-destructive text-xs mt-1">{errors.username}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Min 8 chars, uppercase, number, special"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter your password"
                  className={inputClass}
                />
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
