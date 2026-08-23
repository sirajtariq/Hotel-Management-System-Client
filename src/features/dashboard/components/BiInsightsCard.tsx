import React from 'react';
import { KpiMetrics, OperationsPulse, RoomTypeOccupancyItem } from '@/types/dashboard';
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { formatPKR } from '@/lib/formatters';

interface BiInsightsCardProps {
  kpis: KpiMetrics;
  pulse: OperationsPulse;
  roomTypes: RoomTypeOccupancyItem[];
}

export function BiInsightsCard({ kpis, pulse, roomTypes }: BiInsightsCardProps) {
  // Compute contextual insights
  const insights: Array<{
    type: 'warning' | 'opportunity' | 'action';
    title: string;
    description: string;
    badge: string;
  }> = [];

  // Insight 1: Occupancy Surge or Low Demand Alert
  const highDemandType = roomTypes.find((rt) => rt.occupancy_rate >= 80);
  if (highDemandType) {
    insights.push({
      type: 'opportunity',
      title: `Occupancy Surge: ${highDemandType.room_type} (${highDemandType.occupancy_rate}%)`,
      description: `${highDemandType.room_type} rooms are at high capacity. Consider adjusting dynamic pricing or upselling available suites.`,
      badge: 'Revenue Dynamic',
    });
  } else if (kpis.occupancy_rate < 40) {
    insights.push({
      type: 'warning',
      title: `Low Demand Alert: Overall Occupancy at ${kpis.occupancy_rate}%`,
      description: 'Property occupancy is currently below normal threshold. Launch targeted weekend promos or corporate packages.',
      badge: 'Demand Boost',
    });
  } else {
    insights.push({
      type: 'opportunity',
      title: `Balanced Occupancy Rate: ${kpis.occupancy_rate}%`,
      description: `RevPAR is averaging ${formatPKR(kpis.revpar)}. Maintain current rate strategy to preserve yields.`,
      badge: 'Performance Optimum',
    });
  }

  // Insight 2: Uncollected Folio Balances Warning
  const totalUnpaidFolios = pulse.pending_payments.reduce((sum, item) => sum + item.balance, 0);
  if (pulse.pending_payments.length > 0) {
    insights.push({
      type: 'warning',
      title: `Uncollected Folio Balances: ${formatPKR(totalUnpaidFolios)}`,
      description: `${pulse.pending_payments.length} checked-in guest folios have pending outstanding balances. Ensure front desk collects settlements prior to check-out.`,
      badge: 'Folio Settlement',
    });
  } else {
    insights.push({
      type: 'action',
      title: 'Zero Unpaid Folios Outstanding',
      description: 'All active checked-in guests have fully settled their room charges and advance deposits.',
      badge: 'Financial Health',
    });
  }

  // Insight 3: Housekeeping Turnaround Status
  if (pulse.dirty_rooms_count > 0) {
    insights.push({
      type: 'action',
      title: `Housekeeping Queue: ${pulse.dirty_rooms_count} Rooms Dirty`,
      description: `${pulse.dirty_rooms_count} rooms require cleaning turnaround before next arrivals. Dispatch housekeeping crew to expedite check-in readiness.`,
      badge: 'Operations Dispatch',
    });
  } else {
    insights.push({
      type: 'action',
      title: 'Housekeeping Turnaround Complete',
      description: 'All property room inventory is inspected and ready for immediate walk-in bookings.',
      badge: 'Inventory Ready',
    });
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 border border-indigo-900/60 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Lightbulb className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white">Smart BI Operational Insights</h3>
            <p className="text-xs text-indigo-200/80">Real-time analytical recommendations & yield alerts</p>
          </div>
        </div>
        <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          3 Live Signals
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className="bg-indigo-900/40 border border-indigo-700/50 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:bg-indigo-900/60 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {item.badge}
                </span>
                {item.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                ) : item.type === 'opportunity' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
              <p className="text-[11px] text-indigo-200/80 mt-1.5 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-2 border-t border-indigo-800/40 flex items-center text-[10px] font-semibold text-indigo-300 gap-1 mt-auto">
              <span>View details</span>
              <ArrowRight className="h-3 w-3 text-indigo-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
