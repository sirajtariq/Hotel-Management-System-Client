import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Building2,
  DollarSign,
  PieChart,
  ArrowUpRight,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tenantService } from '@/features/tenants/services/tenantService';
import { TenantItem } from '@/types/tenants';
import { TenantBillingHistoryModal } from '@/features/tenants/components/TenantBillingHistoryModal';
import { Skeleton } from '@/components/ui/Skeleton';

export function PlatformAnalyticsPage() {
  const [metrics, setMetrics] = useState<{
    monthlyMrr: number;
    estimatedArr: number;
    oneTimeRevenue: number;
    activeTenantsCount: number;
    totalTenantsCount: number;
  }>({
    monthlyMrr: 0,
    estimatedArr: 0,
    oneTimeRevenue: 0,
    activeTenantsCount: 0,
    totalTenantsCount: 0,
  });

  const [breakdown, setBreakdown] = useState<TenantItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [historyTenantId, setHistoryTenantId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await tenantService.getPlatformAnalytics();
      setMetrics({
        monthlyMrr: res.metrics?.monthlyMrr ?? (res.metrics as any)?.monthly_mrr ?? 0,
        estimatedArr: res.metrics?.estimatedArr ?? (res.metrics as any)?.estimated_arr ?? 0,
        oneTimeRevenue: res.metrics?.oneTimeRevenue ?? (res.metrics as any)?.one_time_revenue ?? 0,
        activeTenantsCount: res.metrics?.activeTenantsCount ?? (res.metrics as any)?.active_tenants_count ?? 0,
        totalTenantsCount: res.metrics?.totalTenantsCount ?? (res.metrics as any)?.total_tenants_count ?? 0,
      });
      setBreakdown(res.breakdown || []);
    } catch (err) {
      console.error('Failed to load platform analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatPKR = (amount: number) => `PKR ${(amount || 0).toLocaleString('en-PK')}`;

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'OVERDUE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
            Overdue
          </span>
        );
      case 'DUE_SOON':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            Due Soon
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            Paid
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-xs">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Analytics & MRR</h1>
            <p className="text-xs text-slate-500 font-medium">
              Global SaaS platform metrics, annual run-rate (ARR) & tenant revenue distribution
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchData}
          disabled={isLoading}
          className="text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly MRR */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly MRR</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatPKR(metrics.monthlyMrr)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Active recurring monthly revenue</span>
          </div>
        </div>

        {/* Card 2: Estimated ARR */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated ARR</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatPKR(metrics.estimatedArr)}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Annualized run-rate (MRR × 12)</div>
        </div>

        {/* Card 3: One-Time Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">One-Time Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatPKR(metrics.oneTimeRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Lifetime setup & add-ons</div>
        </div>

        {/* Card 4: Active Hotel Tenants */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Hotel Tenants</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{metrics.activeTenantsCount}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            Out of {metrics.totalTenantsCount} total registered hotels
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Tenant */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Tenant Subscription Breakdown</h2>
          <span className="text-xs text-slate-500 font-medium">{breakdown.length} Hotel Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Hotel Name</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Billing Cycle</th>
                <th className="py-3 px-4">MRR / Price Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 px-4 text-right"><Skeleton className="h-7 w-20 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : breakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No tenant subscription data found.
                  </td>
                </tr>
              ) : (
                breakdown.map((t) => {
                  const planName = t.subscription_plan ?? (t as any).subscriptionPlan ?? 'BASIC';
                  const billingCycle = t.billing_type ?? (t as any).billingType ?? 'MONTHLY';
                  const priceVal = t.price_amount ?? (t as any).priceAmount ?? 0;
                  const statusVal = t.subscription_status ?? (t as any).subscriptionStatus ?? 'PAID';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">slug: {t.slug}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            planName === 'PREMIUM'
                              ? 'bg-purple-100 text-purple-700'
                              : planName === 'STANDARD'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {planName}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {billingCycle === 'ANNUAL' ? 'Per Year (Annual)' : 'Per Month (Monthly)'}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        PKR {Number(priceVal).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        {renderStatusBadge(statusVal)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setHistoryTenantId(t.id)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>History</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Billing & Subscription History Modal */}
      <TenantBillingHistoryModal
        isOpen={!!historyTenantId}
        onClose={() => setHistoryTenantId(null)}
        tenantId={historyTenantId}
      />
    </div>
  );
}
