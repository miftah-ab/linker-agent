import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  ArrowRight,
  Zap,
  Shield,
  ShieldCheck,
  NotebookPen,
  Sparkles,
  BookOpen,
  CalendarDays,
  Share2,
  FileCheck,
  BarChart3,
  Lock,
  CheckCircle2,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Linker — LinkedIn Presence on Autopilot",
  description:
    "Linker monitors your LinkedIn niche, surfaces real opportunities, and publishes authentic content in your voice — without you lifting a finger.",
};

const features = [
  {
    icon: ShieldCheck,
    title: "Evidence-Based Identity",
    desc: "Professional profile with explicit evidence states: Confirmed, AI Suggestion, and Unverified. AI never presents an assumption as fact.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: NotebookPen,
    title: "Work Journal",
    desc: "Log engineering breakthroughs, product decisions, and lessons as they happen. Private journal notes become high-signal public insight.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: Sparkles,
    title: "Quality Review Engine",
    desc: "Built-in checks flag generic thought-leader tropes, unsupported metrics, and content that doesn't match your voice.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: BookOpen,
    title: "Grounded Knowledge Base",
    desc: "Structured knowledge entries the AI cites directly during drafting. Your content is always traceable back to a real source.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: CalendarDays,
    title: "Editorial Calendar",
    desc: "Plan content across your strategic pillars. Identify topic gaps, manage cadence, and maintain consistency without burnout.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: Share2,
    title: "Official LinkedIn API",
    desc: "OAuth 2.0 and the official Member API only. No browser automation, no unofficial cookies, zero risk to your account.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
];

const steps = [
  { n: "01", title: "Identity & Knowledge", desc: "Define your verified domain pillars and professional voice. Build a knowledge base from real work — architecture decisions, metrics, and lessons.", color: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/10" },
  { n: "02", title: "Journal & Projects", desc: "Log work as it happens. Document project milestones, breakthroughs, and observations in a private, searchable journal.", color: "text-sky-400", border: "border-sky-500/30", bg: "bg-sky-500/10" },
  { n: "03", title: "Ideas & Research", desc: "Capture content ideas tied to your real expertise. Pull in supporting research to ground each post in substance.", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  { n: "04", title: "Draft, Review & Publish", desc: "AI generates a contextual first draft citing your knowledge entries. You review, edit, approve — then publish via the official LinkedIn API.", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
];

const principles = [
  { icon: FileCheck, title: "No invented facts", desc: "AI is explicitly instructed to refuse fabricating statistics, achievements, or project results not found in your workspace." },
  { icon: ShieldCheck, title: "Mandatory human approval", desc: "Nothing publishes without your explicit review and sign-off. Every draft goes through an approval workflow." },
  { icon: BarChart3, title: "Honest analytics", desc: "No vanity scores or predictive projections. Real post history and actual engagement data from the LinkedIn API." },
  { icon: Lock, title: "Your data, your control", desc: "Journals, unreleased projects, and private knowledge are never used to train public models or shared externally." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] font-sans overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-white">Linker</span>
          <nav className="flex items-center gap-2">
            <Link
              href="/auth/linkedin"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/linkedin"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Get started <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative text-center px-4 sm:px-6 pt-24 pb-20 overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <Badge variant="default" className="mb-8 uppercase tracking-widest text-xs">
            <Shield size={12} strokeWidth={2.5} />
            LinkedIn Presence Engine
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-6 text-white">
            Your professional presence,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              intentionally built.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-[560px] leading-relaxed mb-10">
            Turn your real projects, working journal, and domain knowledge
            into credible LinkedIn content — drafted by AI, always reviewed by you.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 w-full sm:w-auto">
            <Button asChild size="lg">
              <Link href="/auth/linkedin">
                <Zap size={16} />
                Start building your presence
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/auth/linkedin">Open workspace</Link>
            </Button>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 mb-16 text-sm text-white/40">
            {["No invented metrics", "No automated posting", "Human review required"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                {t}
              </span>
            ))}
          </div>

          {/* Dashboard mock */}
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/60 text-left">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-[11px] text-white/20 font-mono bg-white/5 px-3 py-0.5 rounded-full border border-white/5">
                linker-agent.vercel.app/dashboard
              </span>
            </div>
            {/* App layout */}
            <div className="flex h-[240px] sm:h-[280px] bg-[#0f0f0f]">
              {/* Sidebar */}
              <div className="w-32 sm:w-40 flex-shrink-0 border-r border-white/5 p-3 flex flex-col gap-1">
                {["Dashboard", "Studio", "Ideas", "Journal", "Calendar"].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                      i === 1
                        ? "bg-blue-500/15 text-blue-400"
                        : "text-white/30"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-blue-400" : "bg-white/20"}`} />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Draft ready", val: "3", color: "text-indigo-400" },
                    { label: "Reviewed", val: "12", color: "text-emerald-400" },
                    { label: "Published", val: "47", color: "text-sky-400" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/3 border border-white/5 rounded-xl p-2.5">
                      <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.val}</div>
                      <div className="text-[10px] text-white/30 mt-0.5 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Draft card */}
                <div className="flex-1 bg-white/3 border border-white/5 rounded-xl p-3">
                  <div className="flex gap-2">
                    <Badge variant="default">AI Draft</Badge>
                    <Badge variant="warning">Awaiting review</Badge>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="h-2 bg-white/8 rounded-full w-full" />
                    <div className="h-2 bg-white/8 rounded-full w-3/4" />
                    <div className="h-2 bg-white/8 rounded-full w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 text-[10px] font-semibold bg-[#0066ff] text-white rounded-md">Approve</div>
                    <div className="px-3 py-1 text-[10px] font-medium bg-white/5 text-white/40 rounded-md border border-white/8">Edit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social strip ── */}
      <div className="border-y border-white/5 bg-white/[0.02] py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            { icon: Users, label: "Built for professionals" },
            { icon: Shield, label: "No automation risk" },
            { icon: Sparkles, label: "AI + human review" },
            { icon: Share2, label: "Official LinkedIn API" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-white/40">
              <Icon size={14} className="text-[#0066ff]" />
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="py-24 px-4 sm:px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0066ff]">The Method</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              From raw experience to published expertise
            </h2>
            <p className="mt-4 text-white/50 max-w-lg leading-relaxed">
              Generic AI invents clichés. Linker synthesizes your actual work through a connected four-stage workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map(s => (
              <div
                key={s.n}
                className="group relative bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border text-xs font-black mb-5 ${s.color} ${s.bg} ${s.border}`}>
                  {s.n}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 tracking-tight">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${
                  s.color === "text-indigo-400" ? "from-indigo-500 to-transparent" :
                  s.color === "text-sky-400"    ? "from-sky-500 to-transparent" :
                  s.color === "text-emerald-400"? "from-emerald-500 to-transparent" :
                                                  "from-amber-500 to-transparent"
                }`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 sm:px-6 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0066ff]">Platform Capabilities</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Built for professionals who care about their reputation
            </h2>
            <p className="mt-4 text-white/50 max-w-lg leading-relaxed">
              Every feature is designed to protect your credibility while compounding the reach of your real expertise.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div
                key={title}
                className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${bg} ${border}`}>
                  <Icon size={20} strokeWidth={1.75} className={color} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="py-24 px-4 sm:px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0066ff]">Professional Standards</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Built on principles of professional integrity
            </h2>
            <p className="mt-4 text-white/50 leading-relaxed">
              Every design decision starts with one question: does this protect or compromise your professional reputation?
            </p>
            <Button asChild size="lg" className="mt-8 self-start">
              <Link href="/auth/linkedin">
                <Zap size={16} /> Get started free <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {principles.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 items-start p-5 bg-[#111] border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
              >
                <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#0066ff] mt-0.5">
                  <Icon size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 tracking-tight">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 px-4 sm:px-6 text-center overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0066ff]">Get started</span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tighter text-white leading-tight">
            Ready to share your real expertise?
          </h2>
          <p className="mt-5 text-lg text-white/50 leading-relaxed">
            Build an enduring professional presence grounded in your actual work — not AI-generated noise.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="xl">
              <Link href="/auth/linkedin">
                <Zap size={18} /> Create your account <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl">
              <Link href="/auth/linkedin">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-bold text-white/30 tracking-tight">Linker</span>
          <div className="flex gap-6">
            <Link href="/auth/linkedin" className="text-xs text-white/30 hover:text-white/60 transition-colors">Sign in</Link>
            <Link href="/auth/linkedin" className="text-xs text-white/30 hover:text-white/60 transition-colors">Register</Link>
          </div>
          <p className="text-xs text-white/20 w-full sm:w-auto text-center sm:text-right">
            © {new Date().getFullYear()} Linker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
