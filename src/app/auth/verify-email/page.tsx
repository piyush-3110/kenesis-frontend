'use client';

import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthActions, useAuthUser } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

/**
 * EmailVerificationPage Component
 * Handles email verification with timer and resend functionality
 */
const EmailVerificationPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthUser();
  const { addToast } = useUIStore();
  
  const { 
    verifyEmail, 
    resendVerification, 
    verificationLoading,
    resendLoading,
    verificationError,
    canResend,
    countdown,
    clearVerificationError
  } = useAuthActions();

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
    if (verificationToken && user && !user.emailVerified) {
      handleVerifyFromToken(verificationToken);
    }
  }, [verificationToken, user]);

  const handleVerifyFromToken = async (token: string) => {
    try {
      setVerificationStatus('pending');
      await verifyEmail(token);
      setIsVerified(true);
      setVerificationStatus('success');
      
      addToast({
        type: 'success',
        message: '✅ Email verified successfully! Redirecting to dashboard...'
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      setVerificationStatus('error');
      console.error('Email verification failed:', error);
      
      if (error instanceof Error) {
        addToast({
          type: 'error',
          message: error.message
        });
      }
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email || !canResend) return;
    
    // Use auth store action which handles all error scenarios and toasts
    clearVerificationError();
    await resendVerification(user.email);
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
          href="/auth"
          className="text-gray-400 hover:text-white transition-colors text-sm md:text-base flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Auth</span>
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
            <div className="text-center">
              {/* Status Icon */}
              <div className="mb-6">
                {verificationStatus === 'success' ? (
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                ) : verificationStatus === 'error' ? (
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-red-400" />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                    {verificationLoading ? (
                      <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    ) : (
                      <Mail className="w-8 h-8 text-blue-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Title and Description */}
              <h1 className="text-white text-2xl md:text-3xl font-bold mb-4">
                {verificationStatus === 'success' ? 'Email Verified!' : 
                 verificationStatus === 'error' ? 'Verification Failed' :
                 'Check Your Email'}
              </h1>

              <p className="text-gray-400 text-sm md:text-base mb-8">
                {verificationStatus === 'success' ? 
                  'Your email has been successfully verified. You\'ll be redirected to your dashboard shortly.' :
                  verificationStatus === 'error' ?
                  'There was an issue verifying your email. Please try again or request a new verification email.' :
                  `We've sent a verification link to ${user.email}. Click the link in the email to verify your account.`
                }
              </p>

              {/* Action Buttons */}
              {verificationStatus === 'pending' && (
                <div className="space-y-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={!canResend || resendLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <RefreshCw size={18} />
                        <span>
                          {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Error Message */}
                  {verificationError && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      {verificationError}
                    </div>
                  )}
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="space-y-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={!canResend || resendLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <RefreshCw size={18} />
                        <span>Send New Email</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Additional Actions */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <Link 
                    href="/auth"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Back to Login
                  </Link>
                  <span className="text-gray-600">•</span>
                  <Link 
                    href="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
