import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  TrendingUp,
  LogIn,
  CreditCard,
  AlertTriangle,
  Eye,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/Skeleton';
import { TablePagination } from '@/components/ui/TablePagination';
import { TenantItem, TenantMetrics, CreateTenantPayload, SubscriptionStatus } from '@/types/tenants';
import { tenantService } from '../services/tenantService';
import { TenantFormModal } from '../components/TenantFormModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { TenantDetailModal } from '../components/TenantDetailModal';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function TenantsPage() {
  const { impersonateTenant } = useAuth();
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [billingFilter, setBillingFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTenant, setEditingTenant] = useState<TenantItem | null>(null);
  const [paymentTenant, setPaymentTenant] = useState<TenantItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // On-demand detail modal
  const [detailTenantId, setDetailTenantId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tenantsRes, metricsData] = await Promise.all([
        tenantService.getTenants({ page: currentPage, page_size: pageSize, search: searchQuery }),
        tenantService.getMetrics(),
      ]);
      setTenants(tenantsRes.items);
      setTotalCount(tenantsRes.totalCount);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load tenants data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tenant: TenantItem) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleOpenPaymentModal = (tenant: TenantItem) => {
    setPaymentTenant(tenant);
    setIsPaymentModalOpen(true);
  };

  const handleFormSubmit = async (payload: CreateTenantPayload | Partial<TenantItem>) => {
    setIsSubmitting(true);
    try {
      if (editingTenant) {
        await tenantService.updateTenant(editingTenant.id, payload);
      } else {
        await tenantService.createTenant(payload as CreateTenantPayload);
      }
      await fetchData();
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (payload: { amount_paid: number; payment_method: string; months_to_extend: number }) => {
    if (!paymentTenant) return;
    setIsSubmitting(true);
    try {
      await tenantService.recordPayment(paymentTenant.id, payload);
      await fetchData();
      setIsPaymentModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImpersonate = async (tenant: TenantItem) => {
    const activeState = tenant.is_active ?? (tenant as any).isActive ?? true;
    if (!activeState) {
      alert('Cannot impersonate an inactive or suspended tenant account.');
      return;
    }
    setImpersonatingId(tenant.id);
    try {
      await impersonateTenant(tenant.id);
    } catch (err) {
      alert('Failed to launch tenant impersonation session.');
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleToggleStatus = async (tenant: TenantItem) => {
    const currentActive = tenant.is_active ?? (tenant as any).isActive ?? true;
    const nextStatus = !currentActive;
    try {
      await tenantService.updateTenant(tenant.id, { is_active: nextStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete/deactivate this tenant account? This action is restricted to SuperAdmin.')) {
      return;
    }
    setDeletingId(id);
    try {
      await tenantService.deleteTenant(id);
      await fetchData();
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered tenants list
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      (tenant.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.contact_email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = planFilter === 'ALL' || tenant.subscription_plan === planFilter;
    const matchesBilling = billingFilter === 'ALL' || tenant.billing_type === billingFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && tenant.is_active) ||
      (statusFilter === 'INACTIVE' && !tenant.is_active) ||
      (statusFilter === 'OVERDUE' && tenant.subscription_status === 'OVERDUE') ||
      (statusFilter === 'DUE_SOON' && tenant.subscription_status === 'DUE_SOON');

    return matchesSearch && matchesPlan && matchesBilling && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, planFilter, billingFilter, statusFilter, tenants.length]);

  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatPKR = (amount: number | string) => {
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

  const renderQuotaUsage = (current?: number, max?: number | null, label?: string) => {
    const curr = current ?? 0;
    const isUnlimited = max === null || max === undefined;
    const isMaxed = !isUnlimited && curr >= max;

    return (
      <div className="flex items-center gap-1 text-[11px] font-mono">
        <span className="text-slate-400 font-medium">{label}:</span>
        <span className={`font-bold ${isMaxed ? 'text-amber-600' : 'text-slate-700'}`}>
          {curr} / {isUnlimited ? '∞' : max}
        </span>
        {isMaxed && (
          <span className="px-1 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-300 ml-0.5">
            Maxed
          </span>
        )}
      </div>
    );
  };

  const renderStatusBadge = (status?: SubscriptionStatus) => {
    switch (status) {
      case 'OVERDUE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
            Overdue
          </span>
        );
      case 'GRACE_PERIOD':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
            Grace Period
          </span>
        );
      case 'DUE_SOON':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            Due Soon
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            Paid
          </span>
        );
    }
  };

  // Derive metrics safely from backend object or state fallback
  const totalTenantsVal = metrics?.totalTenants ?? metrics?.total_tenants ?? tenants.length;
  const activeTenantsVal = metrics?.activeTenants ?? metrics?.active_tenants ?? tenants.filter((t) => t.is_active).length;
  const mrrVal = metrics?.monthlyRecurringRevenue ?? metrics?.monthly_recurring_revenue ?? 0;
  const dueSoonVal = metrics?.dueSoonCount ?? metrics?.due_soon_count ?? 0;
  const overdueVal = metrics?.overdue_count ?? 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Tenants & Subscriptions</h1>
              <p className="text-xs text-slate-500 font-medium">
                SuperAdmin management for hotel client accounts, impersonation & recurring subscriptions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isLoading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button onClick={handleOpenCreateModal} className="text-xs font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Onboard New Tenant</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tenants */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Onboarded Tenants</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalTenantsVal}</span>
            <span className="text-xs text-slate-500 font-medium">
              ({activeTenantsVal} active)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Total Registered Clients</p>
        </div>

        {/* Card 2: Operating Hotel Accounts */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operating Hotel Accounts</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeTenantsVal}</span>
            <span className="text-xs text-emerald-600 font-medium">
              {totalTenantsVal ? Math.round((activeTenantsVal / totalTenantsVal) * 100) : 100}% Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Active Operating Accounts</p>
        </div>

        {/* Card 3: Recurring Monthly Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recurring Monthly Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {formatPKR(mrrVal)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Monthly Recurring Income (MRR)</p>
        </div>

        {/* Card 4: Requires Renewal Attention */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requires Renewal Attention</span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{dueSoonVal}</span>
            <span className="text-xs text-amber-600 font-medium">
              ({overdueVal} Overdue)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Subscription Renewal Queue</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hotel name, slug, email..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Filter by Plan */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Plans</option>
              <option value="BASIC">Basic</option>
              <option value="STANDARD">Standard</option>
              <option value="PREMIUM">Premium</option>
            </select>

            {/* Filter by Billing Mode */}
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Billing Modes</option>
              <option value="MONTHLY">Per Month (Monthly)</option>
              <option value="ONE_TIME">One-Time License</option>
              <option value="ANNUAL">Annual Subscription</option>
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DUE_SOON">Due Soon</option>
              <option value="OVERDUE">Overdue Only</option>
              <option value="INACTIVE">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Hotel / Tenant Name</th>
                <th className="py-3 px-4">Plan & Mode</th>
                <th className="py-3 px-4">Fee Amount</th>
                <th className="py-3 px-4">Plan Quotas</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Sub Status</th>
                <th className="py-3 px-4 text-center">Account</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx}>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 px-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                    <td className="py-3 px-4 text-right"><Skeleton className="h-7 w-24 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No tenants found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant) => {
                  const activeState = tenant.is_active ?? (tenant as any).isActive;
                  const planName = tenant.subscription_plan ?? (tenant as any).subscriptionPlan ?? 'STANDARD';
                  const billingCycle = tenant.billing_type ?? (tenant as any).billingType ?? 'MONTHLY';
                  const priceVal = tenant.price_amount ?? (tenant as any).priceAmount ?? 0;
                  const dueDate = tenant.next_due_date ?? (tenant as any).nextDueDate;

                  const currentProps = tenant.current_properties_count ?? (tenant as any).currentPropertiesCount ?? 0;
                  const maxProps = tenant.max_properties ?? (tenant as any).maxProperties;

                  const currentRooms = tenant.current_rooms_count ?? (tenant as any).currentRoomsCount ?? 0;
                  const maxRooms = tenant.max_rooms ?? (tenant as any).maxRooms;

                  const currentUsers = tenant.current_users_count ?? (tenant as any).currentUsersCount ?? tenant.users_count ?? 0;
                  const maxUsers = tenant.max_users ?? (tenant as any).maxUsers;

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Hotel Name & Slug */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setDetailTenantId(tenant.id)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 text-left cursor-pointer transition-colors"
                        >
                          {tenant.name}
                        </button>
                        <div className="text-[11px] text-slate-400 font-mono">slug: {tenant.slug}</div>
                      </td>

                      {/* Plan & Billing Mode */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200"
                          >
                            {planName}
                          </span>

                          <span className="text-[11px] text-slate-600 font-medium">
                            {billingCycle === 'ANNUAL' ? 'Per Year' : 'Per Month'}
                          </span>
                        </div>
                      </td>

                      {/* Fee Amount */}
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        PKR {Number(priceVal).toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          {billingCycle === 'MONTHLY'
                            ? '/mo'
                            : billingCycle === 'ANNUAL'
                            ? '/yr'
                            : ' (one-time)'}
                        </span>
                      </td>

                      {/* Plan Quotas */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {renderQuotaUsage(currentProps, maxProps, 'Props')}
                          {renderQuotaUsage(currentRooms, maxRooms, 'Rooms')}
                          {renderQuotaUsage(currentUsers, maxUsers, 'Users')}
                        </div>
                      </td>

                      {/* Next Due Date */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(dueDate)}</span>
                        </div>
                      </td>

                      {/* Sub Status */}
                      <td className="py-3 px-4">
                        {renderStatusBadge(tenant.subscription_status)}
                      </td>

                      {/* Active Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(tenant)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            activeState
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title="Click to toggle tenant status"
                        >
                          {activeState ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailTenantId(tenant.id)}
                            className="h-8 px-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1"
                            title="View Tenant Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            <span className="hidden xl:inline">View Details</span>
                          </Button>

                          {/* Impersonate Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImpersonate(tenant)}
                            disabled={impersonatingId === tenant.id || !activeState}
                            className="h-8 px-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 flex items-center gap-1"
                            title="Login as Tenant Admin"
                          >
                            <LogIn className="h-3.5 w-3.5 text-purple-600" />
                            <span className="hidden lg:inline">Login as Tenant</span>
                          </Button>

                          {/* Record Payment Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPaymentModal(tenant)}
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                            title="Record Payment & Extend Subscription"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                          </Button>

                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(tenant)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            title="Edit Tenant"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTenant(tenant.id)}
                            disabled={deletingId === tenant.id}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Tenant"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={filteredTenants.length}
        />
      </div>

      {/* Onboarding & Edit Modal */}
      <TenantFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTenant}
        isSubmitting={isSubmitting}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        tenant={paymentTenant}
        isSubmitting={isSubmitting}
      />

      {/* On-demand Tenant Details Drawer/Modal */}
      <TenantDetailModal
        isOpen={!!detailTenantId}
        onClose={() => setDetailTenantId(null)}
        tenantId={detailTenantId}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
