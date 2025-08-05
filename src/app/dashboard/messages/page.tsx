'use client';

import React from 'react';
import ComingSoon from '../components/ComingSoon';
import { MessageSquare } from 'lucide-react';

/**
 * Messages Page
 * Temporary Coming Soon page for the Messages feature
 */
const MessagesPage = () => {
  return (
    <ComingSoon
      title="Messages Coming Soon"
      subtitle="Our secure messaging platform is in development. You'll soon be able to communicate directly with your customers, manage inquiries, and provide real-time support through an integrated chat system."
      estimatedRelease="Q1 2024"
      icon={<MessageSquare className="w-10 h-10 text-white" />}
    />
  );
};

export default MessagesPage;
