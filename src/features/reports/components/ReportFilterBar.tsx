import React from 'react';
import { FinancialPeriodFilter, FinancialReportType } from '@/types/reports';
import { Property } from '@/types/properties';
import { Building, Download, Printer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/lib/rbac';
import { cn } from '@/lib/utils';

interface ReportFilterBarProps {
  period: FinancialPeriodFilter;
  setPeriod: (period: FinancialPeriodFilter) => void;
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  properties: Property[];
  activeTab: FinancialReportType;
  onExportCSV: () => void;
  onTriggerPrint: () => void;
  isExporting: boolean;
}

export function ReportFilterBar({
  period,
  setPeriod,
  selectedPropertyId,
  setSelectedPropertyId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  properties,
  activeTab,
  onExportCSV,
  onTriggerPrint,
  isExporting,
}: ReportFilterBarProps) {
  const presets: { id: FinancialPeriodFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'ytd', label: 'YTD' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Filter Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Property Selector */}
          {properties.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <Building className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer text-slate-800"
              >
                <option value="ALL">All Properties ({properties.length})</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Period Preset Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs overflow-x-auto">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer shrink-0',
                  period === p.id
                    ? 'bg-white text-indigo-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {period === 'custom' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200/80 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 text-xs"
              />
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          <Can permission="reports:export">
            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={onExportCSV}
              className="h-8.5 gap-1.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold"
            >
              <Download className="h-3.5 w-3.5 text-indigo-600" />
              <span>Export CSV</span>
            </Button>
          </Can>

          <Can permission="reports:export">
            <Button
              size="sm"
              onClick={onTriggerPrint}
              className="h-8.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </Button>
          </Can>
        </div>
      </div>
    </div>
  );
}
