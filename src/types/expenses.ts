export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'ONLINE';

export interface AccountHead {
  id: number;
  tenant?: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  expenses_count?: number;
  total_spent_amount?: number | string;
}

export interface Expense {
  id: string;
  propertyId: string;
  propertyName: string;
  accountHeadId?: number;
  accountHeadName?: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  receiptImage?: string;
  notes?: string;
  createdBy: string;
}

export interface CreateExpenseInput {
  propertyId: string;
  accountHeadId: number;
  title?: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  paidTo?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface CreateAccountHeadInput {
  name: string;
  description?: string;
}
