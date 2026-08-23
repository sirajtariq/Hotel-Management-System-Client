import { AlertTriangle, Clock, Lock } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function SubscriptionAlertBanner() {
  const { user } = useAuth();

  // If user is pure SuperAdmin (non-impersonated), don't show tenant alert
  const role = user?.role?.toLowerCase();
  const isSuperAdmin = (role === 'super_admin' || role === 'superadmin') && !user?.is_impersonated;

  if (isSuperAdmin) return null;

  // Check tenant details from user or active tenant context
  const tenantDetails: any = (user as any)?.tenant_details || {};
  const status = tenantDetails?.subscription_status || 'PAID';
  const dueDate = tenantDetails?.next_due_date;

  if (status === 'PAID') return null;

  return (
    <div
      className={`px-4 py-2.5 text-xs font-medium border-b flex items-center justify-between shadow-xs ${
        status === 'OVERDUE'
          ? 'bg-rose-900 text-white border-rose-800'
          : status === 'GRACE_PERIOD'
          ? 'bg-amber-500 text-slate-950 border-amber-600 font-semibold'
          : 'bg-amber-50 text-amber-900 border-amber-200'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {status === 'OVERDUE' ? (
          <Lock className="h-4 w-4 shrink-0 text-rose-300 animate-bounce" />
        ) : status === 'GRACE_PERIOD' ? (
          <Clock className="h-4 w-4 shrink-0 text-slate-950" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
        )}

        <div>
          {status === 'OVERDUE' && (
            <span>
              <strong>SUBSCRIPTION EXPIRED:</strong> Your hotel subscription is <strong>OVERDUE</strong>. Data mutations are locked until payment renewal. Please contact SuperAdmin.
            </span>
          )}

          {status === 'GRACE_PERIOD' && (
            <span>
              <strong>SUBSCRIPTION GRACE PERIOD:</strong> Payment was due {dueDate ? `on ${dueDate}` : 'recently'}. Please clear invoice immediately to prevent service locking.
            </span>
          )}

          {status === 'DUE_SOON' && (
            <span>
              <strong>Subscription Payment Due Soon:</strong> Next billing date is <strong>{dueDate || 'approaching'}</strong>. Please process payment with SuperAdmin to retain uninterrupted access.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
