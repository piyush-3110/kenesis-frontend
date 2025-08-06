/**
 * Main Auth Actions Hook
 * Combines email and wallet auth actions into a single interface
 */

import { useEmailAuthActions } from './emailAuthActions';
import { useWalletAuthActions } from './walletAuthActions';

export * from './authState';
export * from './emailAuthActions';
export * from './walletAuthActions';

/**
 * Combined auth actions hook
 * Provides all authentication functionality in one hook
 */
export const useAuthActions = () => {
  const emailActions = useEmailAuthActions();
  const walletActions = useWalletAuthActions();

  return {
    // Email auth actions
    ...emailActions,
    
    // Wallet auth actions
    ...walletActions,
  };
};
