import { useQuery } from "@tanstack/react-query";
import { SellerProfileApiResponse } from "@/types/seller";
import { http } from "@/lib/http/axios";

interface ApiError {
  response?: {
    status: number;
  };
}

/**
 * Fetch seller profile by identifier (username or email)
 */
export const fetchSellerProfile = async (
  identifier: string
): Promise<SellerProfileApiResponse> => {
  const response = await http.get<SellerProfileApiResponse>(
    `/api/users/seller/${identifier}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/**
 * Fetch seller profile by wallet address
 */
export const fetchSellerProfileByWallet = async (
  walletAddress: string
): Promise<SellerProfileApiResponse> => {
  const response = await http.get<SellerProfileApiResponse>(
    `/api/users/seller/wallet/${walletAddress}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/**
 * Hook to fetch seller profile by identifier
 */
export const useSellerProfile = (identifier: string) => {
  return useQuery({
    queryKey: ["seller-profile", identifier],
    queryFn: () => fetchSellerProfile(identifier),
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if ((error as ApiError)?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to fetch seller profile by wallet address
 */
export const useSellerProfileByWallet = (walletAddress: string) => {
  return useQuery({
    queryKey: ["seller-profile-wallet", walletAddress],
    queryFn: () => fetchSellerProfileByWallet(walletAddress),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if ((error as ApiError)?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
