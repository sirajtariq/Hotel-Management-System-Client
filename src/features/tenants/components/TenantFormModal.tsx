import React, { useState, useEffect } from 'react';
import { X, Building2, UserCheck, Shield, AlertCircle, DollarSign, Wand2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TenantItem, CreateTenantPayload, SubscriptionPlan, BillingType } from '@/types/tenants';

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTenantPayload | Partial<TenantItem>) => Promise<void>;
  initialData?: TenantItem | null;
  isSubmitting: boolean;
}

export function TenantFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: TenantFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('BASIC');
  const [billingType, setBillingType] = useState<BillingType>('MONTHLY');
  const [priceAmount, setPriceAmount] = useState<string>('50000');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Quota & Limit states (null = Unlimited)
  const [unlimitedProperties, setUnlimitedProperties] = useState<boolean>(false);
  const [maxProperties, setMaxProperties] = useState<string>('3');
  const [unlimitedRooms, setUnlimitedRooms] = useState<boolean>(false);
  const [maxRooms, setMaxRooms] = useState<string>('10');
  const [unlimitedUsers, setUnlimitedUsers] = useState<boolean>(false);
  const [maxUsers, setMaxUsers] = useState<string>('5');

  // Initial Admin User fields (only for new tenant onboarding)
  const [createAdmin, setCreateAdmin] = useState<boolean>(true);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let pass = '';
    pass += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    pass += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    pass += '0123456789'[Math.floor(Math.random() * 10)];
    pass += '!@#$%'[Math.floor(Math.random() * 5)];
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
    setAdminPassword(pass);
    setShowAdminPassword(true);
  };

  const handleCopyPassword = () => {
    if (!adminPassword) return;
    navigator.clipboard.writeText(adminPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setSubscriptionPlan(initialData.subscription_plan || 'BASIC');
      setBillingType(initialData.billing_type || 'MONTHLY');
      setPriceAmount(String(initialData.price_amount || '0'));
      setContactEmail(initialData.contact_email || '');
      setContactPhone(initialData.contact_phone || '');
      setNotes(initialData.notes || '');

      setUnlimitedProperties(initialData.max_properties === null);
      setMaxProperties(initialData.max_properties !== null && initialData.max_properties !== undefined ? String(initialData.max_properties) : '3');
      setUnlimitedRooms(initialData.max_rooms === null);
      setMaxRooms(initialData.max_rooms !== null && initialData.max_rooms !== undefined ? String(initialData.max_rooms) : '10');
      setUnlimitedUsers(initialData.max_users === null);
      setMaxUsers(initialData.max_users !== null && initialData.max_users !== undefined ? String(initialData.max_users) : '5');

      setCreateAdmin(false);
    } else {
      setName('');
      setSlug('');
      setSubscriptionPlan('BASIC');
      setBillingType('MONTHLY');
      setPriceAmount('50000');
      setContactEmail('');
      setContactPhone('');
      setNotes('');

      setUnlimitedProperties(false);
      setMaxProperties('3');
      setUnlimitedRooms(false);
      setMaxRooms('10');
      setUnlimitedUsers(false);
      setMaxUsers('5');

      setCreateAdmin(true);
      setAdminUsername('');
      setAdminEmail('');
      setAdminPassword('');
      setAdminFirstName('');
      setAdminLastName('');
      setShowAdminPassword(false);
      setCopiedPassword(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (!name.trim()) {
      setError('Hotel / Tenant name is required.');
      return;
    }

    if (!contactEmail.trim() || !validateEmail(contactEmail.trim())) {
      setError('Please provide a valid contact email address (e.g. contact@hotel.com).');
      return;
    }

    const numericPrice = parseFloat(priceAmount);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setError('Please enter a valid non-negative price amount.');
      return;
    }

    if (!initialData && createAdmin) {
      if (!adminUsername.trim()) {
        setError('Admin Username is required for initial admin user creation.');
        return;
      }
      if (!adminEmail.trim() || !validateEmail(adminEmail.trim())) {
        setError('Please provide a valid Admin Email address.');
        return;
      }
      if (!adminPassword || adminPassword.length < 6) {
        setError('Admin Password must be at least 6 characters long.');
        return;
      }
    }

    try {
      const payload: CreateTenantPayload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        subscription_plan: subscriptionPlan,
        billing_type: billingType,
        price_amount: numericPrice,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        notes: notes.trim(),
        is_active: initialData ? initialData.is_active : true,
        max_properties: unlimitedProperties ? null : (parseInt(maxProperties, 10) || 1),
        max_rooms: unlimitedRooms ? null : (parseInt(maxRooms, 10) || 1),
        max_users: unlimitedUsers ? null : (parseInt(maxUsers, 10) || 1),
      };

      if (!initialData && createAdmin) {
        payload.admin_username = adminUsername.trim();
        payload.admin_email = adminEmail.trim();
        payload.admin_password = adminPassword;
        payload.admin_first_name = adminFirstName.trim();
        payload.admin_last_name = adminLastName.trim();
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save tenant information.');
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {initialData ? 'Edit Tenant / Client Details' : 'Onboard New Hotel Client (Tenant)'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {initialData ? 'Update subscription, billing & contact details' : 'Configure hotel account, pricing & owner credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Section 1: Tenant Core Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hotel / Client Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Hotel / Organization Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pearl Continental Resort"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Slug (URL identifier)</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. pearl-continental (auto)"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Email *</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="manager@hotel.com"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Pricing & Billing */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Subscription & Billing Structure</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Plan Tier</label>
                <select
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value as SubscriptionPlan)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="BASIC">Basic</option>
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium Enterprise</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Billing Type *</label>
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value as BillingType)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="MONTHLY">Per Month (Monthly)</option>
                  <option value="ONE_TIME">One-Time License</option>
                  <option value="ANNUAL">Annual Subscription</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Price Amount (PKR) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    min="0"
                    step="500"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    className="pl-8 text-xs font-semibold text-slate-900"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Internal Notes / Deal Terms</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Onboarded with 3 properties included, monthly payment due on 1st."
                className="text-xs"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Plan Resource Limits & Quotas */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan Resource Limits & Quotas</h3>

            <div className="grid grid-cols-3 gap-3 items-stretch">
              {/* Max Properties */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between min-h-[20px]">
                  <span className="text-xs font-semibold text-slate-700 truncate" title="Max Properties">Properties</span>
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={unlimitedProperties}
                      onChange={(e) => setUnlimitedProperties(e.target.checked)}
                      className="rounded-xs border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span className="text-[11px] text-slate-500 font-medium">Unlimited</span>
                  </label>
                </div>
                <Input
                  type="number"
                  min="1"
                  disabled={unlimitedProperties}
                  value={unlimitedProperties ? '' : maxProperties}
                  onChange={(e) => setMaxProperties(e.target.value)}
                  placeholder={unlimitedProperties ? '∞ Unlimited' : '3'}
                  className="text-xs font-semibold bg-white h-9"
                />
              </div>

              {/* Max Rooms */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between min-h-[20px]">
                  <span className="text-xs font-semibold text-slate-700 truncate" title="Max Rooms">Rooms</span>
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={unlimitedRooms}
                      onChange={(e) => setUnlimitedRooms(e.target.checked)}
                      className="rounded-xs border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span className="text-[11px] text-slate-500 font-medium">Unlimited</span>
                  </label>
                </div>
                <Input
                  type="number"
                  min="1"
                  disabled={unlimitedRooms}
                  value={unlimitedRooms ? '' : maxRooms}
                  onChange={(e) => setMaxRooms(e.target.value)}
                  placeholder={unlimitedRooms ? '∞ Unlimited' : '10'}
                  className="text-xs font-semibold bg-white h-9"
                />
              </div>

              {/* Max Users */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between min-h-[20px]">
                  <span className="text-xs font-semibold text-slate-700 truncate" title="Max Users">User Accounts</span>
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={unlimitedUsers}
                      onChange={(e) => setUnlimitedUsers(e.target.checked)}
                      className="rounded-xs border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span className="text-[11px] text-slate-500 font-medium">Unlimited</span>
                  </label>
                </div>
                <Input
                  type="number"
                  min="1"
                  disabled={unlimitedUsers}
                  value={unlimitedUsers ? '' : maxUsers}
                  onChange={(e) => setMaxUsers(e.target.value)}
                  placeholder={unlimitedUsers ? '∞ Unlimited' : '5'}
                  className="text-xs font-semibold bg-white h-9"
                />
              </div>
            </div>
          </div>



          {/* Section 3: Initial Tenant Admin Creation (New Tenant Only) */}
          {!initialData && (
            <>
              <hr className="border-slate-100" />
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">Create Initial Hotel Admin Account</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createAdmin}
                      onChange={(e) => setCreateAdmin(e.target.checked)}
                      className="rounded-xs border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span className="text-xs text-slate-600 font-medium">Create Admin Credentials</span>
                  </label>
                </div>

                {createAdmin && (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Admin First Name</label>
                        <Input
                          value={adminFirstName}
                          onChange={(e) => setAdminFirstName(e.target.value)}
                          placeholder="e.g. Tariq"
                          className="text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Admin Last Name</label>
                        <Input
                          value={adminLastName}
                          onChange={(e) => setAdminLastName(e.target.value)}
                          placeholder="e.g. Mahmood"
                          className="text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Admin Username *</label>
                        <Input
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="e.g. pc_admin"
                          className="text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Admin Email *</label>
                        <Input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@hotel.com"
                          className="text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Initial Admin Password *</label>
                        <div className="flex items-center gap-2">
                          {adminPassword && (
                            <button
                              type="button"
                              onClick={handleCopyPassword}
                              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                            >
                              {copiedPassword ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedPassword ? 'Copied!' : 'Copy'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                          >
                            <Wand2 className="h-3 w-3" />
                            <span>Generate Password</span>
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <Input
                          type={showAdminPassword ? 'text' : 'password'}
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="•••••••• or click Generate Password"
                          className="text-xs bg-white pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs font-semibold">
              {isSubmitting
                ? 'Processing...'
                : initialData
                ? 'Update Tenant'
                : 'Onboard Hotel Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
