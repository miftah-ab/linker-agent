import Link from "next/link";
import {
  Sparkles,
  FileText,
  Send,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function DashboardOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Engine Active
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Executive Presence Control Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Linker is monitoring your niche, identifying strategic opportunities, and drafting high-impact content.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/content"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Open Content Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel glass-panel-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Opportunities</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">12</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> 4 high-relevance detected
          </span>
        </div>

        <div className="glass-panel glass-panel-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Drafts</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">3</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting review</span>
        </div>

        <div className="glass-panel glass-panel-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Published Posts</span>
            <Send className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">18</div>
          <span className="text-[11px] text-slate-400 mt-1 block">100% idempotent</span>
        </div>

        <div className="glass-panel glass-panel-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg. Engagement</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">5.4%</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">+1.2% this month</span>
        </div>
      </div>

      {/* Main Content Split: Opportunities & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Opportunities */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-white">High-Relevance Opportunities</h2>
              <p className="text-xs text-slate-400">Curated from market signals matching your expertise</p>
            </div>
            <Link
              href="/dashboard/opportunities"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold text-[10px] uppercase">
                  Industry Trend
                </span>
                <span className="font-mono text-emerald-400 font-semibold">96% Fit</span>
              </div>
              <h3 className="font-semibold text-sm text-slate-100">
                Agentic Workflows in Distributed Engineering Teams
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Discussion trending around autonomous agents taking over PR reviews and deployment pipelines. Strong match for your distributed systems background.
              </p>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-500">Detected 2h ago</span>
                <Link
                  href="/dashboard/content"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Generate Draft &rarr;
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold text-[10px] uppercase">
                  Contrarian View
                </span>
                <span className="font-mono text-emerald-400 font-semibold">92% Fit</span>
              </div>
              <h3 className="font-semibold text-sm text-slate-100">
                Why Microservices Architecture Fails for Early-Stage Startups
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Counter-narrative to standard premature scaling. Matches your architecture principles and positioning strategy.
              </p>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-500">Detected 5h ago</span>
                <Link
                  href="/dashboard/content"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Generate Draft &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Drafts */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-white">Drafts Awaiting Approval</h2>
              <p className="text-xs text-slate-400">Strictly human-in-the-loop before publication</p>
            </div>
            <Link
              href="/dashboard/content"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold text-[10px] uppercase">
                Stage: Critique (8.8/10 Voice Score)
              </span>
              <span className="text-[11px] text-slate-500">v2 Snapshot</span>
            </div>

            <h3 className="font-semibold text-sm text-slate-100">
              The Real Bottleneck in AI Adoption Isn&apos;t Models — It&apos;s Context Architecture
            </h3>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 italic leading-relaxed">
              &quot;Most engineering teams think they have an LLM problem. They don&apos;t. They have an information architecture problem. An LLM without structured persistent context is just a very expensive autocomplete...&quot;
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Anti-AI Check Passed
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/content"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Review & Publish
                </Link>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <ShieldCheck className="w-7 h-7 text-slate-500" />
            <span className="text-xs text-slate-400 font-medium">
              Zero Unapproved Publishing Invariant
            </span>
            <span className="text-[11px] text-slate-500 max-w-xs">
              Linker will never post to LinkedIn without your explicit manual confirmation while in Assisted mode.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
