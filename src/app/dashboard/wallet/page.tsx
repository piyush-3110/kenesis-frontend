'use client';

import React from 'react';
import ComingSoon from '../components/ComingSoon';
import { Wallet } from 'lucide-react';

/**
 * Wallet Page
 * Temporary Coming Soon page for the Wallet feature
 */
const WalletPage = () => {
  return (
    <ComingSoon
      title="Wallet Coming Soon"
      subtitle="Our secure wallet feature is under development. You'll soon be able to manage your cryptocurrency assets, track transactions, and connect with popular wallets."
      estimatedRelease="Q3 2023"
      icon={<Wallet className="w-10 h-10 text-white" />}
    />
  );
};

export default WalletPage;
