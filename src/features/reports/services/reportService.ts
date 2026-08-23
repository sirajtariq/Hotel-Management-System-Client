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
} from '@/types/reports';

export interface ReportQueryParams {
  period?: FinancialPeriodFilter;
  property_id?: string;
  start_date?: string;
  end_date?: string;
  report_type?: FinancialReportType;
}

export const reportService = {
  async getPnLReport(params?: ReportQueryParams): Promise<PnLReportData> {
    const response = await apiClient.get<PnLReportData>('/reports/financial/pnl/', { params });
    return response.data;
  },

  async getRevenueReport(params?: ReportQueryParams): Promise<RevenueReportData> {
    const response = await apiClient.get<RevenueReportData>('/reports/financial/revenue/', { params });
    return response.data;
  },

  async getExpenseReport(params?: ReportQueryParams): Promise<ExpenseReportData> {
    const response = await apiClient.get<ExpenseReportData>('/reports/financial/expenses/', { params });
    return response.data;
  },

  async getHospitalityKpiReport(params?: ReportQueryParams): Promise<HospitalityKpiReportData> {
    const response = await apiClient.get<HospitalityKpiReportData>('/reports/financial/hospitality_kpis/', { params });
    return response.data;
  },

  async getRestaurantReport(params?: ReportQueryParams): Promise<RestaurantReportData> {
    const response = await apiClient.get<RestaurantReportData>('/reports/financial/restaurant/', { params });
    return response.data;
  },

  async getReceivablesReport(params?: ReportQueryParams): Promise<ReceivablesReportData> {
    const response = await apiClient.get<ReceivablesReportData>('/reports/financial/receivables/', { params });
    return response.data;
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

