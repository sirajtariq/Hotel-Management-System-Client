import { Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TenantSwitcher() {
  const { user, activeTenant, switchTenant } = useAuth();

  const availableTenants = user?.availableTenants || [];

  if (!user || availableTenants.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-800 focus:outline-none select-none w-full justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-white font-semibold text-[10px]">
            {activeTenant?.name ? activeTenant.name.charAt(0) : 'H'}
          </div>
          <span className="font-semibold truncate">{activeTenant?.name || 'Select Tenant'}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTenants.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => switchTenant(t.id)}
            className="flex items-center justify-between py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
              <span className={t.id === activeTenant?.id ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                {t.name}
              </span>
            </div>
            {t.id === activeTenant?.id && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

