import { useMutation } from '@tanstack/react-query';
import { generateCertificate } from '@/lib/api/learning';
import { useToastMessages } from './useToastMessages';

export const useGenerateCertificate = () => {
  const { showSuccess, showError } = useToastMessages();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const result = await generateCertificate(courseId);
      
      if (result.success && result.data?.pdfUrl) {
        // Open the PDF URL in a new tab for download
        window.open(result.data.pdfUrl, '_blank');
        showSuccess('Certificate downloaded successfully!');
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to generate certificate');
      }
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to generate certificate.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    },
  });
};
