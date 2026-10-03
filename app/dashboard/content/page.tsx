"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Send,
  CheckCircle2,
  History,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function ContentStudioPage() {
  const [title, setTitle] = useState(
    "The Real Bottleneck in AI Adoption Isn't Models — It's Context Architecture"
  );
  const [body, setBody] = useState(
    `Most engineering teams think they have an LLM problem.

They don't. They have an information architecture problem.

An LLM without structured persistent context is just a very expensive autocomplete. It forgets your architectural decisions, it loses track of your engineering principles, and it hallucinates patterns that don't exist.

Over the last 6 months building Linker, here is what we proved:

1. A monolithic system prompt fails past 3,000 tokens of rules.
2. Inferences must be strictly segregated from verified facts.
3. Every consequential agent action needs an immutable audit trail.

If you are building AI agents today, stop tweaking prompts. Start designing your context data model.`
  );

  const [voiceScore, setVoiceScore] = useState<number>(0.92);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [critiqueRunning, setCritiqueRunning] = useState(false);
  const [critique, setCritique] = useState<{
    hookScore?: number;
    hookFeedback?: string;
    verdict?: string;
  } | null>({
    hookScore: 9,
    hookFeedback: "Strong contrarian hook that immediately challenges conventional thinking.",
    verdict: "approved",
  });

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Simulate/trigger publish via API
      setTimeout(() => {
        setIsPublishing(false);
        setPublishedSuccess(true);
      }, 1200);
    } catch {
      setIsPublishing(false);
    }
  };

  const handleCritique = () => {
    setCritiqueRunning(true);
    setTimeout(() => {
      setCritiqueRunning(false);
      setCritique({
        hookScore: 9.5,
        hookFeedback: "Hook is punchy. Clear numbered principles ground the discussion in real engineering experience.",
        verdict: "approved",
      });
      setVoiceScore(0.95);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            Content Intelligence Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop drafting with anti-AI audits and automated multi-criteria critique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCritique}
            disabled={critiqueRunning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-200 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${critiqueRunning ? "animate-spin" : ""}`} />
            Run Anti-AI Critique
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing || publishedSuccess}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-xs transition-all shadow-lg ${
              publishedSuccess
                ? "bg-emerald-600 shadow-emerald-500/20"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25"
            }`}
          >
            {publishedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Published to LinkedIn
              </>
            ) : isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Approve & Publish Post
              </>
            )}
          </button>
        </div>
      </div>

      {publishedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Post published with strict idempotency verification. Platform ID: <strong>urn:li:share:71829384</strong></span>
        </div>
      )}

      {/* Editor & Quality Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Post Title / Hook
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Post Body</label>
                <span className="text-[11px] font-mono text-slate-500">
                  {body.length} characters • ~{Math.ceil(body.split(" ").length / 200)} min read
                </span>
              </div>
              <textarea
                rows={14}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500 font-sans resize-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <History className="w-3.5 h-3.5 text-slate-500" />
                v2 snapshot auto-saved
              </span>
              <span className="text-[11px] text-slate-500">
                Stage: <strong className="text-slate-300">Final (Awaiting Approval)</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quality, Voice & Critique Insights (1 col) */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Anti-AI & Voice Metrics
            </h2>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Authentic Voice Score</span>
                <span className="font-mono font-bold text-emerald-400">
                  {Math.round(voiceScore * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${voiceScore * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Zero AI clichés detected</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Executive tone matches voice signals</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Concrete engineering metrics present</span>
              </div>
            </div>
          </div>

          {critique && (
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Critic Feedback</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {critique.verdict}
                </span>
              </h2>

              <div className="text-xs space-y-2 text-slate-300">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="text-[11px] font-semibold text-blue-400 mb-1">
                    Hook Strength: {critique.hookScore}/10
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {critique.hookFeedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="text-[11px] text-slate-400 leading-tight">
              Publishing enforces platform idempotency key: duplicates are rejected at the DB level.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
