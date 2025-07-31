'use client';

import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEmailVerification } from '@/hooks/useAuth';
import { useAuthUser } from '@/store/useAuthStore';

/**
 * EmailVerificationPage Component
 * Handles email verification with timer and resend functionality
 */
const EmailVerificationPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthUser();
  
  const {
    verifyEmail,
    resendVerification,
    loading,
    resendLoading,
    error,
    canResend,
    countdown,
    clearError
  } = useEmailVerification();

  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  // Get token from URL params for direct verification links
  const verificationToken = searchParams.get('token');

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // If user is already verified, redirect to dashboard
    if (user.emailVerified) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (verificationToken && !isVerified) {
      handleVerifyToken(verificationToken);
    }
  }, [verificationToken, isVerified]);

  const handleVerifyToken = async (token: string) => {
    try {
      await verifyEmail(token);
      setIsVerified(true);
      setVerificationStatus('success');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      setVerificationStatus('error');
      console.error('Email verification failed:', error);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email || !canResend) return;
    
    try {
      clearError();
      await resendVerification(user.email);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

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
          href="/dashboard"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm md:text-base"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-md">
          {/* Verification Card */}
          <div 
            className="relative rounded-2xl p-8 md:p-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {verificationStatus === 'success' ? (
              /* Success State */
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                </div>

                <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                  Email Verified!
                </h1>
                <p className="text-gray-400 text-sm md:text-base mb-6">
                  Your email has been successfully verified. You'll be redirected to your dashboard shortly.
                </p>

                <div className="w-full py-3 px-4 bg-green-500/20 border border-green-500/30 text-green-400 font-medium rounded-xl text-center">
                  Redirecting to dashboard...
                </div>
              </div>
            ) : verificationStatus === 'error' ? (
              /* Error State */
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Mail size={32} className="text-red-400" />
                  </div>
                </div>

                <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                  Verification Failed
                </h1>
                <p className="text-gray-400 text-sm md:text-base mb-6">
                  The verification link is invalid or has expired. Please request a new verification email.
                </p>

                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading || !canResend}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      <span>Send New Verification Email</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Pending Verification State */
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Mail size={32} className="text-blue-400" />
                  </div>
                </div>

                <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                  Verify Your Email
                </h1>
                <p className="text-gray-400 text-sm md:text-base mb-2">
                  We've sent a verification email to:
                </p>
                <p className="text-white font-medium text-sm md:text-base mb-6">
                  {user.email}
                </p>
                
                <p className="text-gray-400 text-xs md:text-sm mb-8">
                  Please check your inbox and click the verification link to activate your account.
                  Don't forget to check your spam folder!
                </p>

                {/* Error Message */}
                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                    {error}
                  </div>
                )}

                {/* Resend Button */}
                <div className="space-y-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading || !canResend}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : canResend ? (
                      <>
                        <RefreshCw size={18} />
                        <span>Resend Verification Email</span>
                      </>
                    ) : (
                      <>
                        <Clock size={18} />
                        <span>Resend in {countdown}s</span>
                      </>
                    )}
                  </button>

                  {loading && (
                    <div className="text-blue-400 text-sm text-center">
                      Verifying your email...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          {verificationStatus === 'pending' && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Having trouble? Check your spam folder or{' '}
                <Link href="/support" className="text-blue-400 hover:text-blue-300 transition-colors">
                  contact support
                </Link>
              </p>
            </div>
          )}

          {/* Web3 Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="text-gray-400 text-xs">
              <div className="text-blue-400 font-semibold mb-1">Secure</div>
              <div>Email verification protects your account</div>
            </div>
            <div className="text-gray-400 text-xs">
              <div className="text-blue-400 font-semibold mb-1">Verified</div>
              <div>Blockchain-verified certificates await</div>
            </div>
            <div className="text-gray-400 text-xs">
              <div className="text-blue-400 font-semibold mb-1">Ready</div>
              <div>Join the Web3 learning revolution</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
