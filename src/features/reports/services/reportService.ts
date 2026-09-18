import { apiClient } from '@/lib/axios';
import { triggerFileDownload } from '@/lib/export';
import {
  FinancialPeriodFilter,
  FinancialReportType,
  PnLReportData,
  RevenueReportData,
  ExpenseReportData,
  HospitalityKpiReportData,
  RestaurantReportData,
  ReceivablesReportData,
  StaffCommissionReportData,
  StaffBookingHistoryItem,
} from '@/types/reports';

export interface ReportQueryParams {
  period?: FinancialPeriodFilter;
  property_id?: string;
  start_date?: string;
  end_date?: string;
  report_type?: FinancialReportType;
}

function extractReportData<T>(resData: any): T {
  if (resData && typeof resData === 'object' && 'data' in resData && !('period' in resData)) {
    return resData.data as T;
  }
  return resData as T;
}

export const reportService = {
  async getPnLReport(params?: ReportQueryParams): Promise<PnLReportData> {
    const response = await apiClient.get('/reports/financial/pnl/', { params });
    return extractReportData<PnLReportData>(response.data);
  },

  async getRevenueReport(params?: ReportQueryParams): Promise<RevenueReportData> {
    const response = await apiClient.get('/reports/financial/revenue/', { params });
    return extractReportData<RevenueReportData>(response.data);
  },

  async getExpenseReport(params?: ReportQueryParams): Promise<ExpenseReportData> {
    const response = await apiClient.get('/reports/financial/expenses/', { params });
    return extractReportData<ExpenseReportData>(response.data);
  },

  async getHospitalityKpiReport(params?: ReportQueryParams): Promise<HospitalityKpiReportData> {
    const response = await apiClient.get('/reports/financial/hospitality_kpis/', { params });
    return extractReportData<HospitalityKpiReportData>(response.data);
  },

  async getRestaurantReport(params?: ReportQueryParams): Promise<RestaurantReportData> {
    const response = await apiClient.get('/reports/financial/restaurant/', { params });
    return extractReportData<RestaurantReportData>(response.data);
  },

  async getReceivablesReport(params?: ReportQueryParams): Promise<ReceivablesReportData> {
    const response = await apiClient.get('/reports/financial/receivables/', { params });
    return extractReportData<ReceivablesReportData>(response.data);
  },

  async getStaffCommissionReport(params?: ReportQueryParams): Promise<StaffCommissionReportData> {
    const response = await apiClient.get('/reports/financial/staff-commissions/', { params });
    return extractReportData<StaffCommissionReportData>(response.data);
  },

  async getStaffBookingsHistory(params: { user_id: number; role_type: 'agent' | 'operator'; period?: string; property_id?: string; start_date?: string; end_date?: string }): Promise<StaffBookingHistoryItem[]> {
    const response = await apiClient.get('/reports/financial/staff-bookings/', { params });
    return extractReportData<StaffBookingHistoryItem[]>(response.data);
  },

  async exportFinancialSuiteCSV(params: ReportQueryParams): Promise<void> {
    const response = await apiClient.get('/reports/financial/suite_export_csv/', {
      params,
      responseType: 'blob',
    });
    const timestamp = new Date().toISOString().slice(0, 10);
    const reportType = params.report_type || 'pnl';
    triggerFileDownload(response.data, `financial-report-${reportType}-${timestamp}.csv`);
  },

  async exportPnlCSV(params?: Record<string, any>): Promise<void> {
    return this.exportFinancialSuiteCSV({ report_type: 'pnl', ...params });
  },

  async getPnLSummary(): Promise<any> {
    return {
      totalRevenue: 8250000,
      totalExpenses: 2850000,
      netProfit: 5400000,
      profitMargin: 65.4,
      period: 'Current Quarter (Q3 2026)',
    };
  },

  async getTrend(): Promise<any[]> {
    return [];
  },

  async getBreakdown(): Promise<any[]> {
    return [];
  },
};

