import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-[#0a66c2] border border-blue-100 shadow-sm">
          <Sparkles size={28} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0a66c2]">
            404 Error
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The page you are looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home size={15} />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard">
              <ArrowLeft size={15} />
              Open Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
