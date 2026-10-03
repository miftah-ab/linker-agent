"use client";

import { useState } from "react";
import { Sparkles, Check, X, EyeOff, FileText, TrendingUp, AlertCircle } from "lucide-react";

interface Opportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  relevance: number;
  status: "detected" | "accepted" | "rejected" | "ignored";
  detectedAt: string;
}

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    type: "Industry Trend",
    title: "Autonomous Agent Architectures in Enterprise Infrastructure",
    description:
      "High executive engagement on LinkedIn regarding governance and reliability of autonomous developer agents. Fits your system architecture focus.",
    relevance: 96,
    status: "detected",
    detectedAt: "2h ago",
  },
  {
    id: "opp-2",
    type: "Contrarian Narrative",
    title: "Why Prompt Engineering is Being Replaced by Context Engineering",
    description:
      "Debate around single-prompt agents failing in production versus structured persistent memory systems. Direct alignment with your Linker design philosophy.",
    relevance: 94,
    status: "detected",
    detectedAt: "4h ago",
  },
  {
    id: "opp-3",
    type: "Career Milestone",
    title: "Reflections on Migrating Zero-Downtime Multi-Tenant Databases",
    description:
      "Tactical case-study format performing exceptionally well in tech leadership circles. Grounded in your database migration expertise.",
    relevance: 88,
    status: "detected",
    detectedAt: "Yesterday",
  },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [filter, setFilter] = useState<string>("all");

  const handleAction = async (id: string, action: "accept" | "reject" | "ignore") => {
    try {
      await fetch(`/api/v1/opportunities/${id}/${action}`, { method: "POST" });
    } catch {
      // optimistic update
    }

    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === id
          ? {
              ...opp,
              status: action === "accept" ? "accepted" : action === "reject" ? "rejected" : "ignored",
            }
          : opp
      )
    );
  };

  const filtered = opportunities.filter((o) => {
    if (filter === "all") return o.status !== "rejected" && o.status !== "ignored";
    return o.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-400" />
            Strategic Opportunities
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time market signals matched against your Professional Brain and positioning goals.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === "all" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Active Signals
          </button>
          <button
            onClick={() => setFilter("accepted")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === "accepted" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Accepted
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            className="glass-panel glass-panel-hover rounded-xl p-5 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {opp.type}
                </span>
                <span className="text-xs text-slate-500">• {opp.detectedAt}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                {opp.relevance}% Fit
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">{opp.title}</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opp.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                Status: <span className="capitalize font-medium text-slate-300">{opp.status}</span>
              </div>

              {opp.status === "detected" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(opp.id, "ignore")}
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all"
                    title="Ignore"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAction(opp.id, "reject")}
                    className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs transition-all"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAction(opp.id, "accept")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept & Draft
                  </button>
                </div>
              ) : (
                <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Draft Ready in Studio
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
