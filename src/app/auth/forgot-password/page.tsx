"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema } from "@/features/auth/schemas";
import { useForgotPassword } from "@/features/auth/hooks";
import AuthShell from "@/components/auth/AuthShell";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const form = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
  });
  const forgot = useForgotPassword();

  const onSubmit = (values: { email: string }) => forgot.mutate(values.email);

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
      backHref="/auth/login"
      backText="Back to Login"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">Email</label>
          <div className="relative">
            <Mail
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              placeholder="you@example.com"
              {...form.register("email")}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-red-400 text-sm">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <button
          disabled={forgot.isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
        >
          {forgot.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Send reset link</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
        {forgot.isSuccess && (
          <p className="text-green-400 text-sm mt-2">{forgot.data}</p>
        )}
        {forgot.isError && (
          <p className="text-red-400 text-sm mt-2">
            {(forgot.error as Error).message}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Remembered your password?{" "}
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
