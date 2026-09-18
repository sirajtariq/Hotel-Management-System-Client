import React, { useState } from 'react';
import { StaffCommissionReportData, StaffBookingHistoryItem } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';
import { Users, FileText, X, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { toast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/utils';

interface StaffCommissionTabProps {
  data: StaffCommissionReportData;
}

export function StaffCommissionTab({ data }: StaffCommissionTabProps) {
  const operatorsSummary = data?.operators_summary ?? data?.operatorsSummary ?? [];
  const agentsSummary = data?.agents_summary ?? data?.agentsSummary ?? [];

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState<StaffBookingHistoryItem[]>([]);
  const [activeStaffName, setActiveStaffName] = useState<string>('');
  const [activeRole, setActiveRole] = useState<string>('');
  const [activeCount, setActiveCount] = useState<number>(0);

  const openDrawer = async (userId: number, roleType: 'operator' | 'agent', staffName: string, displayRole: string, count: number) => {
    setActiveStaffName(staffName);
    setActiveRole(displayRole);
    setActiveCount(count);
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerData([]);

    try {
      const propertyIdStr = new URLSearchParams(window.location.search).get('property_id') || undefined;
      const history = await reportService.getStaffBookingsHistory({
        user_id: userId,
        role_type: roleType,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
        property_id: propertyIdStr === 'ALL' ? undefined : propertyIdStr,
      });
      setDrawerData(history);
    } catch (err) {
      toast.error('Failed to load history', 'Could not retrieve bookings history.');
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 4 Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans">
            {data?.total_bookings_created ?? data?.totalBookingsCreated ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bookings handled across property</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Referred Bookings</span>
          <div className="text-2xl font-bold text-indigo-900 mt-1 font-sans">
            {data?.commission_eligible_bookings ?? data?.commissionEligibleBookings ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bookings by referral agents</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Entered</span>
          <div className="text-2xl font-bold text-emerald-900 mt-1 font-sans">
            {formatPKR(data?.total_revenue_handled ?? data?.totalRevenueHandled ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Gross sales logged in system</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Commission</span>
          <div className="text-2xl font-bold text-rose-900 mt-1 font-sans">
            {formatPKR(data?.total_commission_payable ?? data?.totalCommissionPayable ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Payable to referral agents</div>
        </div>
      </div>

      {/* Grid for Dual Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table 1: Data Entry Operators */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Data Entry Operators
            </h3>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">Front Desk</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Operator Name</th>
                  <th className="p-3 text-center">Entries</th>
                  <th className="p-3 text-right">Revenue (PKR)</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operatorsSummary.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500 text-sm">
                      No operator data found.
                    </td>
                  </tr>
                ) : (
                  operatorsSummary.map((op, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">{op.user_name ?? op.userName}</td>
                      <td className="p-3 text-center font-medium text-indigo-700">{op.total_entries_count ?? op.totalEntriesCount}</td>
                      <td className="p-3 text-right font-mono text-emerald-700">
                        {formatPKR(op.total_revenue_entered ?? op.totalRevenueEntered ?? 0)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openDrawer(op.user_id ?? op.userId!, 'operator', op.user_name ?? op.userName!, 'Data Entry Operator', op.total_entries_count ?? op.totalEntriesCount!)}
                          className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded transition-colors"
                        >
                          Entries <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Commission Agents */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-rose-600" />
              Commission & Referral Agents
            </h3>
            <span className="text-xs font-medium bg-rose-50 text-rose-600 px-2 py-1 rounded">Referrals</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Agent Name</th>
                  <th className="p-3 text-center">Referred</th>
                  <th className="p-3 text-right">Commission (PKR)</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentsSummary.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500 text-sm">
                      No referral agent data found.
                    </td>
                  </tr>
                ) : (
                  agentsSummary.map((agent, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">{agent.agent_name ?? agent.agentName}</td>
                      <td className="p-3 text-center font-medium text-rose-700">{agent.referred_bookings_count ?? agent.referredBookingsCount}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-700">
                        {formatPKR(agent.commission_earned ?? agent.commissionEarned ?? 0)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openDrawer(agent.agent_id ?? agent.agentId!, 'agent', agent.agent_name ?? agent.agentName!, 'Referral Agent', agent.referred_bookings_count ?? agent.referredBookingsCount!)}
                          className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-1.5 rounded transition-colors"
                        >
                          Bookings <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer / Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)} />
          
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
              <div className="flex h-full flex-col bg-white shadow-2xl border-l border-slate-200">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2" id="slide-over-title">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      {activeStaffName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeRole} • Showing max 100 recent entries out of {activeCount} total.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-md bg-white text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Drawer Content (History Table) */}
                <div className="relative flex-1 overflow-y-auto p-6">
                  {drawerLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      <p className="text-sm font-medium text-slate-500">Loading booking history...</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Ref ID</th>
                            <th className="p-3">Check In</th>
                            <th className="p-3">Guest Name</th>
                            <th className="p-3">Room</th>
                            <th className="p-3 text-right">Amount (PKR)</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {drawerData.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                                No booking history records found.
                              </td>
                            </tr>
                          ) : (
                            drawerData.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3 text-slate-600 font-mono">{item.booking_reference ?? item.bookingReference}</td>
                                <td className="p-3 text-slate-600">{item.check_in_date ?? item.checkInDate}</td>
                                <td className="p-3 font-semibold text-slate-900">{item.guest_name ?? item.guestName}</td>
                                <td className="p-3 text-slate-600 font-medium">{item.room_number ?? item.roomNumber}</td>
                                <td className="p-3 text-right font-mono text-emerald-700">
                                  {formatPKR(item.total_amount ?? item.totalAmount ?? 0)}
                                </td>
                                <td className="p-3 text-center">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                    item.status === 'CONFIRMED' || item.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' :
                                    item.status === 'CHECKED_OUT' ? 'bg-indigo-100 text-indigo-800' :
                                    item.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                                  )}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
