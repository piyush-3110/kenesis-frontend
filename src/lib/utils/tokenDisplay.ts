import {
	getChainConfig,
	getTokenConfig,
	parseTokenString,
} from "@/lib/contracts/chainConfig";

export type TokenDisplayData = {
	symbol: string;
	chainId: number;
	chainName: string;
	address?: string;
	decimals?: number;
	isNative?: boolean;
	blockExplorer?: string;
	raw: string; // original token string
	valid: boolean;
};

/**
 * Format a backend token string (e.g., "USDT-11155111") to a human-friendly label.
 * Example: "USDT (Sepolia)". Falls back gracefully when unknown.
 */
export function formatTokenString(tokenString: string): string {
	try {
		const { symbol, chainId } = parseTokenString(tokenString);
		const chain = getChainConfig(chainId);
		const token = getTokenConfig(tokenString);
		const sym = token?.symbol || symbol;
		const chainName = chain?.name || `Chain ${chainId}`;
		return `${sym} (${chainName})`;
	} catch {
		return tokenString;
	}
}

/**
 * Format a string or array of backend token strings into a comma-separated label list.
 */
export function formatTokenList(tokens?: string | string[]): string {
	if (!tokens) return "";
	const list = Array.isArray(tokens) ? tokens : [tokens];
	return list.map(formatTokenString).join(", ");
}

/**
 * Parse and enrich a backend token string into display data.
 */
export function getTokenDisplayData(tokenString: string): TokenDisplayData {
	try {
		const { symbol, chainId } = parseTokenString(tokenString);
		const chain = getChainConfig(chainId);
		const token = getTokenConfig(tokenString);
		return {
			symbol: token?.symbol || symbol,
			chainId,
			chainName: chain?.name || `Chain ${chainId}`,
			address: token?.address,
			decimals: token?.decimals,
			isNative: token?.isNative,
			blockExplorer: chain?.blockExplorer,
			raw: tokenString,
			valid: !!(chain && token),
		};
	} catch {
		return {
			symbol: tokenString,
			chainId: NaN,
			chainName: "Unknown",
			raw: tokenString,
			valid: false,
		};
	}
}

/**
 * Map a list of token strings into display data, filtering duplicates by symbol+chainId.
 */
export function getUniqueTokenDisplayList(
	tokens?: string | string[]
): TokenDisplayData[] {
	if (!tokens) return [];
	const list = Array.isArray(tokens) ? tokens : [tokens];
	const mapped = list.map(getTokenDisplayData);
	const seen = new Set<string>();
	const out: TokenDisplayData[] = [];
	for (const t of mapped) {
		const key = `${t.symbol}-${t.chainId}`;
		if (!seen.has(key)) {
			seen.add(key);
			out.push(t);
		}
	}
	return out;
}

