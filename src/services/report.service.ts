import api from '@/lib/apiClient';
import { ReportPayload, Report } from '@/types/report';

export const reportService = {
  createReport: async (payload: ReportPayload): Promise<Report> => {
    const response = await api.post('/reports', payload);
    return response.data;
  },
};
