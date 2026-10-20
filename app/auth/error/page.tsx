import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AuthErrorPage(props: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const searchParams = await props.searchParams;
  const reason = searchParams?.reason || "unknown";

  const errorMessages: Record<string, string> = {
    missing_code: "Authentication code was missing from the response.",
    auth_failed: "Failed to exchange authorization code for a session.",
    linkedin_denied: "LinkedIn authorization was cancelled or denied.",
    invalid_state: "Security verification failed (OAuth state mismatch).",
  };

  const description =
    errorMessages[reason] ||
    "An unexpected error occurred during authentication. Please try signing in again.";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            Authentication Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Sign In Failed
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/auth/linkedin">
              <RefreshCw size={15} />
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <ArrowLeft size={15} />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
