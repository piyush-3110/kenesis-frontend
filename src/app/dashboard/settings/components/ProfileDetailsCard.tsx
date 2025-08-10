'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Camera, X } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import GradientBox from './GradientBox';

/**
 * ProfileDetailsCard Component
 * Handles profile information editing including avatar upload
 */
const ProfileDetailsCard: React.FC = () => {
  const { profile, updateProfile, uploadAvatar, updateAvatar } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: keyof typeof profile, value: string) => {
    updateProfile({ [field]: value });
  };

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setUploading(true);
      try {
        await uploadAvatar(file);
        console.log("✅ [PROFILE] Avatar uploaded successfully");
      } catch (error) {
        console.error('❌ [PROFILE] Failed to upload avatar:', error);
        // Error is already handled in the store
      } finally {
        setUploading(false);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <GradientBox>
      <div className="p-8 lg:p-12">
        {/* Header */}
        <div className="mb-10">
          <h2 
            className="text-white font-semibold mb-4"
            style={{
              fontFamily: 'Inter',
              fontSize: '24px',
              fontWeight: 600,
              lineHeight: '140%',
            }}
          >
            Public Profile
          </h2>
          <p 
            className="text-gray-400"
            style={{
              fontFamily: 'Inter',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '150%',
            }}
          >
            This information will be displayed publicly so be careful what you share.
          </p>
        </div>

        {/* Profile Picture Section */}
        <div className="mb-10">
          <label 
            className="block text-white mb-6 font-medium"
            style={{
              fontFamily: 'Inter',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            Profile Picture
          </label>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Avatar Preview */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div 
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4"
                  style={{
                    borderImage: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1'
                  }}
                >
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt="Profile"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Camera className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Upload progress overlay */}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white text-xs">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                {profile.avatar && !uploading && (
                  <button
                    onClick={() => updateAvatar('')}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 lg:p-12 text-center transition-colors min-h-[200px] flex flex-col justify-center
                  ${uploading 
                    ? 'border-gray-600 bg-gray-800/30 cursor-not-allowed opacity-60' 
                    : dragActive 
                      ? 'border-blue-500 bg-blue-500/10 cursor-pointer' 
                      : 'border-gray-600 hover:border-gray-500 cursor-pointer'
                  }
                `}
                onDrop={uploading ? undefined : handleDrop}
                onDragOver={uploading ? undefined : handleDragOver}
                onDragLeave={uploading ? undefined : handleDragLeave}
                onClick={uploading ? undefined : () => fileInputRef.current?.click()}
              >
                <Upload className={`w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-6 ${uploading ? 'text-gray-500' : 'text-gray-400'}`} />
                <div className="space-y-3">
                  <p 
                    className={`font-medium ${uploading ? 'text-gray-500' : 'text-white'}`}
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '18px',
                      fontWeight: 500,
                    }}
                  >
                    {uploading ? (
                      'Uploading...'
                    ) : (
                      <>
                        Drop your image here, or{' '}
                        <span className="text-blue-400 underline cursor-pointer">click to browse</span>
                      </>
                    )}
                  </p>
                  <p 
                    className={uploading ? 'text-gray-500' : 'text-gray-400'}
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 400,
                    }}
                  >
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-8 lg:space-y-10">
          {/* Username Field */}
          <div>
            <label 
              className="block text-white mb-3 font-medium"
              style={{
                fontFamily: 'Inter',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Enter your username"
              style={{
                fontFamily: 'Inter',
                fontSize: '16px',
                fontWeight: 400,
              }}
            />
          </div>

          {/* Email and Display Name */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <label 
                className="block text-white mb-3 font-medium"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="your.email@example.com"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  fontWeight: 400,
                }}
              />
            </div>

            <div>
              <label 
                className="block text-white mb-3 font-medium"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="How should we display your name?"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  fontWeight: 400,
                }}
              />
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <label 
              className="block text-white mb-3 font-medium"
              style={{
                fontFamily: 'Inter',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Bio
            </label>
            <p 
              className="text-gray-400 text-sm mb-4"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 400,
              }}
            >
              Write a short introduction about yourself and your expertise.
            </p>
            <textarea
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={6}
              className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all resize-vertical"
              placeholder="Tell us about yourself, your experience, and what you're passionate about teaching..."
              style={{
                fontFamily: 'Inter',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '150%',
              }}
            />
            <div className="text-right mt-2">
              <span className="text-gray-500 text-sm">
                {profile.bio.length} / 500 characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </GradientBox>
  );
};

export default ProfileDetailsCard;
