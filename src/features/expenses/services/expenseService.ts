import { apiClient } from '@/lib/axios';
import { triggerFileDownload } from '@/lib/export';
import { Expense, AccountHead, CreateExpenseInput, CreateAccountHeadInput, PaymentMethod } from '@/types/expenses';

function normalizeExpense(e: any): Expense {
  const amt = parseFloat(e.amount || '0');
  const headName = e.account_head_details?.name || e.category_details?.name || e.item_name || 'General Expense';
  const payMethod: PaymentMethod = e.payment_method || 'CASH';

  return {
    id: String(e.id),
    propertyId: String(e.property || e.propertyId || ''),
    propertyName: e.property_name || e.propertyName || 'Hotel Property',
    accountHeadId: e.account_head || e.account_head_details?.id,
    accountHeadName: headName,
    title: e.item_name || headName,
    category: headName,
    amount: isNaN(amt) ? 0 : amt,
    date: e.expense_date || e.date || new Date().toISOString().split('T')[0],
    paidTo: e.vendor_name || e.vendor || e.paidTo || 'N/A',
    paymentMethod: payMethod,
    receiptNumber: e.receipt_number || e.receiptNumber || (e.id ? `EXP-${String(e.id).padStart(3, '0')}` : undefined),
    receiptImage: e.receipt_image || e.receiptImage,
    notes: e.description || e.notes || '',
    createdBy: e.created_by_name || e.createdBy || 'Staff Member',
  };
}

export const expenseService = {
  // --- Account Heads ---
  async getAccountHeads(params?: { search?: string }): Promise<AccountHead[]> {
    try {
      const response = await apiClient.get('/expenses/account-heads/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (response.data?.results && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      return [];
    }
  },

  async createAccountHead(input: CreateAccountHeadInput): Promise<AccountHead> {
    try {
      const response = await apiClient.post<AccountHead>('/expenses/account-heads/', input);
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

  async toggleAccountHeadActive(id: number): Promise<AccountHead> {
    try {
      const response = await apiClient.post<AccountHead>(`/expenses/account-heads/${id}/toggle-active/`);
      return response.data;
    } catch (err: any) {
      console.error('Failed to toggle Account Head active status:', err);
      throw err;
    }
  },

  // --- Expenses ---
  async getExpenses(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    account_head_id?: number;
    payment_method?: string;
    property_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ items: Expense[]; totalCount: number }> {
    try {
      const response = await apiClient.get('/expenses/', { params });
      if (response.data && Array.isArray(response.data.results)) {
        return {
          items: response.data.results.map(normalizeExpense),
          totalCount: response.data.count ?? response.data.results.length,
        };
      } else if (Array.isArray(response.data)) {
        return {
          items: response.data.map(normalizeExpense),
          totalCount: response.data.length,
        };
      }
      return { items: [], totalCount: 0 };
    } catch {
      return { items: [], totalCount: 0 };
    }
  },

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    try {
      const payload = {
        property: input.propertyId,
        account_head: input.accountHeadId,
        item_name: input.title || '',
        amount: input.amount,
        expense_date: input.date,
        payment_method: input.paymentMethod,
        vendor_name: input.paidTo || '',
        receipt_number: input.receiptNumber || '',
        description: input.notes || '',
      };
      const response = await apiClient.post('/expenses/', payload);
      return normalizeExpense(response.data);
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

  async exportExpensesCSV(params?: Record<string, any>): Promise<void> {
    try {
      const response = await apiClient.get('/expenses/export_csv/', {
        params,
        responseType: 'blob',
      });
      const timestamp = new Date().toISOString().slice(0, 10);
      triggerFileDownload(response.data, `expenses-export-${timestamp}.csv`);
    } catch (err) {
      console.error('Failed to export expenses CSV:', err);
      throw err;
    }
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      await apiClient.delete(`/expenses/${id}/`);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      throw err;
    }
  },
};
