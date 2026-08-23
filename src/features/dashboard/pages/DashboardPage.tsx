import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { PeriodFilter } from '@/types/dashboard';
import { propertyService } from '@/features/properties/services/propertyService';
import { Property } from '@/types/properties';
import { BiMetricCard } from '../components/BiMetricCard';
import { LiveRoomGrid } from '../components/LiveRoomGrid';
import { OperationsPulseSection } from '../components/OperationsPulseSection';
import { MetricCardSkeleton } from '../components/skeletons/MetricCardSkeleton';
import { LiveRoomGridSkeleton } from '../components/skeletons/LiveRoomGridSkeleton';
import { OperationsPulseSkeleton } from '../components/skeletons/OperationsPulseSkeleton';

import {
  Building,
  Plus,
  DollarSign,
  Hotel,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/lib/rbac';
import { formatPKR } from '@/lib/formatters';

export function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodFilter>('today');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [properties, setProperties] = useState<Property[]>([]);

  // Load active properties list
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const list = await propertyService.getProperties();
        setProperties(list);
      } catch {
        // Handled in propertyService
      }
    };
    fetchProps();
  }, []);

  // Query Dashboard Analytics with TanStack Query
  const {
    data: analytics,
    isLoading,
    refetch,
  } = useDashboardAnalytics(period, selectedPropertyId === 'ALL' ? undefined : selectedPropertyId);

  const selectedPropName =
    selectedPropertyId !== 'ALL'
      ? properties.find((p) => String(p.id) === String(selectedPropertyId))?.name
      : null;

  return (
    <div className="space-y-6 font-sans">
      {/* A. Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {selectedPropName || 'Dashboard'}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Hotel Operations & Live Inventory
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Property Selector Dropdown */}
          {properties.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
              <Building className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1 text-slate-800"
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

          {/* Compact Period Filter Select */}
          <div className="bg-white border border-slate-200/80 rounded-lg px-2 py-1 text-xs shadow-2xs">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="today">Today (Live)</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Primary New Booking Action Button */}
          <Can permission="bookings:create">
            <Button
              onClick={() => navigate('/bookings')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Booking</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* B. KPI Metrics Row & Operations Pulse */}
      {isLoading ? (
        <>
          <MetricCardSkeleton />
          <LiveRoomGridSkeleton />
          <OperationsPulseSkeleton />
        </>
      ) : (
        <>
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Today's Revenue */}
              <BiMetricCard
                title="Today's Revenue"
                value={formatPKR(analytics.kpis.today_revenue)}
                subtitle={`Period: ${formatPKR(analytics.kpis.period_revenue)}`}
                trend={analytics.kpis.revenue_trend}
                icon={DollarSign}
                theme="emerald"
              />

              {/* Card 2: Occupancy Rate */}
              <BiMetricCard
                title="Occupancy Rate"
                value={`${analytics.kpis.occupancy_rate}%`}
                subtitle={`${analytics.kpis.occupied_rooms} / ${analytics.kpis.total_rooms} Rooms Booked`}
                trend={analytics.kpis.occupancy_trend}
                icon={Hotel}
                theme="blue"
              />

              {/* Card 3: Today's Check-Ins */}
              <BiMetricCard
                title="Today's Check-Ins"
                value={`${analytics.operations_pulse.today_arrivals.length}`}
                subtitle="Arrivals scheduled today"
                icon={LogIn}
                theme="indigo"
              />

              {/* Card 4: Housekeeping Alert */}
              <BiMetricCard
                title="Housekeeping Alert"
                value={`${analytics.operations_pulse.dirty_rooms_count}`}
                subtitle="Dirty rooms pending cleaning"
                icon={AlertCircle}
                theme="amber"
              />
            </div>
          )}

          {/* C. Live Room Status & Inventory Grid */}
          <LiveRoomGrid activePropertyId={selectedPropertyId === 'ALL' ? undefined : selectedPropertyId} />

          {/* D. Operations Pulse Hub (2-Column Split Section) */}
          {analytics && (
            <OperationsPulseSection pulse={analytics.operations_pulse} onRefresh={refetch} />
          )}
        </>
      )}
    </div>
  );
}
