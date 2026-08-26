import { useState } from 'react';
import { useRestaurantOrders } from '../hooks/useRestaurantOrders';
import { KitchenOrderCard } from '../components/kitchen/KitchenOrderCard';
import { KitchenKDSSkeleton } from '../components/skeletons/KitchenKDSSkeleton';
import { ChefHat, RefreshCw, Flame, CheckCircle2, Utensils } from 'lucide-react';

export function KitchenDisplayPage() {
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'PREPARING' | 'READY'>('ALL');
  const { orders, loading, refetchOrders, updateKitchenStatus } = useRestaurantOrders({
    active_kitchen: true,
    autoRefreshMs: 10000,
  });

  const filteredOrders = orders.filter((o) => {
    if (filterTab === 'ALL') return true;
    return o.status === filterTab;
  });

  const counts = {
    pending: orders.filter((o) => o.status === 'PENDING').length,
    preparing: orders.filter((o) => o.status === 'PREPARING').length,
    ready: orders.filter((o) => o.status === 'READY').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-500 font-normal">
              Live order preparation matrix and real-time ticket monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchOrders()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilterTab('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterTab === 'ALL'
              ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">All Active</div>
          <div className="text-xl font-bold mt-1">{orders.length}</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('PENDING')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterTab === 'PENDING'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">Pending</span>
            <Flame className="h-4 w-4 text-rose-200" />
          </div>
          <div className="text-xl font-bold mt-1">{counts.pending}</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('PREPARING')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterTab === 'PREPARING'
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">In Kitchen</span>
            <ChefHat className="h-4 w-4 text-amber-100" />
          </div>
          <div className="text-xl font-bold mt-1">{counts.preparing}</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('READY')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterTab === 'READY'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">Ready</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-100" />
          </div>
          <div className="text-xl font-bold mt-1">{counts.ready}</div>
        </button>
      </div>

      {/* Kitchen Orders Grid */}
      {loading && orders.length === 0 ? (
        <KitchenKDSSkeleton />
      ) : filteredOrders.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Utensils className="h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-xs font-semibold text-slate-700">Kitchen Display Clear</h3>
          <p className="text-xs text-slate-400 mt-1">No active cooking tickets currently in this queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order) => (
            <KitchenOrderCard key={order.id} order={order} onUpdateStatus={updateKitchenStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
