# Wallet-Based Access Control System

This system provides comprehensive wallet-based access control for the application, ensuring only authorized wallet addresses can access protected content.

## Overview

The system implements a multi-layer security approach:
1. **Wallet Connection**: Users must connect their wallet
2. **Authentication**: Wallet must be authenticated via SIWE (Sign-In with Ethereum)
3. **Authorization**: Connected wallet must be in the allowlist
4. **Route Protection**: Automatic protection for designated routes

## Core Components

### 1. Configuration (`src/config/walletAllowlist.ts`)

Contains the authorized wallet addresses and route definitions:

```typescript
export const ALLOWED_WALLET_ADDRESSES = [
  "0x1dE4E24CcE887c8A1dcE26571970d704182D642D",
  // ... other addresses
];

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/marketplace", 
  "/product",
  "/seller",
  "/learn",
  "/auth",
  "/verify"
];
```

### 2. Wallet Access Hook (`src/hooks/useWalletAccess.ts`)

Provides wallet connection and authorization state:

```typescript
const {
  walletAddress,
  isWalletConnected,
  isWalletAllowed,
  isAuthenticated,
  hasWalletAccess,
  needsWalletConnection
} = useWalletAccess();
```

### 3. Protected Route Component (`src/components/wallet/ProtectedRoute.tsx`)

Automatically protects routes based on configuration:
- Wraps the entire app in `layout.tsx`
- Shows appropriate prompts for unauthorized access
- Logs wallet addresses for debugging

### 4. Marketplace Guard (`src/components/wallet/MarketplaceGuard.tsx`)

Specialized protection for marketplace with enhanced UX:

```typescript
<MarketplaceGuard>
  <MarketplaceContent />
</MarketplaceGuard>
```

### 5. Access Components

**WalletConnectionPrompt**: Shows when wallet connection is needed
**AccessDeniedScreen**: Shows when wallet is not authorized
**WalletStatus**: Displays current wallet status

## Implementation

### 1. Layout Integration

The system is already integrated in `src/app/layout.tsx`:

```typescript
<WalletAccessProvider>
  <ProtectedRoute>
    <EnhancedConditionalLayout>{children}</EnhancedConditionalLayout>
  </ProtectedRoute>
</WalletAccessProvider>
```

### 2. Page-Level Protection

For automatic protection, pages matching `PROTECTED_ROUTES` are automatically guarded.

For custom protection, wrap specific pages:

```typescript
import { MarketplaceGuard } from "@/components/wallet";

export default function MarketplacePage() {
  return (
    <MarketplaceGuard>
      <YourPageContent />
    </MarketplaceGuard>
  );
}
```

### 3. Component-Level Access Control

Use the hook in any component:

```typescript
import { useWalletAccess } from "@/hooks/useWalletAccess";

function MyComponent() {
  const { hasWalletAccess, walletAddress } = useWalletAccess();
  
  if (!hasWalletAccess) {
    return <AccessDenied />;
  }
  
  return <ProtectedContent />;
}
```

### 4. Route Guard Hook

For advanced route protection:

```typescript
import { useRouteGuard } from "@/hooks/useRouteGuard";

function MyPage() {
  const { canAccess, needsConnection } = useRouteGuard({
    redirectOnUnauthorized: true,
    redirectTo: "/",
    showToasts: true
  });
  
  // Component logic...
}
```

## Features

### 🔒 Automatic Route Protection
- Routes in `PROTECTED_ROUTES` are automatically protected
- Public routes (like `/`) remain accessible to all

### 📱 Responsive Access Prompts
- Mobile-friendly wallet connection prompts
- Clear messaging for different access states

### 🎯 Specialized Guards
- Marketplace-specific protection with enhanced UX
- Customizable guards for different page types

### 🔍 Debug Logging
- Console logs show fetched wallet addresses
- Access attempt logging for troubleshooting

### 🍞 Toast Notifications
- User-friendly notifications for access issues
- Success/error states for wallet connections

### 📊 Status Components
- Real-time wallet status display
- Compact and full status views

## Authorized Wallet Addresses

The following wallet addresses have access to protected content:

- `0x1dE4E24CcE887c8A1dcE26571970d704182D642D`
- `0x3127D160ABAa4ABfc3ABABe8D956B815066336Ea`
- `0x1a0A74b0468de0c3fD47a62558Da3b1bF5c79dE3`
- `0xf4c7f161Ac215193364C0a5BAe868092C4abADEa`
- `0x7Ff52db4Ad12B420fAa59b98F4defE2c7e424CeD`
- `0x15939FE4D1C8238e0Fc8fC9E471Aa896CBE4604E`
- `0xe56C298C08B289AdDFFbd2f80970FFf24D406616`
- `0xC934922B5eed463cD02eba73d295589aE6d5eB7a`
- `0xfCa73091cCA5D3CE218B20E10a742f442501d657`

## Usage Examples

### Basic Component Protection

```typescript
import { useWalletAccess } from "@/hooks/useWalletAccess";
import { WalletConnectionPrompt } from "@/components/wallet";

function ProtectedComponent() {
  const { hasWalletAccess } = useWalletAccess();
  
  if (!hasWalletAccess) {
    return <WalletConnectionPrompt />;
  }
  
  return <div>Protected content here</div>;
}
```

### Custom Access Logic

```typescript
import { useWalletAccess } from "@/hooks/useWalletAccess";
import { useUIStore } from "@/store/useUIStore";

function CustomProtectedComponent() {
  const { addToast } = useUIStore();
  const { isWalletAllowed, walletAddress } = useWalletAccess();
  
  useEffect(() => {
    if (walletAddress && !isWalletAllowed) {
      addToast({
        type: "error",
        message: "Unauthorized wallet detected",
        duration: 5000
      });
    }
  }, [walletAddress, isWalletAllowed]);
  
  // Component logic...
}
```

## Maintenance

### Adding New Authorized Wallets

1. Edit `src/config/walletAllowlist.ts`
2. Add the wallet address to `ALLOWED_WALLET_ADDRESSES`
3. Ensure proper `0x` prefix and checksum format

### Adding New Protected Routes

1. Edit `src/config/walletAllowlist.ts`
2. Add the route pattern to `PROTECTED_ROUTES`
3. Routes use `startsWith()` matching for flexibility

### Customizing Access Messages

Edit the message props in:
- `WalletConnectionPrompt` component
- `AccessDeniedScreen` component
- Toast notifications in hooks

## Security Notes

- All wallet addresses are case-insensitive compared (normalized to lowercase)
- Route matching uses `startsWith()` for flexible path matching
- The system logs wallet access attempts for audit purposes
- Unauthorized access attempts show user-friendly error messages

## Browser Console Debugging

The system logs important information to the browser console:

- `🔍 Fetched Wallet Address: 0x...` - Shows detected wallet
- `✅ Is Wallet Allowed: true/false` - Shows authorization status  
- `🔒 Route Guard Check: {...}` - Shows detailed access checks
- `🚫 Redirecting unauthorized user from: /path` - Shows redirects
