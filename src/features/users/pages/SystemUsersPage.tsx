import React, { useState, useEffect } from 'react';
import { TablePagination } from '@/components/ui/TablePagination';
import { Users, Search, KeyRound, Eye, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/axios';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { UserDetailsDrawer } from '../components/UserDetailsDrawer';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface SystemUserItem {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  fullName?: string;
  role: string;
  tenant_name?: string;
  tenantName?: string;
  tenant_details?: { name: string; slug?: string };
  tenantDetails?: { name: string; slug?: string };
  phone_number?: string;
  phoneNumber?: string;
  is_active?: boolean;
  isActive?: boolean;
  date_joined?: string;
  dateJoined?: string;
}

export function SystemUsersPage() {
  const [users, setUsers] = useState<SystemUserItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resetTargetUser, setResetTargetUser] = useState<SystemUserItem | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users/', {
        params: { page: currentPage, page_size: pageSize, search: searchQuery },
      });
      if (response.data && Array.isArray(response.data.results)) {
        setUsers(response.data.results);
        setTotalCount(response.data.count ?? response.data.results.length);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalCount(response.data.length);
      }
    } catch {
      setUsers([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchQuery]);

  const handleToggleActive = async (user: SystemUserItem) => {
    try {
      await apiClient.post(`/users/${user.id}/toggle-active/`);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to toggle user active status:', err);
    }
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-xs">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">System Users Management</h1>
            <p className="text-xs text-slate-500 font-medium">
              Global user directory across platform SuperAdmins, Tenant Admins, Managers & Staff
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={isLoading}
          className="text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, email, tenant..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Associated Tenant</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Date Joined</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx}>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4 text-center"><Skeleton className="h-4 w-16 mx-auto rounded-full" /></td>
                    <td className="py-3 px-4 text-right"><Skeleton className="h-7 w-20 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No system users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const displayName = u.fullName || u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;
                  const activeState = u.isActive ?? u.is_active ?? true;
                  const tenantNameVal = u.tenantName || u.tenant_name || u.tenant_details?.name || u.tenantDetails?.name;
                  const isGlobalPlatform = !tenantNameVal || tenantNameVal === 'Global Platform' || u.role === 'SUPERADMIN';
                  const phoneVal = u.phoneNumber || u.phone_number || '—';
                  const joinedVal = u.dateJoined || u.date_joined;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            firstName={u.first_name}
                            lastName={u.last_name}
                            email={u.email}
                            role={u.role}
                            size="sm"
                          />
                          <div>
                            <button
                              onClick={() => setDetailUserId(u.id)}
                              className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer text-left transition-colors"
                            >
                              {displayName}
                            </button>
                            <div className="text-[11px] text-slate-500">
                              {u.email} <span className="text-slate-400 font-mono">(@{u.username})</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            u.role === 'SUPERADMIN'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'TENANT_ADMIN'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Associated Tenant */}
                      <td className="py-3 px-4">
                        {isGlobalPlatform ? (
                          <span className="text-xs text-slate-400 italic font-medium">Global Platform</span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-800">{tenantNameVal}</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {phoneVal}
                      </td>

                      {/* Date Joined */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {formatDate(joinedVal)}
                      </td>

                      {/* Status Badge & Quick Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            activeState
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title="Click to toggle user active status"
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
                          {/* View Details Action */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailUserId(u.id)}
                            className="text-[11px] h-7 gap-1 px-2 text-slate-700 hover:text-slate-900"
                            title="View User Details"
                          >
                            <Eye className="h-3 w-3 text-slate-500" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>

                          {/* Reset Password Action */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResetTargetUser(u)}
                            className="text-[11px] h-7 gap-1 px-2 text-slate-700 hover:text-slate-900"
                            title="Reset User Password"
                          >
                            <KeyRound className="h-3 w-3 text-slate-500" />
                            <span>Reset Pass</span>
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
          totalItems={totalCount}
        />
      </div>

      {/* Admin Password Reset Modal */}
      <ResetPasswordModal
        isOpen={!!resetTargetUser}
        onClose={() => setResetTargetUser(null)}
        targetUser={resetTargetUser}
      />

      {/* User Details & Security Drawer */}
      <UserDetailsDrawer
        isOpen={!!detailUserId}
        onClose={() => setDetailUserId(null)}
        userId={detailUserId}
        onOpenResetPassword={() => {
          const u = users.find((item) => item.id === detailUserId);
          if (u) setResetTargetUser(u);
        }}
        onToggleActive={fetchUsers}
      />
    </div>
  );
}
