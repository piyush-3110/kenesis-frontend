/**
 * User Display Helper Hook
 * Provides consistent user display logic across the application
 */

import { useAuthUser } from "@/store/auth";

interface UserDisplayInfo {
  displayName: string;
  hasDisplayName: boolean;
  displayEmail: string | null;
  avatar: string;
  showProfileButton: boolean;
}

/**
 * Hook to get consistent user display information
 * Handles cases where wallet users might not have username
 */
export const useUserDisplay = (): UserDisplayInfo => {
  const user = useAuthUser();

  if (!user) {
    return {
      displayName: "",
      hasDisplayName: false,
      displayEmail: null,
      avatar: "",
      showProfileButton: false,
    };
  }

  // Priority: username > shortened wallet address > 'Wallet User'
  const getDisplayName = (): string => {
    if (user.username) return user.username;
    if (user.walletAddress) {
      return `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(
        -4
      )}`;
    }
    return "Wallet User";
  };

  const displayName = getDisplayName();
  const hasDisplayName = Boolean(user.username);
  const displayEmail = user.email || null;
  const avatar = (user.username || user.walletAddress || "W")
    .charAt(0)
    .toUpperCase();

  // Only show profile button if user has meaningful display info
  const showProfileButton = Boolean(user.username || user.email);

  return {
    displayName,
    hasDisplayName,
    displayEmail,
    avatar,
    showProfileButton,
  };
};
