import React, { useEffect, useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Clock,
  LogIn,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TenantItem } from '@/types/tenants';
import { tenantService } from '../services/tenantService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from '@/components/ui/ToastProvider';

interface TenantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string | null;
  onToggleStatus?: (tenant: TenantItem) => void;
}

export function TenantDetailModal({
  isOpen,
  onClose,
  tenantId,
  onToggleStatus,
}: TenantDetailModalProps) {
  const { impersonateTenant } = useAuth();
  const [tenant, setTenant] = useState<TenantItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && tenantId) {
      const fetchDetail = async () => {
        setIsLoading(true);
        try {
          const data = await tenantService.getTenant(tenantId);
          setTenant(data);
        } catch {
          setTenant(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, tenantId]);

  if (!isOpen || !tenantId) return null;

  const handleImpersonate = async () => {
    const activeState = tenant?.is_active ?? (tenant as any)?.isActive ?? true;
    if (!tenant || !activeState) return;
    setIsImpersonating(true);
    try {
      await impersonateTenant(tenant.id);
    } catch (err) {
      toast.error('Failed to launch impersonation session.');
    } finally {
      setIsImpersonating(false);
    }
  };

  const formatPKR = (amount?: number | string) => {
    const num = Number(amount) || 0;
    return `Rs. ${num.toLocaleString('en-PK')}`;
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const renderUsageBar = (current?: number, max?: number | null, label?: string) => {
    const curr = current ?? 0;
    const isUnlimited = max === null || max === undefined;
    const percentage = isUnlimited ? 0 : Math.min(100, Math.round((curr / (max || 1)) * 100));

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">{label}</span>
          <span className="font-mono text-slate-600 font-bold">
            {curr} / {isUnlimited ? '∞ Unlimited' : max}
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentage >= 90
                  ? 'bg-rose-500'
                  : percentage >= 75
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  const activeState = tenant?.is_active ?? (tenant as any)?.isActive ?? true;
  const planName = tenant?.subscription_plan ?? (tenant as any)?.subscriptionPlan ?? 'STANDARD';
  const billingCycle = tenant?.billing_type ?? (tenant as any)?.billingType ?? 'MONTHLY';
  const priceVal = tenant?.price_amount ?? (tenant as any)?.priceAmount ?? 0;
  const startDate = tenant?.subscription_start_date ?? (tenant as any)?.subscriptionStartDate;
  const dueDate = tenant?.next_due_date ?? (tenant as any)?.nextDueDate;
  const graceDays = tenant?.grace_period_days ?? (tenant as any)?.gracePeriodDays ?? 7;
  const emailVal = tenant?.contact_email ?? (tenant as any)?.contactEmail ?? 'N/A';
  const phoneVal = tenant?.contact_phone ?? (tenant as any)?.contactPhone ?? 'N/A';

  const currentProps = tenant?.current_properties_count ?? (tenant as any)?.currentPropertiesCount ?? 0;
  const maxProps = tenant?.max_properties ?? (tenant as any)?.maxProperties;

  const currentRooms = tenant?.current_rooms_count ?? (tenant as any)?.currentRoomsCount ?? 0;
  const maxRooms = tenant?.max_rooms ?? (tenant as any)?.maxRooms;

  const currentUsers = tenant?.current_users_count ?? (tenant as any)?.currentUsersCount ?? tenant?.users_count ?? 0;
  const maxUsers = tenant?.max_users ?? (tenant as any)?.maxUsers;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-indigo-900 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 truncate">
                {tenant?.name || 'Loading Tenant...'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                slug: {tenant?.slug || tenantId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Fetching detailed tenant profile...</span>
            </div>
          ) : tenant ? (
            <>
              {/* Quick Actions & Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      activeState
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {activeState ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>{activeState ? 'Active' : 'Disabled'}</span>
                  </span>

                  {onToggleStatus && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleStatus(tenant)}
                      className="text-xs h-7 text-slate-600 hover:text-slate-900"
                    >
                      Toggle
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={handleImpersonate}
                  disabled={isImpersonating || !activeState}
                  className="gap-1.5 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white shadow-xs"
                >
                  {isImpersonating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogIn className="h-3.5 w-3.5" />
                  )}
                  <span>Login as Tenant</span>
                </Button>
              </div>

              {/* Subscription & Financials */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Subscription & Financials</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Subscription Plan</div>
                    <div className="font-bold text-slate-900 mt-0.5">{planName}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Billing Cycle</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {billingCycle === 'ONE_TIME'
                        ? 'One-Time License'
                        : billingCycle === 'ANNUAL'
                        ? 'Annual'
                        : 'Monthly'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Fee Amount</div>
                    <div className="font-bold text-indigo-900 mt-0.5">{formatPKR(priceVal)}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Grace Period</div>
                    <div className="font-bold text-slate-900 mt-0.5">{graceDays} Days</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Start Date</div>
                    <div className="font-medium text-slate-700 mt-0.5">{formatDate(startDate)}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Next Due Date</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{formatDate(dueDate)}</div>
                  </div>
                </div>
              </div>

              {/* Quota Limits & Usage Bars */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Quota Limits & Active Usage</span>
                </h3>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                  {renderUsageBar(currentProps, maxProps, 'Properties Count')}
                  {renderUsageBar(currentRooms, maxRooms, 'Total Rooms Count')}
                  {renderUsageBar(currentUsers, maxUsers, 'Staff & User Accounts')}
                </div>
              </div>

              {/* Contact & Admin Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Contact & Metadata</span>
                </h3>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>Contact Email:</span>
                    </span>
                    <span className="font-semibold text-slate-900">{emailVal}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>Contact Phone:</span>
                    </span>
                    <span className="font-semibold text-slate-900">{phoneVal}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Onboarded Date:</span>
                    </span>
                    <span className="font-medium text-slate-700">{formatDate(tenant.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              {tenant.notes && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Internal Notes</span>
                  </h3>
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 leading-relaxed font-medium">
                    {tenant.notes}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              Unable to load tenant record.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
