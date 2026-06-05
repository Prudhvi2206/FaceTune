"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Music,
  BarChart3,
  Sparkles,
  Camera,
  Headphones,
  Heart,
  Zap,
  ArrowRight,
  Play,
  Star,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const emotions = [
  { emoji: "😊", label: "Happy", color: "from-amber-400 to-orange-500" },
  { emoji: "😔", label: "Sad", color: "from-blue-400 to-cyan-500" },
  { emoji: "😠", label: "Angry", color: "from-rose-500 to-pink-600" },
  { emoji: "😐", label: "Neutral", color: "from-slate-400 to-zinc-500" },
  { emoji: "😲", label: "Surprised", color: "from-yellow-400 to-amber-500" },
  { emoji: "😨", label: "Fearful", color: "from-violet-400 to-indigo-500" },
  { emoji: "🤢", label: "Disgusted", color: "from-emerald-400 to-teal-500" },
];

const features = [
  {
    icon: Camera,
    title: "Real-Time Detection",
    description: "Advanced AI analyzes your facial expressions through your webcam in real time with 7 emotion categories.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Music,
    title: "Smart Music Matching",
    description: "Our engine maps your emotions to the perfect music genres, moods, and playlists automatically.",
    gradient: "from-pink-500 to-fuchsia-600",
  },
  {
    icon: Headphones,
    title: "Premium Streaming",
    description: "Stream millions of songs from Audius with YouTube as a fallback. High quality, zero ads.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: BarChart3,
    title: "Mood Analytics",
    description: "Track your emotional trends daily, weekly, and monthly with beautiful charts and heatmaps.",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    icon: Brain,
    title: "AI Personalization",
    description: "The more you use FaceTune, the smarter it gets. Personalized playlists powered by your history.",
    gradient: "from-sky-500 to-cyan-600",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "All emotion detection happens locally in your browser. Your face data never leaves your device.",
    gradient: "from-purple-500 to-pink-600",
  },
];

const steps = [
  {
    step: "01",
    title: "Enable Your Camera",
    description: "Allow webcam access so our AI can see your facial expressions. Everything stays on your device.",
    icon: Camera,
  },
  {
    step: "02",
    title: "AI Detects Your Mood",
    description: "MediaPipe analyzes 52 facial landmarks to determine your current emotion with high accuracy.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Music Plays Automatically",
    description: "Based on your mood, we curate and stream the perfect songs, playlists, and genres for you.",
    icon: Headphones,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Music Enthusiast",
    avatar: "SC",
    content: "FaceTune completely changed how I discover music. It knows what I need to hear before I do!",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Software Developer",
    avatar: "MR",
    content: "I use it while coding. The focus music when I'm neutral and energy boosts when I'm tired are perfect.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Yoga Instructor",
    avatar: "AP",
    content: "The mood analytics help me understand my emotional patterns. Plus the meditation music is spot on.",
    rating: 5,
  },
];

const stats = [
  { value: "7", label: "Emotions Detected" },
  { value: "10M+", label: "Songs Available" },
  { value: "52", label: "Facial Landmarks" },
  { value: "<100ms", label: "Detection Speed" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-outfit)]">
                Face<span className="gradient-text">Tune</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium rounded-full gradient-primary text-white hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Effects — Aurora mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-pink-500/10 animate-aurora" style={{ backgroundSize: '300% 300%' }} />
          <div className="absolute top-[15%] left-[20%] w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px] animate-orb-drift" />
          <div className="absolute bottom-[20%] right-[15%] w-96 h-96 bg-pink-500/15 rounded-full blur-[130px] animate-orb-drift" style={{ animationDelay: '3s' }} />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[160px] animate-orb-drift" style={{ animationDelay: '5s' }} />
          <div className="absolute top-[60%] left-[10%] w-40 h-40 bg-cyan-400/15 rounded-full blur-[80px] animate-float" />
          <div className="absolute top-[10%] right-[30%] w-32 h-32 bg-fuchsia-400/10 rounded-full blur-[70px] animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-4 h-4" />
                AI-Powered Music Experience
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-outfit)] leading-tight mb-6"
            >
              Music That Feels
              <br />
              <span className="gradient-text">What You Feel</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              FaceTune uses advanced AI to detect your emotions through your
              webcam and automatically plays music that matches your mood in
              real time.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group flex items-center gap-2 px-8 py-3.5 rounded-full gradient-primary text-white font-medium text-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/25 gradient-glow"
              >
                <Play className="w-5 h-5" />
                Start Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-border text-foreground font-medium text-lg hover:bg-accent transition-colors"
              >
                See How It Works
              </a>
            </motion.div>

            {/* Floating Emotion Bubbles */}
            <motion.div
              variants={fadeUp}
              className="mt-16 flex flex-wrap items-center justify-center gap-3"
            >
              {emotions.map((e, i) => (
                <motion.div
                  key={e.label}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${e.color} text-white text-sm font-medium shadow-lg`}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  <span className="text-lg">{e.emoji}</span>
                  {e.label}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl font-bold gradient-text font-[family-name:var(--font-outfit)]">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              <Zap className="w-3 h-3" />
              Features
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)]"
            >
              Everything You Need for
              <br />
              <span className="gradient-text">Mood-Based Music</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-[family-name:var(--font-outfit)]">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-accent/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              <TrendingUp className="w-3 h-3" />
              How It Works
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)]"
            >
              Three Simple Steps to
              <br />
              <span className="gradient-text">Perfect Music</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className="relative text-center"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="relative mx-auto w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                  <step.icon className="w-10 h-10 text-white" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-[family-name:var(--font-outfit)]">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              <Users className="w-3 h-3" />
              Testimonials
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)]"
            >
              Loved by <span className="gradient-text">Music Lovers</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center relative"
        >
          <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-xl" />
          <div className="relative p-12 md:p-16 rounded-3xl gradient-border bg-card">
            <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              Ready to Feel the Music?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Join FaceTune today and experience a personalized music journey
              powered by your emotions. It&apos;s free to get started.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-primary text-white font-medium text-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/25 gradient-glow"
            >
              <Sparkles className="w-5 h-5" />
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-[family-name:var(--font-outfit)]">
              FaceTune
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FaceTune. AI-powered music for every mood.
          </p>
        </div>
      </footer>
    </div>
  );
}
