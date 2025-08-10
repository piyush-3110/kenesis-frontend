import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface TokenSelectorProps {
  tokens: string[];
  selectedToken: string | null;
  onTokenSelect: (token: string) => void;
  disabled?: boolean;
  className?: string;
}

// Parse token format "TOKEN_SYMBOL-CHAIN_ID" to get display info
const parseToken = (token: string) => {
  const parts = token.split("-");
  if (parts.length >= 2) {
    const symbol = parts.slice(0, -1).join("-"); // Handle tokens with dashes in name
    const chainId = parts[parts.length - 1];
    return { symbol, chainId, raw: token };
  }
  return { symbol: token, chainId: "", raw: token };
};

// Get chain name from chain ID
const getChainName = (chainId: string) => {
  const chains: Record<string, string> = {
    "1": "Ethereum",
    "56": "BSC",
    "137": "Polygon",
    "42161": "Arbitrum",
    "10": "Optimism",
    "8453": "Base",
    "11155111": "Sepolia", // Testnet
  };
  return chains[chainId] || `Chain ${chainId}`;
};

// Get token color scheme
const getTokenColors = (symbol: string) => {
  const colors: Record<string, string> = {
    USDC: "from-blue-500 to-blue-600",
    USDT: "from-green-500 to-green-600",
    ETH: "from-purple-500 to-purple-600",
    BTC: "from-orange-500 to-orange-600",
    BNB: "from-yellow-500 to-yellow-600",
    MATIC: "from-indigo-500 to-indigo-600",
    AVAX: "from-red-500 to-red-600",
  };
  return colors[symbol.toUpperCase()] || "from-blue-500 to-purple-600";
};

const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (tokens.length === 0) {
    return (
      <div className={`${className}`}>
        <label className="block text-white font-medium mb-2">
          Payment Token
        </label>
        <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-600/50">
          <p className="text-gray-400 text-sm">
            No payment tokens available for this course
          </p>
        </div>
      </div>
    );
  }

  const parsedTokens = tokens.map(parseToken);
  const selectedParsed = selectedToken ? parseToken(selectedToken) : null;

  // For single token, show a simplified read-only display
  if (tokens.length === 1) {
    const singleToken = parsedTokens[0];
    return (
      <div className={`${className}`}>
        <label className="block text-white font-medium mb-2">
          Payment Token
        </label>
        <div className="p-3 rounded-lg border bg-gray-900/50 border-gray-600/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTokenColors(
                singleToken.symbol
              )} flex items-center justify-center text-white text-sm font-bold`}
            >
              {singleToken.symbol.substring(0, 2)}
            </div>
            <div className="text-left">
              <div className="text-white font-medium">{singleToken.symbol}</div>
              <div className="text-gray-400 text-xs">
                {getChainName(singleToken.chainId)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleTokenClick = (token: string) => {
    onTokenSelect(token);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <label className="block text-white font-medium mb-2">Payment Token</label>

      {/* Selected Token Display */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full p-3 rounded-lg border transition-all duration-200 flex items-center justify-between
          ${
            disabled
              ? "bg-gray-800/50 border-gray-600/50 cursor-not-allowed opacity-50"
              : "bg-gray-900/80 border-gray-600 hover:border-blue-500/50 focus:border-blue-500 focus:outline-none"
          }
        `}
      >
        <div className="flex items-center gap-3">
          {selectedParsed ? (
            <>
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTokenColors(
                  selectedParsed.symbol
                )} flex items-center justify-center text-white text-sm font-bold`}
              >
                {selectedParsed.symbol.substring(0, 2)}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">
                  {selectedParsed.symbol}
                </div>
                <div className="text-gray-400 text-xs">
                  {getChainName(selectedParsed.chainId)}
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-400">Select payment token</span>
          )}
        </div>

        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {parsedTokens.map((token, index) => {
            const isSelected = selectedToken === token.raw;

            return (
              <button
                key={index}
                onClick={() => handleTokenClick(token.raw)}
                className={`
                  w-full p-3 flex items-center gap-3 transition-colors text-left
                  ${
                    isSelected
                      ? "bg-blue-600/20 text-blue-400"
                      : "hover:bg-gray-800 text-gray-300 hover:text-white"
                  }
                  ${index === 0 ? "rounded-t-lg" : ""}
                  ${
                    index === parsedTokens.length - 1
                      ? "rounded-b-lg"
                      : "border-b border-gray-700"
                  }
                `}
              >
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTokenColors(
                    token.symbol
                  )} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {token.symbol.substring(0, 2)}
                </div>

                <div className="flex-1">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-gray-400">
                    {getChainName(token.chainId)}
                  </div>
                </div>

                {isSelected && <Check size={16} className="text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
