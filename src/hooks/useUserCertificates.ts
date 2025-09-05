import { useQuery } from '@tanstack/react-query';
import { getUserCertificates } from '@/lib/api/learning';
import type { CertificateApiResponse } from '@/types/certificate-api';

export const useUserCertificates = (page: number = 1, limit: number = 10) => {
  return useQuery<CertificateApiResponse, Error>({
    queryKey: ['user-certificates', page, limit],
    queryFn: () => getUserCertificates(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
