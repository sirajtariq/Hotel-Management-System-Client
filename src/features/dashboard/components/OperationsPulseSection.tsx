import React, { useState } from 'react';
import { OperationsPulse } from '@/types/dashboard';
import { LogIn, LogOut, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPKR } from '@/lib/formatters';
import { Can } from '@/lib/rbac';
import { apiClient } from '@/lib/axios';
import { toast } from '@/components/ui/ToastProvider';

interface OperationsPulseSectionProps {
  pulse: OperationsPulse;
  onRefresh?: () => void;
}

export function OperationsPulseSection({ pulse, onRefresh }: OperationsPulseSectionProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleCheckIn = async (bookingId: number) => {
    setLoadingId(bookingId);
    try {
      await apiClient.post(`/bookings/${bookingId}/check_in/`);
      toast.success('Guest checked in successfully & room marked OCCUPIED.');
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to check in guest.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCheckOut = async (bookingId: number) => {
    setLoadingId(bookingId);
    try {
      await apiClient.post(`/bookings/${bookingId}/check_out/`);
      toast.success('Guest checked out successfully & room marked CLEANING.');
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to check out guest.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Today's Arrivals Column */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <LogIn className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Today's Arrivals</h3>
              <p className="text-xs text-slate-500">Expected check-ins scheduled for today</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {(pulse?.today_arrivals || []).length}
          </span>
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
          {(!pulse?.today_arrivals || pulse.today_arrivals.length === 0) ? (
            <div className="py-10 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto opacity-80" />
              <p className="font-medium text-slate-600">No pending arrivals today</p>
              <p className="text-slate-400 text-[11px]">All scheduled arrivals have checked in</p>
            </div>
          ) : (
            pulse.today_arrivals.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/60 border border-slate-200/70 rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate" title={item.guest_name}>
                      {item.guest_name}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-indigo-100/80 shrink-0">
                      Room #{item.room_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{item.room_type_name}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Adv: {formatPKR(item.advance_paid)}</span>
                  </div>
                </div>

                <Can permission="bookings:update">
                  <Button
                    size="sm"
                    disabled={loadingId === item.id}
                    onClick={() => handleCheckIn(item.id)}
                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shrink-0 gap-1.5 shadow-2xs"
                  >
                    {loadingId === item.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="h-3.5 w-3.5" />
                        <span>Check In</span>
                      </>
                    )}
                  </Button>
                </Can>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Today's Departures Column */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <LogOut className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Today's Departures</h3>
              <p className="text-xs text-slate-500">Scheduled check-outs & folio settlements</p>
            </div>
          </div>
          <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {(pulse?.today_departures || []).length}
          </span>
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
          {(!pulse?.today_departures || pulse.today_departures.length === 0) ? (
            <div className="py-10 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="h-6 w-6 text-blue-500 mx-auto opacity-80" />
              <p className="font-medium text-slate-600">No departures due today</p>
              <p className="text-slate-400 text-[11px]">All checked-in guests staying through</p>
            </div>
          ) : (
            pulse.today_departures.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/60 border border-slate-200/70 rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate" title={item.guest_name}>
                      {item.guest_name}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-slate-200/80 shrink-0">
                      Room #{item.room_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Balance Due:</span>
                    <span
                      className={
                        item.total_balance > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-medium'
                      }
                    >
                      {formatPKR(item.total_balance)}
                    </span>
                  </div>
                </div>

                <Can permission="bookings:update">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingId === item.id}
                    onClick={() => handleCheckOut(item.id)}
                    className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold rounded-lg shrink-0 gap-1.5 shadow-2xs"
                  >
                    {loadingId === item.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="h-3.5 w-3.5 text-slate-500" />
                        <span>Check Out</span>
                      </>
                    )}
                  </Button>
                </Can>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
