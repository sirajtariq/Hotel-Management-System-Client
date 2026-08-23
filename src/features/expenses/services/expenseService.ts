import { apiClient } from '@/lib/axios';
import { triggerFileDownload } from '@/lib/export';
import { Expense, ExpenseCategory, CreateExpenseInput } from '@/types/expenses';



const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp_01',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    title: 'K-Electric Commercial Power Bill',
    category: 'utilities',
    amount: 485000,
    date: '2026-08-15',
    paidTo: 'K-Electric Pvt Ltd',
    receiptNumber: 'KE-99201',
    createdBy: 'Tariq Manager',
  },
  {
    id: 'exp_02',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    title: 'HVAC Air Conditioning Compressor Repair',
    category: 'maintenance',
    amount: 120000,
    date: '2026-08-18',
    paidTo: 'CoolTech HVAC Solutions',
    receiptNumber: 'CT-4421',
    createdBy: 'Tariq Manager',
  },
  {
    id: 'exp_03',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    title: 'Hotel Linen & Luxury Housekeeping Supplies',
    category: 'supplies',
    amount: 85000,
    date: '2026-08-20',
    paidTo: 'Linen Master Wholesale',
    receiptNumber: 'LM-1029',
    createdBy: 'Tariq Manager',
  },
];

function mapCategory(cat: any): ExpenseCategory {
  const catStr = String(cat?.name || cat || '').toLowerCase();
  if (catStr.includes('util') || catStr.includes('bill')) return 'utilities';
  if (catStr.includes('maint') || catStr.includes('repair')) return 'maintenance';
  if (catStr.includes('suppli') || catStr.includes('clean')) return 'supplies';
  if (catStr.includes('salar') || catStr.includes('pay')) return 'salaries';
  if (catStr.includes('market') || catStr.includes('ad')) return 'marketing';
  if (catStr.includes('tax')) return 'taxes';
  return 'miscellaneous';
}

function normalizeExpense(e: any): Expense {
  const amt = parseFloat(e.amount || '0');
  const cat = e.category_details ? mapCategory(e.category_details) : mapCategory(e.category);

  return {
    id: String(e.id),
    propertyId: String(e.property || e.propertyId || ''),
    propertyName: e.propertyName || 'Hotel Property',
    title: e.item_name || e.item || e.title || 'Expense Item',
    category: cat,
    amount: isNaN(amt) ? 0 : amt,
    date: e.expense_date || e.date || new Date().toISOString().split('T')[0],
    paidTo: e.vendor_name || e.vendor || e.paidTo || 'N/A',
    receiptNumber: e.receiptNumber || (e.id ? `EXP-${String(e.id).padStart(3, '0')}` : undefined),
    notes: e.description || e.notes || '',
    createdBy: e.created_by_name || e.createdBy || 'Staff Member',
  };
}

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const expenseService = {
  async getExpenses(params?: { page?: number; page_size?: number; search?: string }): Promise<{ items: Expense[]; totalCount: number }> {
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
      const response = await apiClient.post<Expense>('/expenses/', input);
      return response.data;
    } catch {
      const newExp: Expense = {
        id: `exp_${Date.now()}`,
        ...input,
        propertyName: 'Pearl Continental',
        createdBy: 'Tariq Manager',
      };
      MOCK_EXPENSES.unshift(newExp);
      return newExp;
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

