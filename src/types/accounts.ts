export type AccountType = 'CASH' | 'BANK' | 'WALLET';
export type TransactionType = 'INFLOW' | 'OUTFLOW' | 'TRANSFER_IN' | 'TRANSFER_OUT';
export type SourceModule = 'BOOKING' | 'POS' | 'EXPENSE' | 'TRANSFER' | 'MANUAL';

export interface PaymentAccount {
  id: number;
  name: string;
  account_type: AccountType;
  bank_name?: string;
  account_number?: string;
  iban?: string;
  branch_name?: string;
  opening_balance: number;
  current_balance: number;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface AccountTransaction {
  id: number;
  account: number;
  account_name?: string;
  transaction_type: TransactionType;
  amount: number;
  balance_after: number;
  source_module: SourceModule;
  reference_id?: string;
  description?: string;
  created_by_name?: string;
  created_at: string;
}

export interface AccountTransfer {
  id: number;
  from_account: number;
  from_account_name?: string;
  to_account: number;
  to_account_name?: string;
  amount: number;
  transfer_date: string;
  reference_number?: string;
  notes?: string;
  created_by_name?: string;
  created_at: string;
}

export interface CreateAccountInput {
  name: string;
  account_type: AccountType;
  bank_name?: string;
  account_number?: string;
  iban?: string;
  branch_name?: string;
  opening_balance?: number;
  is_default?: boolean;
}

export interface CreateTransferInput {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  transfer_date?: string;
  reference_number?: string;
  notes?: string;
}
