import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Building2,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tenantService } from '@/features/tenants/services/tenantService';
import { TenantMetrics, TenantItem } from '@/types/tenants';

export function PlatformAnalyticsPage() {
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [m, t] = await Promise.all([
        tenantService.getMetrics(),
        tenantService.getTenants(),
      ]);
      setMetrics(m);
      setTenants(t.items);
    } catch (err) {
      console.error('Failed to load platform analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatPKR = (amount: number) => `Rs. ${(amount || 0).toLocaleString('en-PK')}`;

  const arr = (metrics?.monthly_recurring_revenue || 0) * 12 + (metrics?.annual_recurring_revenue || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-sm">
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
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly MRR</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatPKR(metrics?.monthly_recurring_revenue || 0)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Recurring monthly subscriptions</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated ARR</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatPKR(arr)}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Annualized recurring run-rate</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">One-Time Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatPKR(metrics?.one_time_revenue || 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Lifetime perpetual licenses</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Hotel Tenants</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{metrics?.active_tenants || 0}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            Out of {metrics?.total_tenants || 0} total registered
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Tenant */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Tenant Subscription Breakdown</h2>

        <div className="divide-y divide-slate-100">
          {tenants.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-[11px] text-slate-400">
                  {t.subscription_plan} Plan — {t.billing_type === 'ONE_TIME' ? 'One-Time License' : 'Monthly Subscription'}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-900">{formatPKR(Number(t.price_amount))}</div>
                <div className="text-[10px] font-semibold text-emerald-600 uppercase">
                  {t.subscription_status || 'PAID'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
