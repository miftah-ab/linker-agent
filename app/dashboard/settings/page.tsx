"use client";

import { useState } from "react";
import {
  Settings,
  Send,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [autonomyMode, setAutonomyMode] = useState<string>("assisted");
  const [requireApproval, setRequireApproval] = useState<boolean>(true);
  const [maxPosts, setMaxPosts] = useState<number>(2);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-300" />
          Settings & Connected Accounts
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage OAuth platforms, messaging channels, and agent autonomy permissions.
        </p>
      </div>

      {/* Connected Accounts */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Platform Connections</h2>

        {/* LinkedIn Connection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">LinkedIn</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-0.5">
                Authorized for profile read & organic social publishing.
              </span>
            </div>
          </div>

          <a
            href="/api/v1/adapters/linkedin/connect"
            className="px-3.5 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-all text-center"
          >
            Reconnect
          </a>
        </div>

        {/* Telegram Bot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Telegram Alerts</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-3 h-3" /> Ready to Link
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-0.5">
                Receive instant draft approval requests and opportunity digests on your phone.
              </span>
            </div>
          </div>

          <a
            href="/api/v1/adapters/telegram/connect"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-all shadow-sm"
          >
            Link Telegram <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Autonomy & Safety Governance */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Agent Autonomy & Safety Rules
            </h2>
            <p className="text-xs text-slate-400">
              Control the operational boundary of Linker&apos;s decision loop.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">Strict Guardrails</span>
        </div>

        {/* Autonomy Mode Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Autonomy Operational Mode
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { id: "manual", label: "Manual", desc: "User triggers every step" },
              { id: "assisted", label: "Assisted (Default)", desc: "AI drafts, user approves" },
              { id: "scheduled", label: "Scheduled", desc: "Executes on timetable" },
              { id: "autonomous", label: "Autonomous", desc: "Self-executes within rules" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setAutonomyMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  autonomyMode === m.id
                    ? "bg-blue-600/15 border-blue-500 text-white shadow-sm"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-xs font-semibold block text-slate-100">{m.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block leading-tight">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Strict Checkbox Controls */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
            />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Require Explicit Human Approval Before Publishing
              </span>
              <span className="text-[11px] text-slate-400 block">
                Guarantees zero posts go live without your explicit review click or Telegram confirmation.
              </span>
            </div>
          </label>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Maximum Daily Posts
              </span>
              <span className="text-[11px] text-slate-400 block">
                Safety cap to prevent feed fatigue and protect account reputation.
              </span>
            </div>
            <select
              value={maxPosts}
              onChange={(e) => setMaxPosts(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
            >
              <option value={1}>1 post / day</option>
              <option value={2}>2 posts / day</option>
              <option value={3}>3 posts / day</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
