import { http } from "@/lib/http/axios";

export const completeModule = async (courseId: string, moduleId: string) => {
  const response = await http.post(`/api/courses/${courseId}/modules/${moduleId}/complete`);
  return response.data;
};

export const getCourseProgress = async (courseId: string) => {
  const response = await http.get(`/api/courses/${courseId}/progress`);
  return response.data;
};

export const generateCertificate = async (courseId: string) => {
  const response = await http.get(`/api/courses/${courseId}/certificate`);
  return response.data;
};

export const getUserCertificates = async (page: number = 1, limit: number = 10) => {
  const response = await http.get(`/api/users/me/certificates`, {
    params: { page, limit },
  });
  return response.data;
};

export const verifyCertificate = async (certificateId: string) => {
  const response = await http.get(`/api/certificates/verify/${certificateId}`);
  return response.data;
};
