import React, { useState, useEffect } from 'react';
import { X, Users, UserCheck, ShieldAlert, KeyRound, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaffMember, CreateStaffInput } from '@/types/staff';
import { Property } from '@/types/properties';
import { RoleItem } from '@/types/roles';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: StaffMember | null;
  properties?: Property[];
  roles?: RoleItem[];
  quotaUsage?: { current: number; max: number | null };
}

const POSITION_SUGGESTIONS = [
  'Front Desk Receptionist',
  'Property Manager',
  'Housekeeper / Cleaner',
  'Security Guard',
  'Cook / Chef',
  'Maintenance Technician',
  'Accountant / Cashier',
  'Waiter / Attendant',
];

export function StaffFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  properties = [],
  roles = [],
  quotaUsage,
}: StaffFormModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [propertyId, setPropertyId] = useState<string>('');
  const [monthlySalary, setMonthlySalary] = useState<number>(50000);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Portal Login Toggle & Inputs
  const [enableLogin, setEnableLogin] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customRoleId, setCustomRoleId] = useState<string>('');

  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone_number || '');
      setPosition(initialData.position || '');
      setPropertyId(initialData.property ? String(initialData.property) : '');
      setMonthlySalary(Number(initialData.monthly_salary) || 0);
      setIsActive(initialData.is_active !== false);

      setEnableLogin(initialData.has_login_access || false);
      setUsername(initialData.username || '');
      setEmail(initialData.email || '');
      setPassword('');
      setCustomRoleId(initialData.custom_role ? String(initialData.custom_role.id) : '');
    } else {
      setName('');
      setPhone('');
      setPosition('Front Desk Receptionist');
      setPropertyId(properties.length > 0 ? String(properties[0].id) : '');
      setMonthlySalary(60000);
      setIsActive(true);

      setEnableLogin(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setCustomRoleId(roles.length > 0 ? String(roles[0].id) : '');
    }
    setErrorMsg(null);
  }, [initialData, isOpen, properties, roles]);

  if (!isOpen) return null;

  const isMaxQuotaReached =
    quotaUsage?.max !== null &&
    quotaUsage?.max !== undefined &&
    quotaUsage.current >= quotaUsage.max;

  const showQuotaWarning = enableLogin && !initialData?.has_login_access && isMaxQuotaReached;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCopyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Employee Full Name is required.');
      return;
    }
    if (!position.trim()) {
      setErrorMsg('Job Position is required.');
      return;
    }

    if (enableLogin) {
      if (!username.trim()) {
        setErrorMsg('Username is required when portal login access is enabled.');
        return;
      }
      if (!initialData?.has_login_access && (!password || password.length < 6)) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone_number: phone.trim(),
        position: position.trim(),
        property: propertyId ? propertyId : null,
        monthly_salary: Number(monthlySalary) || 0,
        is_active: isActive,
        enable_login: enableLogin,
      };

      if (enableLogin) {
        payload.login_username = username.trim();
        payload.login_email = email.trim();
        if (password) payload.password = password;
        if (customRoleId) payload.custom_role_id = customRoleId;
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save staff record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {initialData ? 'Edit Employee & Access Profile' : 'Register New Employee / Staff Member'}
              </h2>
              <p className="text-xs text-slate-500">
                Unified registry for Ground Staff & Desk Staff with Dynamic RBAC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                1. Employee General Details
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Basic Directory Info</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kamran Akmal"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Monthly Salary (PKR) *</label>
                <Input
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  placeholder="60000"
                  className="text-xs font-mono font-semibold"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Job Title / Position *</label>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Front Desk Receptionist"
                  className="text-xs"
                  list="position-suggestions"
                  required
                />
                <datalist id="position-suggestions">
                  {POSITION_SUGGESTIONS.map((pos) => (
                    <option key={pos} value={pos} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Assigned Property</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Properties (Central Staff)</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Portal Login Access Toggle */}
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Enable Portal Login Access</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {enableLogin
                        ? 'Desk Staff Mode — Consumes 1 login user account slot.'
                        : 'Ground Staff Mode — Unlimited staff allowed (No user quota consumed).'}
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableLogin}
                    onChange={(e) => setEnableLogin(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Quota warning alert if limit reached */}
              {showQuotaWarning && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2 text-xs text-amber-900">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">User Quota Limit Reached!</strong>
                    <div>
                      Your current plan limit is <strong>{quotaUsage?.current} / {quotaUsage?.max} Users</strong>. Upgrade your subscription plan or register this employee as Ground Staff (Login OFF).
                    </div>
                  </div>
                </div>
              )}

              {/* Inputs when Login is ON */}
              {enableLogin && (
                <div className="pt-2 border-t border-indigo-100/80 space-y-3.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Username *</label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. bilal_reception"
                        className="text-xs"
                        required={enableLogin}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Email Address</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="bilal@pcss.com"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Password {initialData?.has_login_access ? '(Optional to change)' : '*'}
                        </label>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" /> Auto-Generate
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          type="text"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={initialData?.has_login_access ? 'Leave blank to keep existing' : 'Min 6 characters'}
                          className="text-xs pr-8 font-mono"
                          required={enableLogin && !initialData?.has_login_access}
                        />
                        {password && (
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
                            title="Copy Password"
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Assigned RBAC Role *</label>
                      <select
                        value={customRoleId}
                        onChange={(e) => setCustomRoleId(e.target.value)}
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Default Staff Access</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({(r as any).permissions_count || r.permissions?.length || 0} Perms)
                          </option>
                        ))}

                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Employee...' : initialData ? 'Save Access Changes' : 'Register Staff Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
