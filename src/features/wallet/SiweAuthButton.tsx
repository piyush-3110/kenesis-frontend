"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/features/auth/api";
import { useAuth } from "@/features/auth/AuthProvider";
import { PENDING_SIWE_KEY } from "@/lib/wallet/constants";
import { useUIStore } from "@/store/useUIStore";

type Variant = "auth-page" | "dashboard" | "default" | "sheet";

export function SiweAuthButton({ variant = "default" }: { variant?: Variant }) {
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { setTokens, isAuthenticated } = useAuth();
  const { addToast } = useUIStore();
  const siweRunningRef = React.useRef(false);
  const autoRanRef = React.useRef(false);

  // Check if the current address is already authenticated
  const isCurrentAddressAuthenticated = React.useMemo(() => {
    if (!isAuthenticated || !address) return false;

    // Get the last authenticated address from localStorage
    const lastAuthAddr =
      typeof window !== "undefined"
        ? localStorage.getItem("lastAuthenticatedAddress")
        : null;

    return lastAuthAddr?.toLowerCase() === address.toLowerCase();
  }, [isAuthenticated, address]);

  const prepare = useMutation({
    mutationFn: async (addr?: string) => {
      const res = await AuthAPI.walletPrepare(addr);
      return res.data.data!; // { challengeId, message, expiresAt }
    },
  });

  const verify = useMutation({
    mutationFn: async (args: {
      challengeId: string;
      signature: string;
      message: string;
    }) => {
      const res = await AuthAPI.walletVerify(args);
      return res.data.data as unknown as {
        user?: unknown;
        tokens?: { accessToken: string; refreshToken: string };
      };
    },
    onSuccess: (data) => {
      if (data?.tokens?.accessToken && data?.tokens?.refreshToken) {
        setTokens(data.tokens);
      }
      // Mark successful link for current address in localStorage
      if (address && typeof window !== "undefined") {
        localStorage.setItem("lastAuthenticatedAddress", address.toLowerCase());
      }
    },
  });

  const getErrorMessage = (err: unknown) => {
    const maybeAxios = err as
      | { response?: { data?: { message?: string } } }
      | undefined;
    const maybeMsg = err as { message?: string } | undefined;
    const maybeCause = err as { cause?: { message?: string } } | undefined;
    const msg: string | undefined =
      maybeAxios?.response?.data?.message ||
      maybeMsg?.message ||
      maybeCause?.cause?.message;
    if (msg && /user rejected|rejected the request|denied/i.test(msg)) {
      return "Signature was canceled";
    }
    return msg || "Failed to authorize with wallet";
  };

  const runSiweFlow = async () => {
    if (siweRunningRef.current || prepare.isPending || verify.isPending) return;
    siweRunningRef.current = true;
    try {
      // Clear the pending flag early to avoid duplicate auto-runs
      if (typeof window !== "undefined")
        localStorage.removeItem(PENDING_SIWE_KEY);
      const { challengeId, message } = await prepare.mutateAsync(address);
      const signature = await signMessageAsync({ message });
      await verify.mutateAsync({ challengeId, signature, message });
      // Success: keep wallet connected
    } catch (err) {
      // Failure: disconnect to ensure wallet isn't connected without auth/link
      try {
        await disconnectAsync();
      } catch {}
      addToast({ type: "error", message: getErrorMessage(err) });
      throw err;
    } finally {
      if (typeof window !== "undefined")
        localStorage.removeItem(PENDING_SIWE_KEY);
      siweRunningRef.current = false;
    }
  };

  const busy = prepare.isPending || verify.isPending;
  const getLabel = (
    connected: boolean,
    authed: boolean,
    accountLabel?: string
  ) => {
    if (busy) return "Authorizing...";
    if (!connected) return "Connect Wallet";
    if (!authed) return "Authorize with Wallet";
    return accountLabel || "Connected";
  };

  React.useEffect(() => {
    // Auto-run SIWE once after a fresh wallet connection if we intended to auth
    const pending =
      typeof window !== "undefined" && localStorage.getItem(PENDING_SIWE_KEY);
    if (
      pending &&
      isConnected &&
      address &&
      !siweRunningRef.current &&
      !autoRanRef.current
    ) {
      autoRanRef.current = true;
      runSiweFlow().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        openAccountModal,
        openChainModal,
        mounted,
      }) => {
        const connected = mounted && !!account;
        const authed = isAuthenticated;
        const accountLabel = account?.displayName;
        const state: "idle" | "connected" | "error" = verify.isError
          ? "error"
          : connected && authed
          ? "connected"
          : "idle";

        const pill =
          "relative inline-flex items-center gap-2 rounded-full px-4 md:px-6 py-2 md:py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 h-10 md:h-12";
        let buttonClass = `${pill} bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_0_0_rgba(59,130,246,0.0)] hover:shadow-[0_0_24px_4px_rgba(59,130,246,0.35)]`;
        if (state === "error") {
          buttonClass = `${pill} border border-red-500/50 bg-red-600/15 text-red-200 hover:bg-red-600/25`;
        } else if (state === "connected") {
          buttonClass = `${pill} border border-emerald-500/40 bg-emerald-600/15 text-emerald-200 hover:bg-emerald-600/25`;
        } else if (variant === "auth-page") {
          buttonClass = `${pill} w-full py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-[0_0_24px_4px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_6px_rgba(99,102,241,0.35)]`;
        } else if (variant === "dashboard") {
          buttonClass = `${pill} bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white border border-white/10 hover:from-blue-600/40 hover:to-indigo-600/40`;
        }
        // Make sheet variant full width regardless of connection state
        if (variant === "sheet") {
          // Preserve existing color choices set above, just force layout changes
          buttonClass += " w-full justify-center text-base";
        }

        return (
          <button
            className={
              buttonClass + (busy ? " opacity-80 cursor-not-allowed" : "")
            }
            onClick={async () => {
              if (!connected) {
                if (typeof window !== "undefined")
                  localStorage.setItem(PENDING_SIWE_KEY, "1");
                openConnectModal?.();
                return;
              }
              // If we haven't linked (signed) for this address and are not authenticated, run SIWE
              if (
                address &&
                !isCurrentAddressAuthenticated &&
                !siweRunningRef.current
              ) {
                await runSiweFlow();
                return; // Account modal will be available on next click
              }
              // Already linked for this address; open account modal
              openAccountModal?.();
            }}
            disabled={busy}
            aria-busy={busy}
          >
            <span className="inline-flex items-center gap-2">
              {/* Status dot */}
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  state === "connected"
                    ? "bg-emerald-400"
                    : state === "error"
                    ? "bg-red-400"
                    : "bg-white/80"
                }`}
              />
              <span className="font-medium">
                {getLabel(connected, authed, accountLabel)}
              </span>
              {/* Chain badge when connected */}
              {connected && chain?.name && (
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openChainModal?.();
                  }}
                  title="Switch network"
                  className="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/30 border border-white/10 hover:bg-black/40"
                >
                  {chain.name}
                </span>
              )}
            </span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
