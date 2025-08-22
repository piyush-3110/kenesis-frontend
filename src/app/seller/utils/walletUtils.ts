/**
 * Utility functions for wallet address validation and handling
 */

/**
 * Check if a string is a valid Ethereum address format
 */
export const isEthereumAddress = (address: string): boolean => {
  if (!address) return false;

  // Basic Ethereum address pattern: 0x followed by 40 hexadecimal characters
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
};

/**
 * Truncate wallet address for display purposes
 */
export const truncateWalletAddress = (
  address: string,
  startLength = 6,
  endLength = 4
): string => {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Format wallet address with proper case
 */
export const formatWalletAddress = (address: string): string => {
  if (!address) return "";
  return address.toLowerCase();
};
