/**
 * Chain Switch Component
 * Handles chain switching for course purchases based on the selected payment token
 */

import React from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { getChainConfig, parseTokenString, isSupportedChain } from '@/lib/contracts/chainConfig';

interface ChainSwitchProps {
  tokenString: string; // e.g., "USDT-137"
  onSwitchComplete?: () => void;
  onSwitchError?: (error: Error) => void;
  className?: string;
}

export const ChainSwitchCard: React.FC<ChainSwitchProps> = ({
  tokenString,
  onSwitchComplete,
  onSwitchError,
  className = '',
}) => {
  const currentChainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();

  // Parse the required chain from token string
  const { symbol: tokenSymbol, chainId: requiredChainId } = parseTokenString(tokenString);
  const requiredChainConfig = getChainConfig(requiredChainId);
  const currentChainConfig = getChainConfig(currentChainId);

  // Check if chain switch is needed
  const needsSwitch = currentChainId !== requiredChainId;
  const isRequiredChainSupported = isSupportedChain(requiredChainId);

  // Handle chain switch
  const handleSwitch = async () => {
    if (!isRequiredChainSupported || !requiredChainConfig) {
      const error = new Error(`Chain ${requiredChainId} is not supported`);
      onSwitchError?.(error);
      return;
    }

    try {
      await switchChain({ chainId: requiredChainId });
      onSwitchComplete?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to switch chain');
      onSwitchError?.(error);
    }
  };

  // Don't render if no switch is needed
  if (!needsSwitch) {
    return null;
  }

  // Error state for unsupported chain
  if (!isRequiredChainSupported || !requiredChainConfig) {
    return (
      <div className={`p-4 rounded-lg bg-red-600/20 border border-red-600/30 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-400 font-medium mb-2">Unsupported Chain</h4>
            <p className="text-red-300 text-sm">
              The payment token {tokenSymbol} on chain {requiredChainId} is not supported in this environment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg bg-blue-600/20 border border-blue-600/30 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-blue-400 font-medium mb-2">Switch Network Required</h4>
          <p className="text-blue-300 text-sm mb-4">
            To pay with {tokenSymbol}, you need to switch to {requiredChainConfig.name}.
          </p>
          
          {/* Chain info */}
          <div className="flex items-center gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span>Current:</span>
              <span className="font-medium text-white">
                {currentChainConfig?.name || `Chain ${currentChainId}`}
              </span>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
            <div className="flex items-center gap-2 text-blue-300">
              <span>Required:</span>
              <span className="font-medium text-blue-200">
                {requiredChainConfig.name}
              </span>
            </div>
          </div>
          
          {/* Switch button */}
          <button
            onClick={handleSwitch}
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: isPending 
                ? "#374151" 
                : "linear-gradient(107.31deg, #10B981 -30.5%, #059669 54.41%, #047857 100%)",
              color: "white",
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Switching Network...</span>
              </>
            ) : (
              <>
                <span>Switch to {requiredChainConfig.name}</span>
              </>
            )}
          </button>
          
          {/* Error display */}
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-600/20 border border-red-600/30">
              <p className="text-red-300 text-sm">
                Failed to switch network: {error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Inline chain switch button for smaller spaces
 */
export const InlineChainSwitch: React.FC<ChainSwitchProps> = ({
  tokenString,
  onSwitchComplete,
  onSwitchError,
  className = '',
}) => {
  const currentChainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const { chainId: requiredChainId } = parseTokenString(tokenString);
  const requiredChainConfig = getChainConfig(requiredChainId);
  const needsSwitch = currentChainId !== requiredChainId;
  const isSupported = isSupportedChain(requiredChainId);

  if (!needsSwitch || !isSupported || !requiredChainConfig) {
    return null;
  }

  const handleSwitch = async () => {
    try {
      await switchChain({ chainId: requiredChainId });
      onSwitchComplete?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to switch chain');
      onSwitchError?.(error);
    }
  };

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isPending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>Switching...</span>
        </>
      ) : (
        <>
          <ArrowRight size={14} />
          <span>Switch to {requiredChainConfig.name}</span>
        </>
      )}
    </button>
  );
};

/**
 * Hook to check if chain switch is needed for a token
 */
export const useChainSwitchRequired = (tokenString: string) => {
  const currentChainId = useChainId();
  
  try {
    const { chainId: requiredChainId } = parseTokenString(tokenString);
    const isSupported = isSupportedChain(requiredChainId);
    const needsSwitch = currentChainId !== requiredChainId;
    const chainConfig = getChainConfig(requiredChainId);
    
    return {
      needsSwitch: needsSwitch && isSupported,
      requiredChainId,
      currentChainId,
      isSupported,
      requiredChainName: chainConfig?.name,
    };
  } catch {
    return {
      needsSwitch: false,
      requiredChainId: undefined,
      currentChainId,
      isSupported: false,
      requiredChainName: undefined,
    };
  }
};
