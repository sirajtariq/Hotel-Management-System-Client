import { apiClient } from '@/lib/axios';
import {
  PaymentAccount,
  AccountTransaction,
  AccountTransfer,
  CreateAccountInput,
  CreateTransferInput,
} from '@/types/accounts';

const MOCK_ACCOUNTS: PaymentAccount[] = [
  {
    id: 1,
    name: 'Main Cash Drawer / Counter',
    account_type: 'CASH',
    opening_balance: 15000,
    current_balance: 145000,
    is_default: true,
    is_active: true,
  },
  {
    id: 2,
    name: 'Meezan Bank - Operations',
    account_type: 'BANK',
    bank_name: 'Meezan Bank',
    account_number: '0102-0104829101',
    iban: 'PK36MEZN0001020104829101',
    branch_name: 'Main Boulevard, Gulberg',
    opening_balance: 250000,
    current_balance: 890000,
    is_default: false,
    is_active: true,
  },
  {
    id: 3,
    name: 'Front Counter POS Terminal',
    account_type: 'WALLET',
    opening_balance: 0,
    current_balance: 68500,
    is_default: false,
    is_active: true,
  },
];

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
      if (raw.length > 0) {
        return raw.map((item) => ({
          ...item,
          opening_balance: parseFloat(item.opening_balance || 0),
          current_balance: parseFloat(item.current_balance || 0),
        }));
      }
      return MOCK_ACCOUNTS;
    } catch {
      return MOCK_ACCOUNTS;
    }
  },

  async createPaymentAccount(input: CreateAccountInput): Promise<PaymentAccount> {
    try {
      const response = await apiClient.post('/payment-accounts/', input);
      return {
        ...response.data,
        opening_balance: parseFloat(response.data.opening_balance || 0),
        current_balance: parseFloat(response.data.current_balance || 0),
      };
    } catch {
      const newAcc: PaymentAccount = {
        id: Date.now(),
        name: input.name,
        account_type: input.account_type,
        bank_name: input.bank_name,
        account_number: input.account_number,
        iban: input.iban,
        branch_name: input.branch_name,
        opening_balance: input.opening_balance || 0,
        current_balance: input.opening_balance || 0,
        is_default: input.is_default || false,
        is_active: true,
      };
      MOCK_ACCOUNTS.unshift(newAcc);
      return newAcc;
    }
  },

  async updatePaymentAccount(id: number, input: Partial<CreateAccountInput>): Promise<PaymentAccount> {
    try {
      const response = await apiClient.patch(`/payment-accounts/${id}/`, input);
      return {
        ...response.data,
        opening_balance: parseFloat(response.data.opening_balance || 0),
        current_balance: parseFloat(response.data.current_balance || 0),
      };
    } catch {
      const idx = MOCK_ACCOUNTS.findIndex((a) => a.id === id);
      if (idx !== -1) {
        const updated = { ...MOCK_ACCOUNTS[idx], ...input };
        MOCK_ACCOUNTS[idx] = updated as PaymentAccount;
        return updated as PaymentAccount;
      }
      return MOCK_ACCOUNTS[0];
    }
  },

  async setDefaultAccount(id: number): Promise<PaymentAccount> {
    try {
      const response = await apiClient.post(`/payment-accounts/${id}/set-default/`);
      return response.data;
    } catch {
      MOCK_ACCOUNTS.forEach((a) => {
        a.is_default = a.id === id;
      });
      return MOCK_ACCOUNTS.find((a) => a.id === id) || MOCK_ACCOUNTS[0];
    }
  },

  async getAccountTransactions(accountId: number): Promise<AccountTransaction[]> {
    try {
      const response = await apiClient.get(`/payment-accounts/${accountId}/transactions/`);
      return extractArray<AccountTransaction>(response.data, []);
    } catch {
      return [
        {
          id: 101,
          account: accountId,
          transaction_type: 'INFLOW',
          amount: 45000,
          balance_after: 145000,
          source_module: 'BOOKING',
          reference_id: 'RES-1042',
          description: 'Guest Room Charge Payment',
          created_at: new Date().toISOString(),
        },
        {
          id: 102,
          account: accountId,
          transaction_type: 'OUTFLOW',
          amount: 8500,
          balance_after: 100000,
          source_module: 'EXPENSE',
          reference_id: 'EXP-88',
          description: 'Generator Fuel Purchase',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
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
    } catch {
      const fromAcc = MOCK_ACCOUNTS.find((a) => a.id === input.from_account_id);
      const toAcc = MOCK_ACCOUNTS.find((a) => a.id === input.to_account_id);
      if (fromAcc && toAcc) {
        fromAcc.current_balance -= input.amount;
        toAcc.current_balance += input.amount;
      }
      return {
        id: Date.now(),
        from_account: input.from_account_id,
        from_account_name: fromAcc?.name || 'Source Account',
        to_account: input.to_account_id,
        to_account_name: toAcc?.name || 'Target Account',
        amount: input.amount,
        transfer_date: input.transfer_date || new Date().toISOString().split('T')[0],
        reference_number: input.reference_number || `TRF-${Date.now()}`,
        notes: input.notes || '',
        created_at: new Date().toISOString(),
      };
    }
  },
};
