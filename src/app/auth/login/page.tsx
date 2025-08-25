"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/hooks";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";
import AuthShell from "@/components/auth/AuthShell";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const login = useLogin();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading during auth check
  if (authLoading) {
    return (
      <AuthShell
        title="Loading..."
        subtitle="Checking authentication"
        backHref="/"
        backText="Back to Home"
      >
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </AuthShell>
    );
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  const onSubmit = (values: LoginInput) => login.mutate(values);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account"
      backHref="/"
      backText="Back to Home"
    >
      {/* Wallet first */}
      <SiweAuthButton variant="auth-page" />
      <div className="my-6 flex items-center gap-3">
        <div className="h-px bg-white/20 flex-1" />
        <span className="text-sm text-white/70">or</span>
        <div className="h-px bg-white/20 flex-1" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
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

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white text-sm font-medium">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-sm">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          disabled={login.isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
        >
          {login.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-blue-400 hover:text-blue-300"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
