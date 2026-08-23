import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function ImpersonationBanner() {
  const { is_impersonated, activeTenant, user, exitImpersonation } = useAuth();

  if (!is_impersonated) return null;

  const tenantName = activeTenant?.name || user?.tenantName || 'Hotel Tenant';

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-4 py-2 shadow-md border-b border-indigo-500/30 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0">
          <ShieldAlert className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
        </div>
        <div>
          <span className="font-bold text-amber-300">Tenant Impersonation Mode Active: </span>
          <span className="font-semibold text-white">Viewing as "{tenantName}"</span>
          <span className="hidden sm:inline text-purple-200/80 font-normal ml-2">
            — Actions perform real operations on live hotel client data.
          </span>
        </div>
      </div>

      <Button
        onClick={exitImpersonation}
        size="sm"
        className="h-7 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>Exit to SuperAdmin</span>
      </Button>
    </div>
  );
}
