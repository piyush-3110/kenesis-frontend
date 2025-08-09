"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { useRegister } from "@/features/auth/hooks";
import AuthShell from "@/components/auth/AuthShell";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";
import { Mail, User, Lock, AlignLeft, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });
  const registerMut = useRegister();

  const onSubmit = (values: RegisterInput) => registerMut.mutate(values);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Kenesis and start your journey"
      backHref="/auth/login"
      backText="Back to Login"
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

        {/* Username */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">Username</label>
          <div className="relative">
            <User
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Choose a username"
              {...form.register("username")}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-red-400 text-sm">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">Password</label>
          <div className="relative">
            <Lock
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              placeholder="Create a strong password"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              placeholder="Re-enter your password"
              {...form.register("confirmPassword")}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-400 text-sm">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">
            Bio (optional)
          </label>
          <div className="relative">
            <AlignLeft
              size={20}
              className="absolute left-3 top-3 text-gray-400"
            />
            <textarea
              placeholder="Tell us a bit about yourself"
              {...form.register("bio")}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
            />
          </div>
          {form.formState.errors.bio && (
            <p className="text-red-400 text-sm">
              {form.formState.errors.bio.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          disabled={registerMut.isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
        >
          {registerMut.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
        {registerMut.isError && (
          <p className="text-red-400 text-sm mt-2">
            {(registerMut.error as Error).message}
          </p>
        )}
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
