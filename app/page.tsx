import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  Send,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  MessageSquare,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Linker — Your Professional Presence Agent",
  description:
    "Turn your work into professional momentum. Linker is your always-on AI agent that monitors your LinkedIn niche, surfaces opportunities, and crafts authentic content — so you grow without the grind.",
};

const FEATURES = [
  {
    icon: Brain,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    glow: "rgba(139,92,246,0.15)",
    title: "Professional Brain",
    description:
      "Linker builds a living model of your expertise, voice, goals, and audience — and uses it to make every post unmistakably yours.",
  },
  {
    icon: Sparkles,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    glow: "rgba(59,130,246,0.15)",
    title: "Opportunity Engine",
    description:
      "Monitors your niche 24/7 and surfaces only the signals worth acting on — so you never miss a trend, conversation, or moment.",
  },
  {
    icon: Send,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    glow: "rgba(14,165,233,0.15)",
    title: "Autonomous Publishing",
    description:
      "Drafts, critiques, schedules, and publishes with your approval — or runs fully autonomously in auto mode when you trust the system.",
  },
  {
    icon: MessageSquare,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    glow: "rgba(52,211,153,0.15)",
    title: "Telegram Control Center",
    description:
      "Review drafts, approve posts, and get strategic nudges right inside Telegram — no dashboard required.",
  },
  {
    icon: BarChart3,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    glow: "rgba(251,191,36,0.15)",
    title: "Performance Intelligence",
    description:
      "Tracks what resonates and feeds learnings back into your Brain — so your content compounds over time.",
  },
  {
    icon: Shield,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    glow: "rgba(251,113,133,0.15)",
    title: "Never Fakes It",
    description:
      "Zero fabricated experiences. Zero hollow clichés. Every post is grounded in your real work and evidence.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect LinkedIn",
    description:
      "Authorize in seconds. Linker reads your profile, posts, and niche to build your Professional Brain.",
  },
  {
    step: "02",
    title: "Connect Telegram",
    description:
      "Your command line. Receive strategic updates, review drafts, and approve content right from your phone.",
  },
  {
    step: "03",
    title: "Linker Takes Over",
    description:
      "Your agent runs continuously — observing, identifying opportunities, drafting, and publishing while you focus on actual work.",
  },
];

const STATS = [
  { value: "10×", label: "Faster content creation" },
  { value: "24/7", label: "Active niche monitoring" },
  { value: "100%", label: "Your voice, always" },
  { value: "0", label: "Fake posts ever" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[60%] -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute top-[30%] -right-40 h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      {/* ── Nav ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#090d16]/70">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Linker
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-400">
              AGENT
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* CTA */}
          <Link
            href="/api/v1/auth/linkedin"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-300 text-xs font-semibold mb-8 animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
          </span>
          Professional Presence Agent — Now Live
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white mb-6">
          Turn your work into{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            professional momentum
          </span>
        </h1>

        {/* Sub */}
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 leading-relaxed mb-10">
          Linker is your always-on LinkedIn agent. It monitors your niche,
          surfaces the right opportunities, and crafts authentic content in your
          voice — so you grow without the grind.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/api/v1/auth/linkedin"
            className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-base shadow-2xl shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50 hover:-translate-y-1"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continue with LinkedIn
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-base transition-all duration-200"
          >
            See how it works
          </a>
        </div>

        {/* Trust note */}
        <p className="mt-5 text-xs text-slate-500">
          No email. No password. Authorize with LinkedIn — get your agent running in under 2 minutes.
        </p>

        {/* Stats strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/5 bg-white/5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-[#0c1220]/80 px-6 py-8 flex flex-col items-center gap-1"
            >
              <span className="text-3xl font-extrabold bg-gradient-to-br from-blue-300 to-violet-300 bg-clip-text text-transparent">
                {s.value}
              </span>
              <span className="text-xs text-slate-500 text-center">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-14">
          <span className="inline-flex px-3 py-1 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-300 text-xs font-semibold mb-4">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Up and running in{" "}
            <span className="text-blue-400">three steps</span>
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-6">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-[33%] right-[33%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          {STEPS.map((s) => (
            <div
              key={s.step}
              className="glass-panel glass-panel-hover rounded-2xl p-7 flex flex-col gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/30 to-violet-600/30 border border-blue-500/20">
                <span className="text-base font-extrabold text-blue-300">{s.step}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-14">
          <span className="inline-flex px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-300 text-xs font-semibold mb-4">
            WHAT LINKER DOES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything your executive presence needs
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto text-base">
            Linker is not a content scheduler. It&apos;s a professional presence
            engine that thinks, observes, and acts on your behalf.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-4 group"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${f.bg}`}
              >
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-14">
          <span className="inline-flex px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-300 text-xs font-semibold mb-4">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Start free. Upgrade when you&apos;re ready.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col gap-5">
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-1">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-400 pb-1">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Get started with no credit card.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm text-slate-300">
              {[
                "Professional Brain setup",
                "Opportunity scanning",
                "Draft generation",
                "Telegram integration",
                "3 scheduled posts/month",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/api/v1/auth/linkedin"
              className="mt-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl p-8 flex flex-col gap-5 bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/30 shadow-2xl shadow-blue-500/10">
            <div className="absolute -top-3 left-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[11px] font-bold shadow-lg">
                <Sparkles className="h-3 w-3" /> MOST POPULAR
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-400 mb-1">Linker Pro</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-white">$19</span>
                <span className="text-slate-400 pb-1">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Full autonomous agent. Unlimited growth.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm text-slate-200">
              {[
                "Everything in Free",
                "Autonomous publishing mode",
                "Unlimited scheduled posts",
                "Advanced opportunity engine",
                "Full content analytics",
                "MCP access",
                "Priority Telegram updates",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/api/v1/auth/linkedin"
              className="mt-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50"
            >
              Start with Pro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative glass-panel rounded-3xl overflow-hidden p-10 sm:p-16 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-violet-600/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-300 text-xs font-semibold mb-6">
            <TrendingUp className="h-3 w-3" />
            Your professional presence is waiting
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            You do the work.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Linker tells the world.
            </span>
          </h2>

          <p className="text-slate-400 text-lg max-w-lg mx-auto mb-8">
            Join professionals who stopped grinding LinkedIn and started letting
            their agent do the momentum-building.
          </p>

          <Link
            href="/api/v1/auth/linkedin"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-2xl shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50 hover:-translate-y-1"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Activate Linker Agent
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-4 text-xs text-slate-600">
            Free tier available · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-violet-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-400">Linker</span>
            <span className="text-slate-700">·</span>
            <span>Professional Presence Agent</span>
          </div>
          <div className="flex items-center gap-5">
            <span>© 2026 Linker</span>
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
