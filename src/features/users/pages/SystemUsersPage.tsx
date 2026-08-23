import React, { useState, useEffect } from 'react';
import { TablePagination } from '@/components/ui/TablePagination';
import { Users, Search, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/axios';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface SystemUserItem {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_details?: { name: string };
  phone_number?: string;
  is_active: boolean;
  date_joined: string;
}

const MOCK_SYSTEM_USERS: SystemUserItem[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@apexhotels.com',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'SUPERADMIN',
    tenant_details: { name: 'Global Platform' },
    phone_number: '+92 300 0000000',
    is_active: true,
    date_joined: '2026-01-01',
  },
  {
    id: '2',
    username: 'pc_admin',
    email: 'management@pcss.com',
    first_name: 'Tariq',
    last_name: 'Manager',
    role: 'TENANT_ADMIN',
    tenant_details: { name: 'Pearl Continental & Serviced Suites' },
    phone_number: '+92 300 1234567',
    is_active: true,
    date_joined: '2026-01-15',
  },
  {
    id: '3',
    username: 'gh_admin',
    email: 'info@grandhorizon.pk',
    first_name: 'Zubair',
    last_name: 'Khan',
    role: 'TENANT_ADMIN',
    tenant_details: { name: 'Grand Horizon Apartments' },
    phone_number: '+92 321 9876543',
    is_active: true,
    date_joined: '2026-02-01',
  },
];

export function SystemUsersPage() {
  const [users, setUsers] = useState<SystemUserItem[]>(MOCK_SYSTEM_USERS);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resetTargetUser, setResetTargetUser] = useState<SystemUserItem | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
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
        setUsers(MOCK_SYSTEM_USERS);
        setTotalCount(MOCK_SYSTEM_USERS.length);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, pageSize, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-sm">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">System Users Management</h1>
            <p className="text-xs text-slate-500 font-medium">
              Global user directory across platform SuperAdmins, Tenant Admins, Managers & Staff
            </p>
          </div>
        </div>
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
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
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
                          <div className="font-semibold text-slate-900">
                            {u.first_name} {u.last_name} ({u.username})
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5 items-start">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            u.role === 'SUPERADMIN'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : u.role === 'TENANT_ADMIN'
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                        {(u as any).custom_role_details?.name && (
                          <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                            {(u as any).custom_role_details.name}
                          </span>
                        )}
                      </div>
                    </td>


                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {u.tenant_details?.name || 'Global Platform'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {u.phone_number || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {u.date_joined ? u.date_joined.split('T')[0] : 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResetTargetUser(u)}
                        className="text-[11px] h-7 gap-1 px-2 text-slate-700 hover:text-slate-900"
                      >
                        <KeyRound className="h-3 w-3 text-slate-500" />
                        <span>Reset Pass</span>
                      </Button>
                    </td>
                  </tr>
                ))
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

      <ResetPasswordModal
        isOpen={!!resetTargetUser}
        onClose={() => setResetTargetUser(null)}
        targetUser={resetTargetUser}
      />
    </div>
  );
}

