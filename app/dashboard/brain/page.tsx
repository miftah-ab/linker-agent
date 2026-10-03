"use client";

import { useState } from "react";
import { Brain, Award, Target, Mic2 } from "lucide-react";

export default function ProfessionalBrainPage() {
  const [headline, setHeadline] = useState(
    "Staff Distributed Systems Architect | Lead Implementation Engineer"
  );
  const [industry, setIndustry] = useState("Cloud Infrastructure & Enterprise AI");
  const [summary, setSummary] = useState(
    "Building fault-tolerant multi-tenant agent systems. Specializing in high-throughput database architectures, zero-downtime migrations, and deterministic AI execution loops."
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Brain className="w-6 h-6 text-purple-400" />
          Professional Brain Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Structured persistent context model. Distinct from one giant prompt: keeps facts, goals, and inferences strictly partitioned.
        </p>
      </div>

      {/* Identity Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-white">Professional Identity</h2>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Verified FACT
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">1.0 Confidence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Positioning & Strategic Bio
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
          />
        </div>
      </div>

      {/* Expertise & Goals 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Expertise */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              Verified Core Expertise
            </h2>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Facts Only</span>
          </div>

          <div className="space-y-2.5">
            {[
              { skill: "Next.js App Router & SSR Security", level: "Expert", conf: "1.0" },
              { skill: "PostgreSQL RLS & Partitioning", level: "Expert", conf: "1.0" },
              { skill: "Distributed Systems & Idempotency", level: "Expert", conf: "0.95" },
              { skill: "Autonomous AI Agent Protocols", level: "Advanced", conf: "0.90" },
            ].map((exp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{exp.skill}</span>
                  <span className="text-[11px] text-slate-400">{exp.level}</span>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-semibold">
                  {exp.conf} Conf
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Strategic Goals
            </h2>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Prioritized</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                title: "Establish Thought Leadership in Agent Infrastructure",
                prio: "P1",
                type: "Authority",
              },
              {
                title: "Educate Founders on Multi-Tenant Database Security",
                prio: "P1",
                type: "Engagement",
              },
              {
                title: "Grow High-Signal Network of Principal Engineers",
                prio: "P2",
                type: "Network",
              },
            ].map((goal, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{goal.title}</span>
                  <span className="text-[11px] text-slate-400">{goal.type}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {goal.prio}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Signals */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-purple-400" />
            Authentic Voice & Tone Model
          </h2>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Learned Patterns</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-purple-400 font-semibold block mb-1">Cadence</span>
            <span className="text-xs text-slate-200">
              Direct, punchy hooks followed by numbered analytical frameworks.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-purple-400 font-semibold block mb-1">Vocabulary</span>
            <span className="text-xs text-slate-200">
              Pragmatic engineering terms; avoids corporate marketing clichés.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-purple-400 font-semibold block mb-1">Perspective</span>
            <span className="text-xs text-slate-200">
              First-hand architectural builder; ground opinions in empirical trade-offs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
