import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Sparkles,
  Brain,
  Send,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Check,
  X,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Linker — Your Professional Presence Agent",
  description:
    "Turn your work into professional momentum. Linker is your always-on AI agent that monitors your LinkedIn niche, surfaces opportunities, and crafts authentic content in your voice.",
};

const FEATURES = [
  {
    icon: Brain,
    color: "text-[#0a66c2]",
    bg: "bg-blue-50",
    border: "border-blue-100",
    title: "Professional Brain",
    description:
      "Linker builds a living model of your expertise, voice, goals, and audience — making every drafted post unmistakably yours.",
  },
  {
    icon: Sparkles,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    title: "Opportunity Engine",
    description:
      "Monitors your niche 24/7 and surfaces high-signal conversations and trending industry topics worth contributing to.",
  },
  {
    icon: Send,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
    title: "Autonomous Publishing",
    description:
      "Drafts, critiques, schedules, and publishes with your explicit review — or runs in verified autopilot when you activate auto mode.",
  },
  {
    icon: MessageSquare,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Telegram Control Center",
    description:
      "Review generated drafts, approve posts, and direct your AI agent with quick voice or text commands right from Telegram.",
  },
  {
    icon: BarChart3,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Performance Intelligence",
    description:
      "Tracks reach, engagement, and profile growth, feeding performance insights back into your Brain to compound over time.",
  },
  {
    icon: ShieldCheck,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    title: "Never Fakes It",
    description:
      "Zero fabricated statistics, zero empty clichés. Every post is strictly grounded in your actual work and verified knowledge base.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect LinkedIn",
    description:
      "Authorize securely via official LinkedIn OAuth 2.0. Linker indexes your profile and existing posts to calibrate your tone.",
  },
  {
    step: "02",
    title: "Connect Telegram",
    description:
      "Your mobile command deck. Receive real-time draft notifications, review post critiques, and approve in a single tap.",
  },
  {
    step: "03",
    title: "Linker Takes Over",
    description:
      "Your agent operates continuously — monitoring your industry, capturing ideas, drafting insights, and growing your presence.",
  },
];

const STATS = [
  { value: "10×", label: "Faster content creation" },
  { value: "24/7", label: "Active niche monitoring" },
  { value: "100%", label: "Your voice, always" },
  { value: "0", label: "Fake posts ever" },
];

const COMPARISON = [
  {
    feature: "Content Source",
    generic: "Recycled internet clichés & generic advice",
    linker: "Your actual projects, daily journal & verified expertise",
  },
  {
    feature: "LinkedIn Integration",
    generic: "Dangerous browser scrapers & session cookie hacks",
    linker: "100% official LinkedIn OAuth 2.0 Partner API",
  },
  {
    feature: "Review Control",
    generic: "Unchecked auto-posting or manual copy-pasting",
    linker: "Instant Telegram notifications with one-tap approval",
  },
  {
    feature: "Voice Calibration",
    generic: "Obvious 'As an AI...' corporate filler",
    linker: "Calibrated to your exact professional perspective",
  },
  {
    feature: "Data Privacy",
    generic: "Your thoughts used to train public LLMs",
    linker: "Isolated workspace, zero public model training",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-blue-100 selection:text-[#0a66c2]">

      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-black text-sm shadow-sm">
              in
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Linker<span className="text-[#0a66c2]">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#0a66c2] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#0a66c2] transition-colors">How It Works</a>
            <a href="#comparison" className="hover:text-[#0a66c2] transition-colors">Why Linker</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">
                Get Started <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">

          {/* Badge */}
          <Badge variant="default" className="mb-6 py-1.5 px-4 text-xs font-semibold">
            <ShieldCheck size={14} className="text-[#0a66c2]" />
            Official LinkedIn API • Human-in-the-Loop AI
          </Badge>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12] mb-6 max-w-4xl">
            Your LinkedIn presence,{" "}
            <span className="text-[#0a66c2]">on autopilot.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl leading-relaxed mb-8 sm:mb-10">
            Turn your real projects and engineering breakthroughs into high-signal LinkedIn content.
            Linker monitors your niche 24/7, drafts in your authentic voice, and publishes with your sign-off.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-10">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <Zap size={18} />
                Start Building Your Presence
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl" className="w-full sm:w-auto">
              <Link href="/dashboard">
                Open Workspace
              </Link>
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-500 mb-12 sm:mb-16">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              100% LinkedIn Safe (OAuth 2.0)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Telegram Instant Approvals
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Zero Hallucinated Metrics
            </span>
          </div>

          {/* ── App Preview Mockup (Clean Light Theme) ── */}
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/40 bg-white overflow-hidden text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="ml-2 text-xs font-mono text-slate-500 bg-white px-2.5 py-0.5 rounded border border-slate-200 hidden sm:inline-block">
                  linker-studio.vercel.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Agent Active • 24/7 Monitoring
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-4 sm:p-6 bg-slate-50/50 space-y-4">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500">Drafts Ready</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">3 Pending</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500">Weekly Goal</div>
                  <div className="text-xl font-black text-[#0a66c2] mt-0.5">4 / 4 Scheduled</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500">Signal Score</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">98% Grounded</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500">Telegram Bot</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">Connected</div>
                </div>
              </div>

              {/* Draft Review Card */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">AI Draft #104</Badge>
                    <Badge variant="warning">Awaiting Approval</Badge>
                  </div>
                  <span className="text-xs text-slate-400">Pillar: <strong className="text-slate-700">Engineering Architecture</strong></span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  &ldquo;Most developers migrate tools for speed, but fail to measure developer feedback loops. When we migrated our build pipeline last quarter, our median build time dropped from 4.2m to 48s. Here are the 3 non-obvious bottlenecks we encountered...&rdquo;
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Performance</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Verified Evidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard">Edit</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/dashboard">
                        <Check size={14} /> Approve & Publish
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="border-y border-slate-100 bg-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#0a66c2] tracking-tight">{s.value}</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0a66c2]">Capabilities</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Built for professionals who protect their credibility
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-base sm:text-lg">
              Every feature compounds your reach while guaranteeing that your content is grounded in reality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color, bg, border }) => (
              <Card key={title} className="hover:shadow-md hover:border-blue-200 transition-all">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${bg} ${border}`}>
                    <Icon size={22} className={color} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0a66c2]">Simple Setup</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Three steps to a compounding presence
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-base sm:text-lg">
              Set it up in minutes. Linker manages the background research, drafting, and scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((s) => (
              <Card key={s.step} className="border-slate-200 hover:shadow-md transition-all">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a66c2] border border-blue-100 flex items-center justify-center font-black text-sm mb-6">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Section ── */}
      <section id="comparison" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0a66c2]">Comparison</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Why Linker over generic AI chatbots
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-base sm:text-lg">
              Generic bots produce spam that burns your professional reputation. Linker grounds every word in your actual work.
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-3">Capability</div>
              <div className="col-span-4 text-slate-400">Generic AI Bots</div>
              <div className="col-span-5 text-[#0a66c2]">Linker Grounded Agent</div>
            </div>
            <div className="divide-y divide-slate-100">
              {COMPARISON.map((c) => (
                <div key={c.feature} className="grid grid-cols-12 p-4 sm:p-5 items-center text-sm gap-2">
                  <div className="col-span-3 font-semibold text-slate-800">{c.feature}</div>
                  <div className="col-span-4 text-slate-500 flex items-start gap-2">
                    <X size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{c.generic}</span>
                  </div>
                  <div className="col-span-5 text-slate-900 font-medium flex items-start gap-2">
                    <Check size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{c.linker}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards (Prevent Table Squishing) */}
          <div className="sm:hidden space-y-4">
            {COMPARISON.map((c) => (
              <Card key={c.feature} className="border-slate-200">
                <CardContent className="p-4 space-y-2.5">
                  <div className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    {c.feature}
                  </div>
                  <div className="text-xs text-slate-500 flex items-start gap-2">
                    <X size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-600">Others:</strong> {c.generic}</span>
                  </div>
                  <div className="text-xs text-slate-900 font-medium flex items-start gap-2">
                    <Check size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-[#0a66c2]">Linker:</strong> {c.linker}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* ── Ready to Start Call To Action ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-blue-50/50 to-white border-t border-slate-100 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge variant="default" className="mb-6 font-semibold">
            Ready to Start
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Stop letting your best insights go unpublished.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Turn your day-to-day achievements and learnings into an authoritative LinkedIn presence that compounds your career.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <Zap size={18} />
                Connect with LinkedIn
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl" className="w-full sm:w-auto">
              <Link href="/dashboard">
                View Studio Demo
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            No credit card required • Official OAuth 2.0 • 100% human approval
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0a66c2] text-white flex items-center justify-center font-bold text-xs">
              in
            </div>
            <span className="font-bold text-base text-slate-900">Linker</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <Link href="/dashboard" className="hover:text-[#0a66c2] transition-colors">Sign In</Link>
            <Link href="/dashboard" className="hover:text-[#0a66c2] transition-colors">Studio</Link>
            <Link href="/dashboard/settings" className="hover:text-[#0a66c2] transition-colors">Settings</Link>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Linker Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
