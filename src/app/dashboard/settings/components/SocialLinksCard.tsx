'use client';

import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
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
    {
      key: 'youtube' as const,
      label: 'YouTube',
      icon: Youtube,
      prefix: 'youtube.com/c/',
      placeholder: 'channel',
    },
  ];

  const handleInputChange = (platform: keyof typeof socialLinks, value: string) => {
    updateSocialLink(platform, value);
  };

  const getFullUrl = (platform: typeof socialPlatforms[0], value: string) => {
    if (platform.key === 'website') {
      return value.startsWith('http') ? value : `https://${value}`;
    }
    return `https://${platform.prefix}${value}`;
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
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-800/50 border border-gray-600 border-r-0 rounded-l-lg">
                      <IconComponent className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Prefix (if any) */}
                    {platform.prefix && (
                      <div 
                        className="px-3 py-2 bg-gray-800/30 border-t border-b border-gray-600 text-gray-400 text-sm flex items-center"
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
                      value={value}
                      onChange={(e) => handleInputChange(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className={`
                        flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors
                        ${platform.prefix ? 'rounded-r-lg border-l-0' : 'rounded-r-lg border-l-0'}
                      `}
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '14.03px',
                        fontWeight: 400,
                      }}
                    />
                  </div>

                  {/* External Link Preview */}
                  {hasValue && (
                    <a
                      href={getFullUrl(platform, value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
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
