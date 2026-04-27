import api from '@/lib/apiClient';
import { Report, ReportPaginationResponse, ReportStatus, ReportTargetType } from '@/types/report';

export interface GetReportsParams {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  targetType?: ReportTargetType;
  search?: string;
}

export const adminReportService = {
  getAllReports: async (params?: GetReportsParams): Promise<ReportPaginationResponse> => {
    const response = await api.get('/admin/reports/get-all', { params });
    return response.data;
  },

  updateReportStatus: async (id: string, status: ReportStatus): Promise<Report> => {
    const response = await api.patch(`/admin/reports/update-status/${id}`, { status });
    return response.data;
  },
};
