import Link from "next/link";
import {
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Brain,
  Bot,
  Send,
  TrendingUp,
  Layers,
  Lock,
  X,
  Clock,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Linker — Grounded Autonomous LinkedIn Agent",
  description:
    "Turn your daily engineering achievements into an authoritative LinkedIn presence. Grounded AI drafting, Telegram approvals, and 100% human-in-the-loop control.",
};

const FEATURES = [
  {
    icon: Brain,
    title: "Persistent Professional Brain",
    description:
      "Linker builds a deep, structured mental model of your actual projects, tech stacks, wins, and failures. It never hallucinates skills you don't possess.",
    badge: "Core AI",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Bot,
    title: "Human-in-the-Loop Safeguards",
    description:
      "Every single draft requires your explicit tap-to-publish. Approve, edit, or discard in seconds from the web studio or directly on Telegram.",
    badge: "Security",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Send,
    title: "Instant Telegram Companion",
    description:
      "Review generated drafts on your morning commute. Send voice notes or quick thoughts to seed your next deep technical breakdown.",
    badge: "Mobile",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
  },
  {
    icon: TrendingUp,
    title: "High-Signal Opportunity Engine",
    description:
      "Identify high-value discussions in your domain, discover potential collaborators, and position yourself as an authority in your niche.",
    badge: "Growth",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Layers,
    title: "Evidence-Backed Post Drafting",
    description:
      "No corporate jargon or engagement bait. Posts reference real architectural trade-offs, benchmarks, and engineering insights that peer engineers respect.",
    badge: "Quality",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: Lock,
    title: "Official OAuth 2.0 & Token Safety",
    description:
      "Zero brittle browser scraping or password sharing. Uses official LinkedIn REST APIs with AES-256 encrypted server-only token storage.",
    badge: "Compliance",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect Your Profile & Experience",
    description:
      "Authenticate with official LinkedIn OAuth and feed Linker your background, GitHub highlights, technical milestones, and tone preferences.",
  },
  {
    step: "02",
    title: "Agent Analyzes & Synthesizes",
    description:
      "Linker tracks engineering topics and drafts authentic, high-signal posts matching your unique tone and real production experience.",
  },
  {
    step: "03",
    title: "Review & Publish with 1 Tap",
    description:
      "Receive formatted previews on web or Telegram. Make quick adjustments or approve with a single tap. Nothing is published without your consent.",
  },
];

const COMPARISONS = [
  {
    feature: "Content Grounding",
    generic: "Imagines fake scenarios and generic advice",
    linker: "Strictly grounded in your verified career & code",
  },
  {
    feature: "Publishing Control",
    generic: "Risky unmonitored autopilot or copy-paste loops",
    linker: "100% human approval via Web Studio & Telegram",
  },
  {
    feature: "Tone Authenticity",
    generic: "'Excited to announce!' generic corporate fluff",
    linker: "Direct, technical, seasoned practitioner voice",
  },
  {
    feature: "LinkedIn Integration",
    generic: "Fragile browser extensions & account ban risks",
    linker: "Official LinkedIn Partner API & OAuth 2.0 lifecycle",
  },
  {
    feature: "Mobile Workflow",
    generic: "Requires opening desktop web browser",
    linker: "Interactive Telegram bot with instant inline actions",
  },
];

const FAQS = [
  {
    q: "Will Linker post to LinkedIn without my explicit permission?",
    a: "Never. Linker operates on a strict human-in-the-loop guarantee. Every draft remains in your pending queue until you click Approve on the web dashboard or in Telegram.",
  },
  {
    q: "Does this violate LinkedIn terms of service?",
    a: "No. Linker connects strictly through official LinkedIn OAuth 2.0 and public developer APIs. We never scrape credentials, inject headless browsers, or mimic human keystrokes.",
  },
  {
    q: "How does Linker know what I sound like?",
    a: "Your Professional Brain ingests your writing samples, tone parameters, and technical experiences. You can refine your voice preferences at any time in Settings.",
  },
  {
    q: "Can I use Telegram to approve or edit drafts?",
    a: "Yes! Connecting your Telegram bot takes 30 seconds. You receive draft notifications with instant 'Approve', 'Edit', or 'Regenerate' inline buttons.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-[#0a66c2]">
      {/* ── Top Announcement Banner ── */}
      <div className="bg-slate-900 text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-blue-400 animate-pulse" />
        <span>
          <strong className="font-semibold text-blue-300">Linker 2.0 Live:</strong>{" "}
          Grounded LinkedIn Presence with 100% Human Approval
        </span>
        <Link
          href="/dashboard"
          className="underline underline-offset-4 font-semibold text-blue-300 hover:text-white transition-colors ml-1 hidden sm:inline"
        >
          Try Demo →
        </Link>
      </div>

      {/* ── Navigation Bar ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-black text-base shadow-sm">
              in
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Linker</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-50 text-[#0a66c2] border border-blue-200/60">
                Studio
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#0a66c2] transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-[#0a66c2] transition-colors">
              Workflow
            </a>
            <a href="#comparison" className="hover:text-[#0a66c2] transition-colors">
              Why Linker
            </a>
            <a href="#faq" className="hover:text-[#0a66c2] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/linkedin">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">
                Launch App
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-100/40 via-sky-50/50 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-semibold text-[#0a66c2] mb-6 shadow-xs">
            <ShieldCheck size={14} className="text-[#0a66c2]" />
            <span>Strict Human-in-the-Loop LinkedIn Agent</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.08]">
            Build an authoritative LinkedIn presence.{" "}
            <span className="text-[#0a66c2] bg-gradient-to-r from-[#0a66c2] to-sky-600 bg-clip-text text-transparent">
              Without the cringe.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Linker studies your real-world technical work, architectural decisions, and career milestones.
            It drafts authentic, evidence-backed posts that get you noticed by top founders, recruiters, and peers.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button asChild size="xl" className="w-full sm:w-auto shadow-md">
              <Link href="/dashboard">
                <Zap size={18} />
                Connect with LinkedIn
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl" className="w-full sm:w-auto">
              <Link href="/dashboard">
                Explore Studio Demo
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" /> Official OAuth 2.0 API
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" /> 100% human-approved
            </span>
          </div>
        </div>

        {/* ── Interactive Live Agent Mock Preview ── */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xl overflow-hidden">
            {/* Header / Chrome */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="text-xs font-semibold text-slate-400 ml-2">Linker Studio — Live Draft Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready for Approval
                </span>
              </div>
            </div>

            {/* Post Content Body */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0a66c2] to-sky-400 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    SA
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Sami Ahmed</h3>
                    <p className="text-xs text-slate-500">Staff Infrastructure Engineer • Distributed Systems</p>
                    <span className="text-[10px] text-slate-400">Drafted by Linker • Grounded in PR #412</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  <Sparkles size={13} />
                  Match Score: 96%
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-700 leading-relaxed font-normal">
                <p>
                  We shaved 420ms off our p99 query latency this week. We didn’t add a new caching layer or rewrite in Rust.
                </p>
                <p>
                  Instead, we diagnosed an index bloat issue in Postgres caused by high-cardinality foreign key lookups under read replicas.
                </p>
                <p className="font-medium text-slate-900">
                  3 concrete lessons from the incident:
                </p>
                <ul className="space-y-1 pl-4 list-disc text-slate-600">
                  <li>Partial indexes outperformed blanket composite indexes by 4x in disk efficiency.</li>
                  <li>Autovacuum thresholds on 50M+ row tables need proactive tuning before traffic spikes.</li>
                  <li>Telemetry on connection pool exhaustion showed the symptom, not the root cause.</li>
                </ul>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <ThumbsUp size={14} className="text-[#0a66c2]" />
                    Estimated Engagement: High
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock size={14} className="text-slate-400" />
                    Best Post Time: Tue 9:15 AM
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="flex-1 sm:flex-initial">
                    Edit Tone
                  </Button>
                  <Button size="sm" className="flex-1 sm:flex-initial">
                    <Check size={14} />
                    Approve & Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">3.8x</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Higher Inbound Inquiries</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#0a66c2] tracking-tight">15 Min</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Weekly Management Time</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">100%</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Human Approval Control</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">0</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Hallucinated Generic Posts</div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ── */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 text-[#0a66c2] border-blue-200">
            System Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Everything you need to lead your technical domain
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Purpose-built for software engineers, engineering leaders, and technical founders who care about signal over noise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((f) => {
            const IconComponent = f.icon;
            return (
              <Card
                key={f.title}
                className="border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${f.bg} ${f.border}`}>
                      <IconComponent size={22} className={f.color} />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2.5 group-hover:text-[#0a66c2] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0a66c2]">Effortless Workflow</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Three steps to a compounding presence
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              Set it up in under 2 minutes. Linker manages background research, synthesis, and queue management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((s) => (
              <Card key={s.step} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-7">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a66c2] border border-blue-200 flex items-center justify-center font-black text-sm mb-6">
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

      {/* ── Comparison Table ── */}
      <section id="comparison" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3 text-[#0a66c2] border-blue-200">
              Direct Comparison
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Why Linker over generic AI chatbots
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              Generic ChatGPT prompts produce spammy fluff that burns your professional reputation. Linker is grounded in real engineering reality.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-4 sm:col-span-3">Dimension</div>
              <div className="col-span-4 text-slate-400">Generic AI Bots</div>
              <div className="col-span-4 sm:col-span-5 text-[#0a66c2]">Linker Grounded Agent</div>
            </div>
            <div className="divide-y divide-slate-100">
              {COMPARISONS.map((c) => (
                <div key={c.feature} className="grid grid-cols-12 p-4 sm:p-5 items-center text-sm gap-2">
                  <div className="col-span-4 sm:col-span-3 font-semibold text-slate-800">{c.feature}</div>
                  <div className="col-span-4 text-slate-500 flex items-start gap-2 text-xs sm:text-sm">
                    <X size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{c.generic}</span>
                  </div>
                  <div className="col-span-4 sm:col-span-5 text-slate-900 font-medium flex items-start gap-2 text-xs sm:text-sm">
                    <Check size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{c.linker}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0a66c2]">Questions & Answers</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((item) => (
              <Card key={item.q} className="border-slate-200 bg-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-base text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Call To Action ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-blue-50/60 to-white border-t border-slate-100 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Stop letting your best architectural breakthroughs go unnoticed.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Turn your day-to-day work into high-impact LinkedIn authority. Start in 2 minutes.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button asChild size="xl" className="w-full sm:w-auto shadow-md">
              <Link href="/dashboard">
                <Zap size={18} />
                Connect with LinkedIn
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl" className="w-full sm:w-auto">
              <Link href="/dashboard">
                Open Studio Dashboard
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Official LinkedIn OAuth 2.0 • 100% human-in-the-loop • Cancel anytime
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
            <span className="font-bold text-base text-slate-900">Linker Studio</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <Link href="/auth/linkedin" className="hover:text-[#0a66c2] transition-colors">Sign In</Link>
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
