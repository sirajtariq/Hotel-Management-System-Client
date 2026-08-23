export type FinancialPeriodFilter =
  | 'today'
  | '7d'
  | '30d'
  | 'this_month'
  | 'last_month'
  | 'quarter'
  | 'ytd'
  | 'custom';

export type FinancialReportType =
  | 'pnl'
  | 'revenue'
  | 'expenses'
  | 'hospitality'
  | 'restaurant'
  | 'receivables';

// Tab 1: P&L Report Data
export interface PnLLedgerItem {
  category: string;
  type: 'REVENUE' | 'EXPENSE';
  amount: number;
}

export interface PnLTimeSeriesPoint {
  date: string;
  revenue: number;
  expenses: number;
  net_profit: number;
}

export interface PnLReportData {
  period: FinancialPeriodFilter;
  start_date: string;
  end_date: string;
  gross_revenue: number;
  room_revenue: number;
  restaurant_revenue: number;
  operational_expenses: number;
  payroll_expenses: number;
  rent_expenses: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  chart_data: PnLTimeSeriesPoint[];
  ledger: PnLLedgerItem[];
}

// Tab 2: Revenue Report Data
export interface RoomTypeRevenueItem {
  room_type: string;
  amount: number;
  percentage: number;
}

export interface PaymentMethodItem {
  method: string;
  amount: number;
  percentage: number;
}

export interface ChannelRatioItem {
  channel: string;
  amount: number;
  percentage: number;
}

export interface DailySalesPoint {
  date: string;
  room_revenue: number;
  total_revenue: number;
}

export interface RevenueReportData {
  period: FinancialPeriodFilter;
  start_date: string;
  end_date: string;
  total_revenue: number;
  revenue_by_room_type: RoomTypeRevenueItem[];
  payment_methods: PaymentMethodItem[];
  channel_ratio: ChannelRatioItem[];
  daily_sales: DailySalesPoint[];
}

// Tab 3: Expense Report Data
export interface ExpenseCategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface ExpenseTransactionItem {
  id: number;
  item_name: string;
  vendor_name: string;
  category: string;
  amount: number;
  expense_date: string;
  created_by: string;
}

export interface DailyOutflowPoint {
  date: string;
  amount: number;
}

export interface ExpenseReportData {
  period: FinancialPeriodFilter;
  start_date: string;
  end_date: string;
  total_expenses: number;
  categories_breakdown: ExpenseCategoryBreakdownItem[];
  top_transactions: ExpenseTransactionItem[];
  daily_outflow: DailyOutflowPoint[];
}

// Tab 4: Hospitality KPI Data
export interface HospitalityKpiPoint {
  date: string;
  occupancy_rate: number;
  adr: number;
  revpar: number;
}

export interface RoomTypePerformanceItem {
  room_type: string;
  total_units: number;
  nights_booked: number;
  occupancy_rate: number;
  revenue_generated: number;
}

export interface HospitalityKpiReportData {
  period: FinancialPeriodFilter;
  start_date: string;
  end_date: string;
  total_rooms: number;
  occupied_room_nights: number;
  occupancy_rate: number;
  adr: number;
  revpar: number;
  alos: number;
  kpi_trend: HospitalityKpiPoint[];
  room_type_performance: RoomTypePerformanceItem[];
}

// Tab 5: Restaurant Report Data
export interface OrderTypeSplitItem {
  order_type: string;
  amount: number;
  count: number;
}

export interface TopSellerItem {
  item_name: string;
  category_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface RestaurantReportData {
  period: FinancialPeriodFilter;
  start_date: string;
  end_date: string;
  total_sales: number;
  total_discount: number;
  total_tax: number;
  order_type_split: OrderTypeSplitItem[];
  top_sellers: TopSellerItem[];
}

// Tab 6: Receivables & Tax Data
export interface AgingReceivableItem {
  id: number;
  guest_name: string;
  guest_phone: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: string;
}

export interface ReceivablesReportData {
  period: FinancialPeriodFilter;
  start_date: string;
  end_date: string;
  room_tax_collected: number;
  restaurant_tax_collected: number;
  total_tax_collected: number;
  total_pending_balance: number;
  aging_receivables: AgingReceivableItem[];
}

// Backward Compatibility Types for legacy report components
export interface PnLSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  period: string;
}

export interface RevenueExpenseTrend {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface FinancialBreakdownItem {
  category: string;
  revenueOrExpense: 'revenue' | 'expense';
  amount: number;
  percentage: number;
}

