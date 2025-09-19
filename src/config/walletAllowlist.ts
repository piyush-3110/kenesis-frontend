/**
 * Wallet Allowlist Configuration
 * Contains the authorized wallet addresses for platform access
 */

export const ALLOWED_WALLET_ADDRESSES = [
    "0x1dE4E24CcE887c8A1dcE26571970d704182D642D",
    "0x3127D160ABAa4ABfc3ABABe8D956B815066336Ea",
    "0x1a0A74b0468de0c3fD47a62558Da3b1bF5c79dE3",
    "0xf4c7f161Ac215193364C0a5BAe868092C4abADEa",
    "0x7Ff52db4Ad12B420fAa59b98F4defE2c7e424CeD",
    "0x15939FE4D1C8238e0Fc8fC9E471Aa896CBE4604E",
    "0xe56C298C08B289AdDFFbd2f80970FFf24D406616",
    //   "0xC934922B5eed463cD02eba73d295589aE6d5eB7a",
    "0xfCa73091cCA5D3CE218B20E10a742f442501d657",
    "0x2289B3880D395136F6572f483e5637Aed6B8D0Cc",
    "0xFFc7EB2Fdc3338682C5d5c1cc0C3d00eF902DE98",
    "0xD30942E019EFc7536cf40b72697040614C2f3B36",
    "0x4F83B3167b563231DeDAf5d1Fc960799DF51BBAb",
    "0x8c241f249bBe0E37C353a05E05Ef4e84837FA096",
    "0x0456c80170B3b7123E95f0660956a54C84F9734B",
    "0x7b02a6aAa6CcF463D55B82e5941C0bd6BB7bf948",
    "0x98d4A0b874fA3b14192E5F3f657Fb02c45C7A264",
    "0xA9562D833CFb88Ef5361820C53200fCcc1c65A13",
] as const;

/**
 * Check if a wallet address is in the allowlist
 */
export const isWalletAllowed = (address: string | undefined): boolean => {
    if (!address) return false;

    // Normalize address to lowercase for comparison
    const normalizedAddress = address.toLowerCase();

    return ALLOWED_WALLET_ADDRESSES.some(allowedAddress => allowedAddress.toLowerCase() === normalizedAddress);
};

/**
 * Protected routes that require wallet connection and allowlist verification
 */
export const PROTECTED_ROUTES = [
    "/dashboard",
    "/marketplace",
    "/product",
    "/seller",
    "/learn",
    "/auth",
    "/verify",
] as const;

/**
 * Check if a route is protected
 */
export const isProtectedRoute = (pathname: string): boolean => {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

/**
 * Routes that are always accessible (don't require wallet verification)
 */
export const PUBLIC_ROUTES = ["/", "/public"] as const;

/**
 * Check if a route is public
 */
export const isPublicRoute = (pathname: string): boolean => {
    if (pathname === "/") return true;
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};
