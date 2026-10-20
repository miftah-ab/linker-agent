"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  Mail,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/db/supabase-client";

function AuthLinkedInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDemoSignIn = () => {
    setDemoLoading(true);
    // Set demo cookie for immediate frictionless evaluation
    document.cookie = `linker_demo_session=true; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
    setTimeout(() => {
      router.push(nextParam);
    }, 400);
  };

  const handleLinkedInSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: `${origin}/api/v1/auth/callback?next=${encodeURIComponent(nextParam)}`,
        },
      });

      if (error) {
        // Fallback to internal adapter if Supabase provider not configured
        router.push(`/api/v1/adapters/linkedin/connect?next=${encodeURIComponent(nextParam)}`);
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      router.push(`/api/v1/adapters/linkedin/connect?next=${encodeURIComponent(nextParam)}`);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/api/v1/auth/callback?next=${encodeURIComponent(nextParam)}`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Magic link sent! Check your email to complete sign in.",
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send magic link.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Linker Studio Home
          </Link>
        </div>

        {/* Brand & Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0a66c2] text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/20">
              in
            </div>
            <div className="flex items-center gap-1.5 text-left">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">Linker</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-100 text-[#0a66c2] border border-blue-200">
                Studio
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Sign in to Linker Studio
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Autonomous LinkedIn executive agent grounded strictly in your verified achievements.
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-slate-200 shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {message && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* LinkedIn Sign In Button */}
            <Button
              onClick={handleLinkedInSignIn}
              disabled={loading || demoLoading}
              size="lg"
              className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white shadow-md shadow-blue-600/15 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded bg-white text-[#0a66c2] font-black text-xs flex items-center justify-center">
                  in
                </div>
              )}
              <span>Continue with LinkedIn</span>
            </Button>

            {/* Demo Instant Access Button */}
            <Button
              onClick={handleDemoSignIn}
              disabled={loading || demoLoading}
              variant="secondary"
              size="lg"
              className="w-full h-12 rounded-xl text-sm font-semibold border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 flex items-center justify-center gap-2 text-slate-800"
            >
              {demoLoading ? (
                <Loader2 size={16} className="animate-spin text-blue-600" />
              ) : (
                <Zap size={16} className="text-amber-500 fill-amber-500" />
              )}
              <span>Explore Instant Demo Studio</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-4 text-xs uppercase font-bold tracking-wider text-slate-400">
                Or with Email
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:bg-white transition-all"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                disabled={loading || demoLoading || !email}
                className="w-full h-10 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200"
              >
                Send Magic Link
              </Button>
            </form>

            {/* Security Guarantee List */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck size={13} className="text-emerald-600 flex-shrink-0" />
                <span>Official LinkedIn OAuth 2.0 (Zero password storage)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                <span>100% Human approval — never posts without your consent</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Lock size={13} className="text-slate-400 flex-shrink-0" />
                <span>AES-256 encrypted server-only token vault</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400">
          By signing in, you agree to Linker&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        © {new Date().getFullYear()} Linker Studio • Autonomous Grounded Presence
      </div>
    </div>
  );
}

export default function AuthLinkedInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-[#0a66c2]" size={28} />
        </div>
      }
    >
      <AuthLinkedInContent />
    </Suspense>
  );
}
