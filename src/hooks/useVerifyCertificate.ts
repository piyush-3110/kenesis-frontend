import { useQuery } from '@tanstack/react-query';
import { verifyCertificate } from '@/lib/api/learning';
import type { VerifyCertificateApiResponse } from '@/types/certificate-api';

export const useVerifyCertificate = (certificateId: string) => {
  return useQuery<VerifyCertificateApiResponse, Error>({
    queryKey: ['verify-certificate', certificateId],
    queryFn: () => verifyCertificate(certificateId),
    enabled: !!certificateId,
    retry: 1, // Only retry once for verification
    staleTime: 0, // Always fetch fresh verification data
  });
};
