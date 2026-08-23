import { apiClient } from '@/lib/axios';
import { DashboardAnalyticsData, PeriodFilter } from '@/types/dashboard';

export const dashboardService = {
  async getAnalytics(period: PeriodFilter = 'today', propertyId?: string): Promise<DashboardAnalyticsData> {
    const params: Record<string, any> = { period };
    if (propertyId && propertyId !== 'ALL') {
      params.property_id = propertyId;
    }

    const response = await apiClient.get<DashboardAnalyticsData>('/reports/dashboard_analytics/', { params });
    return response.data;
  },
};
