import { useQuery } from '@tanstack/react-query';
import { reportService, ReportQueryParams } from '../services/reportService';
import { FinancialReportType } from '@/types/reports';

export function useFinancialReports(activeTab: FinancialReportType, params: ReportQueryParams) {
  return useQuery<any>({
    queryKey: ['financialReport', activeTab, params.period, params.property_id || 'ALL', params.start_date, params.end_date],

    queryFn: () => {
      switch (activeTab) {
        case 'pnl':
          return reportService.getPnLReport(params);
        case 'revenue':
          return reportService.getRevenueReport(params);
        case 'expenses':
          return reportService.getExpenseReport(params);
        case 'hospitality':
          return reportService.getHospitalityKpiReport(params);
        case 'restaurant':
          return reportService.getRestaurantReport(params);
        case 'receivables':
          return reportService.getReceivablesReport(params);
        default:
          return reportService.getPnLReport(params);
      }
    },
    staleTime: 60000, // 1 min cache
  });
}
