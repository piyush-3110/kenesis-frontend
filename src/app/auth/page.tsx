"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAuthActions,
  useIsAuthenticated,
  useAuthUser,
} from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

/**
 * AuthPage Component
 * Modern login/signup page with Web3 theme
 * Integrates with backend API following security guidelines
 */
const AuthPage: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const { addToast } = useUIStore();

  const {
    register,
    login,
    forgotPassword,
    registerLoading,
    loginLoading,
    forgotPasswordLoading,
    registerError,
    loginError,
    clearRegisterError,
    clearLoginError,
    clearForgotPasswordError,
  } = useAuthActions();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    bio: "",
    agreeToTerms: false,
  });

  // Get current loading and error states are now from the destructured variables

  // Redirect if already authenticated and verified (or wallet-only user)
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasEmail = !!user.email;
      const isEmailVerified = user.emailVerified === true;
      const isWalletOnlyUser = user.authMethod === "wallet" && !hasEmail;

      if ((hasEmail && isEmailVerified) || isWalletOnlyUser) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  // Clear errors when component mounts or auth mode changes
  useEffect(() => {
    clearRegisterError();
    clearLoginError();
    clearForgotPasswordError();
  }, [isSignup, clearRegisterError, clearLoginError, clearForgotPasswordError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail.trim()) {
      addToast({
        type: "error",
        message: "Please enter your email address",
      });
      return;
    }

    await forgotPassword(forgotPasswordEmail);
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignup) {
        // Frontend validation
        if (!formData.username.trim()) {
          addToast({
            type: "error",
            message: "Username is required",
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          addToast({
            type: "error",
            message: "Passwords do not match",
          });
          return;
        }

        if (!formData.agreeToTerms) {
          addToast({
            type: "error",
            message: "You must agree to the terms and conditions",
          });
          return;
        }

        // Call register API
        const result = await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          username: formData.username,
          bio: formData.bio || undefined,
        });

        // Handle registration response according to task requirements
        if (result.user.emailVerified) {
          // User is verified - tokens are stored
          addToast({
            type: "success",
            message: "✅ Account created! Redirecting to your dashboard...",
          });
          setTimeout(() => router.push("/dashboard"), 1500);
        } else {
          // User is not verified - tokens are NOT stored
          addToast({
            type: "warning",
            message:
              "⚠️ Please verify your email before accessing the dashboard.",
          });
          setTimeout(() => router.push("/auth/verify-email"), 1500);
        }
      } else {
        // Login flow according to task requirements
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        // Handle login response according to task specifications
        if (result.user.emailVerified) {
          // Store tokens and redirect to dashboard
          addToast({
            type: "success",
            message: "Login successful! Redirecting to dashboard...",
          });
          setTimeout(() => router.push("/dashboard"), 1500);
        } else {
          // Don't store tokens, show warning
          addToast({
            type: "warning",
            message: "Please verify your email before accessing the dashboard.",
          });
          setTimeout(() => router.push("/auth/verify-email"), 1500);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);

      if (error instanceof Error) {
        // Handle specific error scenarios according to task requirements
        const errorMessage = error.message;

        // Check for validation errors (400) - applies to both login and register
        if (
          errorMessage.includes("email:") ||
          errorMessage.includes("password:") ||
          errorMessage.includes("username:")
        ) {
          // Multiple validation errors - show each one
          const errors = errorMessage.split(", ");
          errors.forEach((err) => {
            addToast({
              type: "error",
              message: err,
            });
          });
        }
        // Check for unauthorized/invalid credentials (401) - login specific
        else if (
          errorMessage.includes("Invalid email or password") ||
          errorMessage.includes("Invalid credentials")
        ) {
          addToast({
            type: "error",
            message: "Invalid email or password",
          });
        }
        // Check for conflict error (409) - register specific
        else if (errorMessage.includes("already exists")) {
          addToast({
            type: "error",
            message: errorMessage,
          });
        }
        // Check for rate limit error (429) - both login and register
        else if (errorMessage.includes("Too many requests")) {
          addToast({
            type: "error",
            message: errorMessage,
          });
        }
        // Network or other errors - fallback
        else {
          addToast({
            type: "error",
            message: errorMessage,
          });
        }
      } else {
        // Fallback for unexpected errors
        addToast({
          type: "error",
          message: "Something went wrong. Please try again later.",
        });
      }
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      bio: "",
      agreeToTerms: false,
    });
    clearRegisterError();
    clearLoginError();
  };

  return (
    <div className="min-h-screen bg-[#0A071A] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Glowing Blue Effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-[800px] h-[600px] pointer-events-none">
        <div
          className="w-full h-full rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(6,128,255,0.6) 0%, rgba(2,46,210,0.4) 40%, rgba(6,128,255,0.2) 70%, transparent 90%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-6 md:px-24">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/landing/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <span className="text-white font-bold text-xl md:text-2xl">
            Kenesis
          </span>
        </Link>

        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
        >
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div
            className="relative rounded-2xl p-8 md:p-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                {isSignup ? "Join Kenesis" : "Welcome Back"}
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                {isSignup
                  ? "Start your Web3 learning journey today"
                  : "Access your courses and continue learning"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username (Signup only) */}
              {isSignup && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required={isSignup}
                    />
                  </div>
                </div>
              )}

              {/* Bio (Signup only) */}
              {isSignup && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Bio (Optional)
                  </label>
                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-3 top-4 text-gray-400"
                    />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Tell us a bit about yourself"
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Forgot Password Link (Login only) */}
                {!isSignup && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {/* Confirm Password (Signup only) */}
              {isSignup && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required={isSignup}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Terms and Conditions (Signup only) */}
              {isSignup && (
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 bg-gray-900/50 border border-gray-700/50 rounded focus:ring-2 focus:ring-blue-500/20"
                    required={isSignup}
                  />
                  <label className="text-gray-400 text-sm">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  (isSignup ? registerLoading : loginLoading) ||
                  (isSignup && !formData.agreeToTerms)
                }
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {(isSignup ? registerLoading : loginLoading) ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignup ? "Create Account" : "Sign In"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Error Message */}
              {(isSignup ? registerError : loginError) && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {isSignup ? registerError : loginError}
                </div>
              )}

              {/* Forgot Password (Login only) */}
              {!isSignup && (
                <div className="text-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>

            {/* Web3 Connect Button */}
            <WalletConnectButton
              variant="auth-page"
              authIntent={isSignup ? "signup" : "signin"}
              onConnected={() => {
                // Redirect to dashboard after successful wallet connection
                router.push("/dashboard");
              }}
            />

            {/* Switch Auth Mode */}
            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm">
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {isSignup ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="text-gray-400 text-xs">
              <div className="text-blue-400 font-semibold mb-1">
                Decentralized
              </div>
              <div>Own your learning data</div>
            </div>
            <div className="text-gray-400 text-xs">
              <div className="text-blue-400 font-semibold mb-1">Secure</div>
              <div>Blockchain-verified certificates</div>
            </div>
            <div className="text-gray-400 text-xs">
              <div className="text-blue-400 font-semibold mb-1">Global</div>
              <div>Learn from worldwide experts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Reset Password
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                  }}
                  className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotPasswordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
