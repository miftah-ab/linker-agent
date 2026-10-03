"use client";

import { useState } from "react";
import { Play, Pause, Sparkles } from "lucide-react";

export function Header({
  autonomyMode = "assisted",
  isPausedInitial = false,
}: {
  autonomyMode?: string;
  isPausedInitial?: boolean;
}) {
  const [isPaused, setIsPaused] = useState(isPausedInitial);
  const [loading, setLoading] = useState(false);

  const togglePause = async () => {
    setLoading(true);
    try {
      const endpoint = isPaused ? "/api/v1/agent/resume" : "/api/v1/agent/pause";
      const res = await fetch(endpoint, { method: "POST" });
      if (res.ok) {
        setIsPaused(!isPaused);
      }
    } catch (err) {
      console.error("Failed to toggle agent pause:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 px-6 flex items-center justify-between backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-mono font-medium">
            Mode
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3 h-3" />
            {autonomyMode.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePause}
          disabled={loading}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isPaused
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Loop</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Agent</span>
            </>
          )}
        </button>

        <div className="w-px h-6 bg-slate-800" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
            LI
          </div>
        </div>
      </div>
    </header>
  );
}
