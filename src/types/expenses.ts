export type ExpenseCategory = 
  | 'utilities'
  | 'maintenance'
  | 'supplies'
  | 'salaries'
  | 'marketing'
  | 'taxes'
  | 'miscellaneous';

export interface Expense {
  id: string;
  propertyId: string;
  propertyName: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidTo: string;
  receiptNumber?: string;
  notes?: string;
  createdBy: string;
}

export interface CreateExpenseInput {
  propertyId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidTo: string;
  receiptNumber?: string;
  notes?: string;
}
