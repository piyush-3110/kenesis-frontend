'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * ForgotPasswordPage Component
 * Password reset page following the website's design theme
 */
const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await forgotPassword(email);
      setIsEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };

  const handleResendEmail = async () => {
    try {
      await forgotPassword(email);
    } catch (error) {
      console.error('Resend email error:', error);
    }
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
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Glowing Blue Effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-[800px] h-[600px] pointer-events-none">
        <div 
          className="w-full h-full rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(6,128,255,0.6) 0%, rgba(2,46,210,0.4) 40%, rgba(6,128,255,0.2) 70%, transparent 90%)',
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
          <span className="text-white font-bold text-xl md:text-2xl">Kenesis</span>
        </Link>

        <Link 
          href="/auth"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm md:text-base"
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-md">
          {/* Reset Card */}
          <div 
            className="relative rounded-2xl p-8 md:p-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {!isEmailSent ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                    Forgot Password?
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base">
                    No worries! Enter your email and we'll send you a reset link
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
                      {error}
                    </div>
                  )}
                </form>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle size={32} className="text-green-400" />
                    </div>
                  </div>

                  <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                    Check Your Email
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base mb-6">
                    We've sent a password reset link to{' '}
                    <span className="text-white font-medium">{email}</span>
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={handleResendEmail}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 text-white font-medium rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      ) : (
                        'Resend Email'
                      )}
                    </button>

                    <Link
                      href="/auth"
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft size={18} />
                      <span>Back to Login</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <Link href="/support" className="text-blue-400 hover:text-blue-300 transition-colors">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
