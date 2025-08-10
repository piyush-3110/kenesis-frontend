'use client';

import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Globe,
  ExternalLink 
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import GradientBox from './GradientBox';

/**
 * SocialLinksCard Component
 * Handles social media links and website URL editing
 */
const SocialLinksCard: React.FC = () => {
  const { socialLinks, updateSocialLink } = useSettingsStore();

  const socialPlatforms = [
    {
      key: 'website' as const,
      label: 'Website',
      icon: Globe,
      prefix: '',
      placeholder: 'https://yourwebsite.com',
    },
    {
      key: 'facebook' as const,
      label: 'Facebook',
      icon: Facebook,
      prefix: 'facebook.com/',
      placeholder: 'username',
    },
    {
      key: 'twitter' as const,
      label: 'Twitter',
      icon: Twitter,
      prefix: 'twitter.com/',
      placeholder: 'username',
    },
    {
      key: 'instagram' as const,
      label: 'Instagram',
      icon: Instagram,
      prefix: 'instagram.com/',
      placeholder: 'username',
    },
    {
      key: 'linkedin' as const,
      label: 'LinkedIn',
      icon: Linkedin,
      prefix: 'linkedin.com/in/',
      placeholder: 'username',
    },
  ];

  const handleInputChange = (platform: keyof typeof socialLinks, value: string) => {
    console.log(`🔗 [SOCIAL] Updating ${platform}:`, value);
    // Convert input to full URL format that the backend expects
    const fullUrl = getFullUrl(socialPlatforms.find(p => p.key === platform)!, value);
    console.log(`🔗 [SOCIAL] Converted to full URL:`, fullUrl);
    updateSocialLink(platform, fullUrl);
  };

  const getFullUrl = (platform: typeof socialPlatforms[0], value: string) => {
    if (!value || value.trim() === '') return '';
    
    if (platform.key === 'website') {
      return value.startsWith('http') ? value : `https://${value}`;
    }
    
    // For social media platforms, if user enters just username, convert to full URL
    if (value.startsWith('http')) {
      return value; // Already a full URL
    }
    
    return `https://${platform.prefix}${value}`;
  };

  const getDisplayValue = (platform: typeof socialPlatforms[0], fullUrl: string) => {
    if (!fullUrl || fullUrl.trim() === '') return '';
    
    if (platform.key === 'website') {
      return fullUrl.replace(/^https?:\/\//, '');
    }
    
    // Extract username from full URL for display
    const prefix = `https://${platform.prefix}`;
    if (fullUrl.startsWith(prefix)) {
      return fullUrl.substring(prefix.length);
    }
    
    return fullUrl;
  };

  const validateUrl = (platform: typeof socialPlatforms[0], value: string) => {
    if (!value.trim()) return true; // Empty is valid
    
    try {
      const fullUrl = getFullUrl(platform, value);
      
      if (platform.key === 'website') {
        // Validate the full URL for website
        const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
        return urlPattern.test(fullUrl);
      } else {
        // For social media, validate the username part
        const displayValue = getDisplayValue(platform, fullUrl);
        const usernamePattern = /^[a-zA-Z0-9._-]+$/;
        return usernamePattern.test(displayValue);
      }
    } catch (error) {
      return false;
    }
  };

  return (
    <GradientBox>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 
            className="text-white font-medium mb-2"
            style={{
              fontFamily: 'Inter',
              fontSize: '18px',
              fontWeight: 500,
              lineHeight: '140%',
            }}
          >
            Social Media Links
          </h2>
          <p 
            className="text-gray-400"
            style={{
              fontFamily: 'Inter',
              fontSize: '14.03px',
              fontWeight: 400,
              lineHeight: '20.58px',
            }}
          >
            Connect your social profiles to help students find and follow you.
          </p>
        </div>

        {/* Social Links */}
        <div className="space-y-6">
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon;
            const value = socialLinks[platform.key];
            const hasValue = value && value.trim() !== '';
            const isValid = validateUrl(platform, value);

            return (
              <div key={platform.key}>
                <label 
                  className="block text-white mb-2"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14.03px',
                    fontWeight: 400,
                  }}
                >
                  {platform.label}
                </label>
                
                <div className="flex items-center">
                  {/* Input Group */}
                  <div className="flex-1 flex items-center">
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-10 h-10 bg-gray-800/50 border border-r-0 rounded-l-lg ${
                      hasValue && !isValid ? 'border-red-500' : 'border-gray-600'
                    }`}>
                      <IconComponent className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Prefix (if any) */}
                    {platform.prefix && (
                      <div 
                        className={`px-3 py-2 bg-gray-800/30 border-t border-b text-gray-400 text-sm flex items-center ${
                          hasValue && !isValid ? 'border-red-500' : 'border-gray-600'
                        }`}
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '14.03px',
                          fontWeight: 400,
                        }}
                      >
                        {platform.prefix}
                      </div>
                    )}
                    
                    {/* Input */}
                    <input
                      type="text"
                      value={getDisplayValue(platform, value)}
                      onChange={(e) => handleInputChange(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className={`
                        flex-1 px-3 py-2 bg-gray-800/50 border text-white focus:outline-none transition-colors
                        ${platform.prefix ? 'rounded-r-lg border-l-0' : 'rounded-r-lg border-l-0'}
                        ${hasValue && !isValid 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-gray-600 focus:border-blue-500'
                        }
                      `}
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '14.03px',
                        fontWeight: 400,
                      }}
                    />
                  </div>

                  {/* External Link Preview */}
                  {hasValue && isValid && (
                    <a
                      href={value} // Use the stored full URL directly
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                {/* Validation Error */}
                {hasValue && !isValid && (
                  <p className="text-red-400 text-xs mt-1">
                    {platform.key === 'website' 
                      ? 'Please enter a valid website URL (e.g., yoursite.com)' 
                      : 'Please enter a valid username (letters, numbers, dots, hyphens, underscores only)'
                    }
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p 
                className="text-gray-300 text-sm"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  fontWeight: 400,
                  lineHeight: '18px',
                }}
              >
                <strong className="text-white">Tip:</strong> Adding your social links helps build trust with potential students and makes it easier for them to connect with you outside the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GradientBox>
  );
};

export default SocialLinksCard;
