'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * AuthPage Component
 * Modern login/signup page with Web3 theme
 * Follows the website's gradient and dark theme design
 */
const AuthPage: React.FC = () => {
  const router = useRouter();
  const { login, signup, loading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeToTerms: false,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear errors when component mounts or auth mode changes
  useEffect(() => {
    clearError();
  }, [isSignup, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignup) {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        await signup({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          agreeToTerms: formData.agreeToTerms,
        });
      } else {
        await login(formData.email, formData.password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      agreeToTerms: false,
    });
    clearError();
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
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                {isSignup ? 'Join Kenesis' : 'Welcome Back'}
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                {isSignup 
                  ? 'Start your Web3 learning journey today' 
                  : 'Access your courses and continue learning'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name (Signup only) */}
              {isSignup && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required={isSignup}
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
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
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
              </div>

              {/* Confirm Password (Signup only) */}
              {isSignup && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required={isSignup}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (isSignup && !formData.agreeToTerms)}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
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
            <button
              type="button"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-400/50 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <Wallet size={20} className="group-hover:scale-110 transition-transform" />
              <span>Connect with Wallet</span>
            </button>

            {/* Switch Auth Mode */}
            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="text-gray-400 text-xs">
              <div className="text-blue-400 font-semibold mb-1">Decentralized</div>
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
    </div>
  );
};

export default AuthPage;
