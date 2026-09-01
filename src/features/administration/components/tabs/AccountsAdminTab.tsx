import React, { useState, useEffect } from 'react';
import { PaymentAccount, CreateAccountInput, CreateTransferInput } from '@/types/accounts';
import { accountService } from '@/features/accounts/services/accountService';
import { AccountCard } from '@/features/accounts/components/AccountCard';
import { AddEditAccountModal } from '@/features/accounts/components/AddEditAccountModal';
import { TransferFundsModal } from '@/features/accounts/components/TransferFundsModal';
import { AccountLedgerModal } from '@/features/accounts/components/AccountLedgerModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatPKR } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/ToastProvider';
import { useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Wallet,
  Landmark,
  Plus,
  ArrowRightLeft,
  Banknote,
  TrendingUp,
} from 'lucide-react';

export function AccountsAdminTab() {
  const queryClient = useQueryClient();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<PaymentAccount | null>(null);
  const [togglingAccountId, setTogglingAccountId] = useState<number | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerAccount, setLedgerAccount] = useState<PaymentAccount | null>(null);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await accountService.getPaymentAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load Payment Accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSaveAccount = async (input: CreateAccountInput) => {
    try {
      if (editingAccount) {
        const updated = await accountService.updatePaymentAccount(editingAccount.id, input);
        setAccounts((prev) => prev.map((a) => (a.id === editingAccount.id ? updated : a)));
        toast.success('Account Updated', `Updated "${updated.name}" details`);
      } else {
        const created = await accountService.createPaymentAccount(input);
        setAccounts((prev) => [created, ...prev]);
        toast.success('Account Created', `Added "${created.name}" to payment accounts`);
      }
      queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      fetchAccounts();
    } catch (err: any) {
      toast.error('Save Failed', err.message || 'Could not save payment account.');
    }
  };

  const handleSetDefault = async (id: number, name: string) => {
    try {
      await accountService.setDefaultAccount(id);
      setAccounts((prev) =>
        prev.map((a) => ({
          ...a,
          is_default: a.id === id,
        }))
      );
      queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      toast.success('Default Account Updated', `"${name}" is now the default payment account.`);
    } catch {
      toast.error('Update Failed', 'Could not set default account.');
    }
  };

  const handleToggleActive = async (account: PaymentAccount) => {
    if (togglingAccountId === account.id) return;
    setTogglingAccountId(account.id);
    const currentStatus = typeof account.is_active === 'boolean' ? account.is_active : typeof account.isActive === 'boolean' ? account.isActive : true;
    try {
      const updated = await accountService.toggleAccountActive(account.id, currentStatus);
      setAccounts((prev) => prev.map((a) => (a.id === account.id ? updated : a)));
      queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      toast.success(
        !currentStatus ? 'Account Activated' : 'Account Inactivated',
        `"${account.name}" status changed to ${!currentStatus ? 'Active' : 'Inactive'}.`
      );
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not toggle account status.');
    } finally {
      setTogglingAccountId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return;
    try {
      await accountService.deletePaymentAccount(deletingAccount.id);
      toast.success('Account Deleted', `Deleted "${deletingAccount.name}".`);
      queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      setDeletingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      toast.error('Delete Failed', err.message || 'Could not delete payment account.');
    }
  };

  const handleExecuteTransfer = async (input: CreateTransferInput) => {
    try {
      await accountService.executeTransfer(input);
      toast.success('Transfer Executed', 'Internal fund transfer completed successfully.');
      queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      fetchAccounts();
    } catch (err: any) {
      toast.error('Transfer Failed', err.message || 'Could not complete transfer.');
    }
  };

  // Helper for normalization
  const isAccountActive = (a: PaymentAccount) => a.isActive ?? a.is_active ?? true;
  const getAccountType = (a: PaymentAccount) => (a.accountType ?? a.account_type ?? 'CASH').toUpperCase();
  const getAccountBalance = (a: PaymentAccount) => parseFloat(String(a.currentBalance ?? a.current_balance ?? 0));

  // Metrics calculations
  const activeAccountsCount = accounts.filter(isAccountActive).length;

  const totalLiquidity = accounts
    .filter(isAccountActive)
    .reduce((acc, item) => acc + getAccountBalance(item), 0);

  const cashTotal = accounts
    .filter((a) => isAccountActive(a) && getAccountType(a) === 'CASH')
    .reduce((acc, item) => acc + getAccountBalance(item), 0);

  const bankTotal = accounts
    .filter((a) => isAccountActive(a) && getAccountType(a) === 'BANK')
    .reduce((acc, item) => acc + getAccountBalance(item), 0);

  const walletTotal = accounts
    .filter((a) => isAccountActive(a) && getAccountType(a) === 'WALLET')
    .reduce((acc, item) => acc + getAccountBalance(item), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Actions Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Payment & Bank Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Manage cash drawers, bank accounts, POS machines, and execute internal fund transfers
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsTransferModalOpen(true)}
            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs px-4 py-2.5 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
            <span>Transfer Funds</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingAccount(null);
              setIsAddEditModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs px-4 py-2.5 shadow-2xs flex items-center gap-2 transition-all hover:shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Payment Account</span>
          </button>
        </div>
      </div>

      {/* Harmonized Metric Summary Cards (Top Bar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Liquidity
            </span>
            <div className="text-xl font-bold text-slate-900 tracking-tight font-mono mt-1">
              {formatPKR(totalLiquidity)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Across {activeAccountsCount} active {activeAccountsCount === 1 ? 'account' : 'accounts'}
            </span>
          </div>
          <div className="bg-indigo-50 text-indigo-600 border border-indigo-100 p-2.5 rounded-xl shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Cash in Drawers */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Cash in Drawers
            </span>
            <div className="text-xl font-bold text-slate-900 tracking-tight font-mono mt-1">
              {formatPKR(cashTotal)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Physical counter cash
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-2.5 rounded-xl shrink-0">
            <Banknote className="h-5 w-5" />
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Bank Accounts
            </span>
            <div className="text-xl font-bold text-slate-900 tracking-tight font-mono mt-1">
              {formatPKR(bankTotal)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Deposited bank balances
            </span>
          </div>
          <div className="bg-blue-50 text-blue-600 border border-blue-100 p-2.5 rounded-xl shrink-0">
            <Landmark className="h-5 w-5" />
          </div>
        </div>

        {/* POS / Wallets */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              POS / Wallets
            </span>
            <div className="text-xl font-bold text-slate-900 tracking-tight font-mono mt-1">
              {formatPKR(walletTotal)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              POS Card Terminal funds
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 border border-amber-100 p-2.5 rounded-xl shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Payment Account Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">No Payment Accounts Created</p>
          <p className="text-xs text-slate-400">
            Click "+ Add Payment Account" to register cash drawers or bank accounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              isToggling={togglingAccountId === acc.id}
              onViewLedger={(a) => {
                setLedgerAccount(a);
                setIsLedgerModalOpen(true);
              }}
              onEdit={(a) => {
                setEditingAccount(a);
                setIsAddEditModalOpen(true);
              }}
              onSetDefault={handleSetDefault}
              onToggleActive={handleToggleActive}
              onDelete={(a) => setDeletingAccount(a)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Account Modal */}
      <AddEditAccountModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
      />

      {/* Internal Transfer Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onExecuteTransfer={handleExecuteTransfer}
      />

      {/* Ledger Modal */}
      <AccountLedgerModal
        account={ledgerAccount}
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment Account"
        description={`Are you sure you want to delete "${deletingAccount?.name}"? This action cannot be undone.`}
        confirmText="Delete Account"
        variant="danger"
      />
    </div>
  );
}

