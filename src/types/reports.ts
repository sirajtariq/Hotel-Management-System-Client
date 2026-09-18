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
  net_profit?: number;
  netProfit?: number;
}

export interface PnLReportData {
  period: FinancialPeriodFilter;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  gross_revenue?: number;
  grossRevenue?: number;
  room_revenue?: number;
  roomRevenue?: number;
  restaurant_revenue?: number;
  restaurantRevenue?: number;
  operational_expenses?: number;
  operationalExpenses?: number;
  payroll_expenses?: number;
  payrollExpenses?: number;
  rent_expenses?: number;
  rentExpenses?: number;
  total_expenses?: number;
  totalExpenses?: number;
  net_profit?: number;
  netProfit?: number;
  profit_margin?: number;
  profitMargin?: number;
  chart_data?: PnLTimeSeriesPoint[];
  chartData?: PnLTimeSeriesPoint[];
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
  room_revenue?: number;
  roomRevenue?: number;
  total_revenue?: number;
  totalRevenue?: number;
}

export interface RevenueReportData {
  period: FinancialPeriodFilter;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  total_revenue?: number;
  totalRevenue?: number;
  revenue_by_room_type?: RoomTypeRevenueItem[];
  revenueByRoomType?: RoomTypeRevenueItem[];
  payment_methods?: PaymentMethodItem[];
  paymentMethods?: PaymentMethodItem[];
  channel_ratio?: ChannelRatioItem[];
  channelRatio?: ChannelRatioItem[];
  daily_sales?: DailySalesPoint[];
  dailySales?: DailySalesPoint[];
}

// Tab 3: Expense Report Data
export interface ExpenseCategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface ExpenseTransactionItem {
  id: number;
  item_name?: string;
  itemName?: string;
  vendor_name?: string;
  vendorName?: string;
  category: string;
  amount: number;
  expense_date?: string;
  expenseDate?: string;
  created_by?: string;
  createdBy?: string;
}

export interface DailyOutflowPoint {
  date: string;
  amount: number;
}

export interface ExpenseReportData {
  period: FinancialPeriodFilter;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  total_expenses?: number;
  totalExpenses?: number;
  categories_breakdown?: ExpenseCategoryBreakdownItem[];
  categoriesBreakdown?: ExpenseCategoryBreakdownItem[];
  top_transactions?: ExpenseTransactionItem[];
  topTransactions?: ExpenseTransactionItem[];
  daily_outflow?: DailyOutflowPoint[];
  dailyOutflow?: DailyOutflowPoint[];
}

// Tab 4: Hospitality KPI Data
export interface HospitalityKpiPoint {
  date: string;
  occupancy_rate: number;
  adr: number;
  revpar: number;
}

export interface RoomTypePerformanceItem {
  room_type?: string;
  roomType?: string;
  total_units?: number;
  totalUnits?: number;
  nights_booked?: number;
  nightsBooked?: number;
  occupancy_rate?: number;
  occupancyRate?: number;
  revenue_generated?: number;
  revenueGenerated?: number;
}

export interface HospitalityKpiReportData {
  period: FinancialPeriodFilter;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  total_rooms?: number;
  totalRooms?: number;
  occupied_room_nights?: number;
  occupiedRoomNights?: number;
  occupancy_rate?: number;
  occupancyRate?: number;
  adr?: number;
  revpar?: number;
  alos?: number;
  kpi_trend?: HospitalityKpiPoint[];
  kpiTrend?: HospitalityKpiPoint[];
  room_type_performance?: RoomTypePerformanceItem[];
  roomTypePerformance?: RoomTypePerformanceItem[];
}

// Tab 5: Restaurant Report Data
export interface OrderTypeSplitItem {
  order_type?: string;
  orderType?: string;
  amount: number;
  count: number;
}

export interface TopSellerItem {
  item_name?: string;
  itemName?: string;
  category_name?: string;
  categoryName?: string;
  quantity_sold?: number;
  quantitySold?: number;
  total_revenue?: number;
  totalRevenue?: number;
}

export interface RestaurantReportData {
  period: FinancialPeriodFilter;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  total_sales?: number;
  totalSales?: number;
  total_discount?: number;
  totalDiscount?: number;
  total_tax?: number;
  totalTax?: number;
  order_type_split?: OrderTypeSplitItem[];
  orderTypeSplit?: OrderTypeSplitItem[];
  top_sellers?: TopSellerItem[];
  topSellers?: TopSellerItem[];
}

// Tab 6: Receivables & Tax Data
export interface AgingReceivableItem {
  id: number;
  guest_name?: string;
  guestName?: string;
  guest_phone?: string;
  guestPhone?: string;
  room_number?: string;
  roomNumber?: string;
  check_in_date?: string;
  checkInDate?: string;
  check_out_date?: string;
  checkOutDate?: string;
  total_amount?: number;
  totalAmount?: number;
  paid_amount?: number;
  paidAmount?: number;
  balance_due?: number;
  balanceDue?: number;
  status: string;
}

export interface ReceivablesReportData {
  period: FinancialPeriodFilter;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  room_tax_collected?: number;
  roomTaxCollected?: number;
  restaurant_tax_collected?: number;
  restaurantTaxCollected?: number;
  total_tax_collected?: number;
  totalTaxCollected?: number;
  total_pending_balance?: number;
  totalPendingBalance?: number;
  aging_receivables?: AgingReceivableItem[];
  agingReceivables?: AgingReceivableItem[];
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

