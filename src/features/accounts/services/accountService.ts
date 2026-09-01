import { apiClient } from '@/lib/axios';
import {
  PaymentAccount,
  AccountTransaction,
  AccountTransfer,
  CreateAccountInput,
  CreateTransferInput,
} from '@/types/accounts';

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const accountService = {
  async getPaymentAccounts(accountType?: string): Promise<PaymentAccount[]> {
    try {
      const url = accountType ? `/payment-accounts/?account_type=${accountType}` : '/payment-accounts/';
      const response = await apiClient.get(url);
      const raw = extractArray<any>(response.data, []);
      return raw.map((item) => {
        const isAct = typeof item.is_active === 'boolean' ? item.is_active : typeof item.isActive === 'boolean' ? item.isActive : true;
        const isDef = typeof item.is_default === 'boolean' ? item.is_default : typeof item.isDefault === 'boolean' ? item.isDefault : false;
        return {
          ...item,
          is_active: isAct,
          isActive: isAct,
          is_default: isDef,
          isDefault: isDef,
          opening_balance: parseFloat(item.opening_balance || item.openingBalance || 0),
          current_balance: parseFloat(item.current_balance || item.currentBalance || 0),
        };
      });
    } catch {
      return [];
    }
  },

  async createPaymentAccount(input: CreateAccountInput): Promise<PaymentAccount> {
    try {
      const response = await apiClient.post('/payment-accounts/', input);
      const isAct = typeof response.data.is_active === 'boolean' ? response.data.is_active : true;
      const isDef = typeof response.data.is_default === 'boolean' ? response.data.is_default : false;
      return {
        ...response.data,
        is_active: isAct,
        isActive: isAct,
        is_default: isDef,
        isDefault: isDef,
        opening_balance: parseFloat(response.data.opening_balance || response.data.openingBalance || 0),
        current_balance: parseFloat(response.data.current_balance || response.data.currentBalance || 0),
      };
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async updatePaymentAccount(id: number, input: Partial<CreateAccountInput>): Promise<PaymentAccount> {
    try {
      const response = await apiClient.patch(`/payment-accounts/${id}/`, input);
      const isAct = typeof response.data.is_active === 'boolean' ? response.data.is_active : true;
      const isDef = typeof response.data.is_default === 'boolean' ? response.data.is_default : false;
      return {
        ...response.data,
        is_active: isAct,
        isActive: isAct,
        is_default: isDef,
        isDefault: isDef,
        opening_balance: parseFloat(response.data.opening_balance || response.data.openingBalance || 0),
        current_balance: parseFloat(response.data.current_balance || response.data.currentBalance || 0),
      };
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async setDefaultAccount(id: number): Promise<PaymentAccount> {
    try {
      const response = await apiClient.post(`/payment-accounts/${id}/set-default/`);
      return response.data;
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async deletePaymentAccount(id: number): Promise<void> {
    try {
      await apiClient.delete(`/payment-accounts/${id}/`);
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async toggleAccountActive(id: number, currentStatus: boolean): Promise<PaymentAccount> {
    const targetStatus = !currentStatus;
    try {
      const response = await apiClient.patch(`/payment-accounts/${id}/`, { is_active: targetStatus });
      const resData = response.data;
      const finalStatus = typeof resData.is_active === 'boolean' ? resData.is_active : targetStatus;
      return {
        ...resData,
        is_active: finalStatus,
        isActive: finalStatus,
        opening_balance: parseFloat(resData.opening_balance || resData.openingBalance || 0),
        current_balance: parseFloat(resData.current_balance || resData.currentBalance || 0),
      };
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async getAccountTransactions(accountId: number): Promise<AccountTransaction[]> {
    try {
      const response = await apiClient.get(`/payment-accounts/${accountId}/transactions/`);
      return extractArray<AccountTransaction>(response.data, []);
    } catch {
      return [];
    }
  },

  async getTransfers(): Promise<AccountTransfer[]> {
    try {
      const response = await apiClient.get('/account-transfers/');
      return extractArray<AccountTransfer>(response.data, []);
    } catch {
      return [];
    }
  },

  async executeTransfer(input: CreateTransferInput): Promise<AccountTransfer> {
    try {
      const response = await apiClient.post('/account-transfers/', input);
      return response.data;
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },
};
