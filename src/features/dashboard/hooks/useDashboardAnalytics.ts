import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { PeriodFilter } from '@/types/dashboard';

export function useDashboardAnalytics(period: PeriodFilter = 'today', propertyId?: string) {
  return useQuery({
    queryKey: ['dashboardAnalytics', period, propertyId || 'ALL'],
    queryFn: () => dashboardService.getAnalytics(period, propertyId),
    staleTime: 30000, // 30 seconds cache
    refetchInterval: 60000, // Background sync every 60s
  });
}
