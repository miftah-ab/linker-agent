"use client";

import { BarChart3, TrendingUp, MessageSquare, Repeat, Eye } from "lucide-react";

export default function AnalyticsDashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          Content Performance & Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical post performance snapshots recorded additively without destructive overwrites.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Impressions</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">48,290</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">+18.4% this month</span>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Engagement</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">5.4%</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Top 10% in niche</span>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Executive Comments</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">342</div>
          <span className="text-[11px] text-slate-400 mt-1 block">High seniority ratio</span>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Organic Reposts</span>
            <Repeat className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">128</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">+32% viral reach</span>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Published Post Snapshots</h2>
          <span className="text-xs text-slate-400 font-mono">Additive Snapshot Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-3">Post Title</th>
                <th className="py-3 px-3">Published Date</th>
                <th className="py-3 px-3">Impressions</th>
                <th className="py-3 px-3">Reactions</th>
                <th className="py-3 px-3">Comments</th>
                <th className="py-3 px-3">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {[
                {
                  title: "Why Zero-Downtime Migrations Require Dual-Writing Patterns",
                  date: "Sep 28, 2026",
                  impressions: "16,420",
                  reactions: "412",
                  comments: "84",
                  rate: "6.2%",
                },
                {
                  title: "The Fallacy of Microservices for Pre-PMF Engineering Teams",
                  date: "Sep 22, 2026",
                  impressions: "19,840",
                  reactions: "530",
                  comments: "112",
                  rate: "5.8%",
                },
                {
                  title: "Context Architecture: Why We Moved Beyond Single-Prompt Agents",
                  date: "Sep 15, 2026",
                  impressions: "12,030",
                  reactions: "320",
                  comments: "64",
                  rate: "5.1%",
                },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-3 font-medium text-slate-200">{row.title}</td>
                  <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">{row.date}</td>
                  <td className="py-3.5 px-3 text-slate-200 font-mono">{row.impressions}</td>
                  <td className="py-3.5 px-3 text-slate-200 font-mono">{row.reactions}</td>
                  <td className="py-3.5 px-3 text-slate-200 font-mono">{row.comments}</td>
                  <td className="py-3.5 px-3 text-emerald-400 font-mono font-semibold">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
