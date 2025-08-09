"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail, useResendVerification } from "@/features/auth/hooks";
import AuthShell from "@/components/auth/AuthShell";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const search = useSearchParams();
  const token = search?.get("token") || "";

  const verify = useVerifyEmail();
  const resend = useResendVerification();

  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "verifying" | "success" | "error"
  >(token ? "verifying" : "idle");
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        setStatus("verifying");
        const msg = await verify.mutateAsync(token);
        if (!mounted) return;
        setStatus("success");
        setMessage(msg ?? "Email verified successfully.");
      } catch (err: unknown) {
        if (!mounted) return;
        const msg =
          (err as { message?: string } | undefined)?.message ||
          "Verification failed";
        setStatus("error");
        setMessage(msg);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onResend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const msg = await resend.mutateAsync(email);
      setMessage(msg ?? "Verification email sent if the address exists.");
    } catch (err: unknown) {
      const msg =
        (err as { message?: string } | undefined)?.message ||
        "Failed to resend verification email";
      setMessage(msg);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        status === "idle"
          ? "We’ve sent you a verification link. If you didn’t receive it, resend below."
          : undefined
      }
      backHref="/auth/login"
      backText="Back to Login"
    >
      {status === "verifying" && (
        <div className="flex items-center justify-center py-4 text-gray-300">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying your
          email…
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
          </div>
          <p className="text-green-300">{message}</p>
          <Link
            href="/auth/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Continue to login <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6">
          <p className="text-red-300">{message}</p>
          <form onSubmit={onResend} className="space-y-3">
            <label className="text-white text-sm font-medium">
              Resend verification email
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button
              disabled={resend.isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300"
            >
              {resend.isPending ? "Sending…" : "Send verification link"}
            </button>
            {message && <p className="text-gray-300 text-sm">{message}</p>}
          </form>
        </div>
      )}

      {status === "idle" && (
        <form onSubmit={onResend} className="space-y-3">
          <label className="text-white text-sm font-medium">Email</label>
          <div className="relative">
            <Mail
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button
            disabled={resend.isPending}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300"
          >
            {resend.isPending ? "Sending…" : "Resend verification email"}
          </button>
          {message && <p className="text-gray-300 text-sm">{message}</p>}
        </form>
      )}
    </AuthShell>
  );
}
