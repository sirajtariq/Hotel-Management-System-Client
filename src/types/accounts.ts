export type AccountType = 'CASH' | 'BANK' | 'WALLET';
export type TransactionType = 'INFLOW' | 'OUTFLOW' | 'TRANSFER_IN' | 'TRANSFER_OUT';
export type SourceModule = 'BOOKING' | 'POS' | 'EXPENSE' | 'TRANSFER' | 'MANUAL';

export interface PaymentAccount {
  id: number;
  name: string;
  account_type: AccountType;
  accountType?: AccountType;
  bank_name?: string;
  bankName?: string;
  account_number?: string;
  accountNumber?: string;
  iban?: string;
  branch_name?: string;
  branchName?: string;
  opening_balance: number;
  openingBalance?: number;
  current_balance: number;
  currentBalance?: number;
  is_default: boolean;
  isDefault?: boolean;
  is_active: boolean;
  isActive?: boolean;
  transactions_count?: number;
  transactionsCount?: number;
  created_at?: string;
  createdAt?: string;
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
