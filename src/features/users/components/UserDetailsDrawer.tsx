import React, { useEffect, useState } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Clock,
  Building2,
  KeyRound,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { apiClient } from '@/lib/axios';

interface UserDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onOpenResetPassword?: () => void;
  onToggleActive?: () => void;
}

export function UserDetailsDrawer({
  isOpen,
  onClose,
  userId,
  onOpenResetPassword,
  onToggleActive,
}: UserDetailsDrawerProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchDetail = async () => {
        setIsLoading(true);
        try {
          const res = await apiClient.get(`/users/${userId}/`);
          setUser(res.data);
        } catch (err) {
          console.error('Failed to fetch user details:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    } else {
      setUser(null);
    }
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const res = await apiClient.post(`/users/${userId}/toggle-active/`);
      setUser((prev: any) => (prev ? { ...prev, is_active: res.data.isActive ?? res.data.is_active } : prev));
      if (onToggleActive) onToggleActive();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const fullName = user?.full_name || user?.fullName || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User Details';
  const roleName = user?.role || 'STAFF';
  const isActive = user?.is_active ?? user?.isActive ?? true;
  const tenantName = user?.tenant_details?.name || user?.tenantDetails?.name || user?.tenant_name || user?.tenantName || 'Global Platform';
  const tenantSlug = user?.tenant_details?.slug || user?.tenantDetails?.slug || 'platform';
  const assignedProps = user?.assigned_properties_details || user?.assignedPropertiesDetails || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar
              firstName={user?.first_name}
              lastName={user?.last_name}
              email={user?.email}
              role={roleName}
              size="md"
            />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 truncate">{fullName}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    roleName === 'SUPERADMIN'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : roleName === 'TENANT_ADMIN'
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {roleName}
                </span>
                <span className="text-xs text-slate-400 font-mono">@{user?.username}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Fetching detailed user profile...</span>
            </div>
          ) : user ? (
            <>
              {/* Active Toggle Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>{isActive ? 'Active Account' : 'Disabled Account'}</span>
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggle}
                  disabled={isToggling}
                  className="text-xs h-8"
                >
                  {isToggling ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                  )}
                </Button>
              </div>

              {/* Profile & Contact */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Profile & Contact Details</span>
                </h3>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>Email Address:</span>
                    </span>
                    <span className="font-semibold text-slate-900">{user.email || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>Phone Number:</span>
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">{user.phone_number || user.phoneNumber || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Date Joined:</span>
                    </span>
                    <span className="font-medium text-slate-700">{formatDate(user.date_joined || user.dateJoined)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Last Login:</span>
                    </span>
                    <span className="font-medium text-slate-700">{formatDate(user.last_login || user.lastLogin)}</span>
                  </div>
                </div>
              </div>

              {/* Associated Tenant */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Tenant Association</span>
                </h3>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">{tenantName}</div>
                  {tenantSlug !== 'platform' && (
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">slug: {tenantSlug}</div>
                  )}
                </div>
              </div>

              {/* Assigned Properties */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Assigned Hotel Properties ({assignedProps.length})</span>
                </h3>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  {assignedProps.length === 0 ? (
                    <div className="text-slate-400 italic">No explicit property assignments (Access based on Role).</div>
                  ) : (
                    assignedProps.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-slate-400 text-[11px]">{p.city || ''}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              Unable to load user record.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {onOpenResetPassword ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onOpenResetPassword();
              }}
              className="text-xs gap-1.5 text-slate-700"
            >
              <KeyRound className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset Password</span>
            </Button>
          ) : <div />}

          <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
