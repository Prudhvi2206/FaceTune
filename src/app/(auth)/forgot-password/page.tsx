"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Music, Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
    // Simulate email sending (placeholder for actual email service)
    await new Promise((r) => setTimeout(r, 1500));
    setSent(true);
    setIsLoading(false);
    toast.success("If an account exists with this email, you will receive a reset link.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-[family-name:var(--font-outfit)]">
            Face<span className="gradient-text">Tune</span>
          </span>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-2">
              Check Your Email
            </h1>
            <p className="text-muted-foreground mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">
              Forgot Password?
            </h1>
            <p className="text-muted-foreground mb-8">
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
