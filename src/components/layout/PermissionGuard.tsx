import React, { useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/ToastProvider';

interface PermissionGuardProps {
  permission: string | string[];
  moduleName: string;
  children: React.ReactNode;
}

export function PermissionGuard({ permission, moduleName, children }: PermissionGuardProps) {
  const hasPermission = usePermission(permission);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission) {
      toast.error('Permission Denied', `Access restricted for '${moduleName}' module. Contact your Tenant Administrator to grant role access.`);
    }
  }, [hasPermission, moduleName]);

  if (!hasPermission) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-slate-200 shadow-xs my-6">
        <div className="h-16 w-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
          You do not have permission to view or manage the <strong>{moduleName}</strong> module. Please contact your Organization Administrator to request role access permissions.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-xs border-slate-300 text-slate-700 hover:text-slate-900"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
