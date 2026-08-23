import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { propertyService } from '@/features/properties/services/propertyService';
import { Property } from '@/types/properties';
import { FinancialPeriodFilter, FinancialReportType } from '@/types/reports';
import { reportService } from '../services/reportService';
import { useFinancialReports } from '../hooks/useFinancialReports';
import { ReportFilterBar } from '../components/ReportFilterBar';
import { ReportTabSkeleton } from '../components/skeletons/ReportTabSkeleton';

import { PnLReportTab } from '../components/tabs/PnLReportTab';
import { RevenueAnalyticsTab } from '../components/tabs/RevenueAnalyticsTab';
import { ExpenseAnalyticsTab } from '../components/tabs/ExpenseAnalyticsTab';
import { HospitalityKpiTab } from '../components/tabs/HospitalityKpiTab';
import { RestaurantReportTab } from '../components/tabs/RestaurantReportTab';
import { ReceivablesTaxTab } from '../components/tabs/ReceivablesTaxTab';
import { PrintableFinancialReport } from '../components/print/PrintableFinancialReport';

import {
  FileText,
  DollarSign,
  TrendingDown,
  Activity,
  UtensilsCrossed,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/utils';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<FinancialReportType>('pnl');
  const [period, setPeriod] = useState<FinancialPeriodFilter>('this_month');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Load property branches list
  useEffect(() => {
    propertyService.getProperties().then(setProperties).catch(() => {});
  }, []);

  const queryParams = {
    period,
    property_id: selectedPropertyId !== 'ALL' ? selectedPropertyId : undefined,
    start_date: period === 'custom' ? startDate : undefined,
    end_date: period === 'custom' ? endDate : undefined,
    report_type: activeTab,
  };

  const { data, isLoading, refetch } = useFinancialReports(activeTab, queryParams);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await reportService.exportFinancialSuiteCSV(queryParams);
      toast.success('CSV Export Downloaded', `Financial report (${activeTab.toUpperCase()}) exported successfully.`);
    } catch {
      toast.error('Export Failed', 'Could not stream CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const selectedPropName =
    selectedPropertyId !== 'ALL'
      ? properties.find((p) => String(p.id) === String(selectedPropertyId))?.name
      : 'All Properties';

  return (
    <PermissionGuard permission="reports:view_pnl" moduleName="Financial Intelligence & Accounting Suite">
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Financial Intelligence & Accounting Suite"
          description="Enterprise profit-and-loss auditing, revenue matrix, expenditure logs, and tax compliance"
        />

        {/* Global Filter Bar */}
        <ReportFilterBar
          period={period}
          setPeriod={setPeriod}
          selectedPropertyId={selectedPropertyId}
          setSelectedPropertyId={setSelectedPropertyId}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          properties={properties}
          activeTab={activeTab}
          onExportCSV={handleExportCSV}
          onTriggerPrint={handleTriggerPrint}
          isExporting={isExporting}
        />

        {/* Segmented Tab Switcher Bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'pnl', label: 'P&L Statement', icon: FileText },
            { id: 'revenue', label: 'Revenue & Sales', icon: DollarSign },
            { id: 'expenses', label: 'Expense Analysis', icon: TrendingDown },
            { id: 'hospitality', label: 'Hospitality KPIs', icon: Activity },
            { id: 'restaurant', label: 'Restaurant & F&B', icon: UtensilsCrossed },
            { id: 'receivables', label: 'Tax & Receivables', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as FinancialReportType)}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        {isLoading ? (
          <ReportTabSkeleton />
        ) : data ? (
          <div>
            {activeTab === 'pnl' && <PnLReportTab data={data as any} />}
            {activeTab === 'revenue' && <RevenueAnalyticsTab data={data as any} />}
            {activeTab === 'expenses' && <ExpenseAnalyticsTab data={data as any} />}
            {activeTab === 'hospitality' && <HospitalityKpiTab data={data as any} />}
            {activeTab === 'restaurant' && <RestaurantReportTab data={data as any} />}
            {activeTab === 'receivables' && <ReceivablesTaxTab data={data as any} onRefresh={refetch} />}
          </div>

        ) : null}

        {/* Dedicated High-Resolution A4 Printable PDF Report Component */}
        <PrintableFinancialReport
          reportData={data}
          activeTab={activeTab}
          period={period}
          propertyName={selectedPropName}
        />
      </div>
    </PermissionGuard>
  );
}
