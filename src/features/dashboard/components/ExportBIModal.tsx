import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { PeriodFilter, DashboardAnalyticsData } from '@/types/dashboard';
import { triggerFileDownload } from '@/lib/export';
import { reportService } from '@/features/reports/services/reportService';
import { toast } from '@/components/ui/ToastProvider';

interface ExportBIModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData?: DashboardAnalyticsData;
  period: PeriodFilter;
  propertyId?: string;
}

export function ExportBIModal({
  isOpen,
  onClose,
  analyticsData,
  period,
  propertyId,
}: ExportBIModalProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === 'csv') {
        // Trigger P&L / Executive CSV export via existing reportService helper
        await reportService.exportPnlCSV({
          period,
          property_id: propertyId !== 'ALL' ? propertyId : undefined,
        });
        toast.success('CSV Report exported successfully.');
      } else {
        // PDF Summary Export: generate formatted window print / download
        window.print();
        toast.success('PDF BI Report print dialog opened.');
      }
      onClose();
    } catch {
      toast.error('Failed to export BI report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Download className="h-5 w-5 text-indigo-600" />
            Export Executive BI Report
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Select export format for the active period ({period.toUpperCase()}) report data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setExportFormat('csv')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                exportFormat === 'csv'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                {exportFormat === 'csv' && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-slate-900">CSV Data Spreadsheet</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Raw daily metrics & time-series</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat('pdf')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                exportFormat === 'pdf'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileText className="h-6 w-6 text-indigo-600" />
                {exportFormat === 'pdf' && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-slate-900">PDF Printable Document</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Formatted executive layout</div>
              </div>
            </button>
          </div>

          {analyticsData && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Period Scope:</span>
                <span className="font-semibold text-slate-900 uppercase">{period}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Revenue:</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  PKR {analyticsData.kpis.period_revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Occupancy Rate:</span>
                <span className="font-semibold text-blue-700 font-mono">
                  {analyticsData.kpis.occupancy_rate}%
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Generating...' : 'Download Report'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
