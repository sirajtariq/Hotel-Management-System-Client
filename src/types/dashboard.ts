export type PeriodFilter = 'today' | '7d' | '30d' | 'quarter' | 'ytd';

export interface KpiMetrics {
  today_revenue: number;
  period_revenue: number;
  revenue_trend: number;
  total_rooms: number;
  occupied_rooms: number;
  occupancy_rate: number;
  occupancy_trend: number;
  adr: number;
  adr_trend: number;
  revpar: number;
  revpar_trend: number;
}

export interface ArrivalItem {
  id: number;
  guest_name: string;
  guest_phone: string;
  room_id: number | null;
  room_number: string;
  room_type_name: string;
  check_in_date: string;
  advance_paid: number;
  total_amount: number;
  status: string;
}

export interface DepartureItem {
  id: number;
  guest_name: string;
  guest_phone: string;
  room_id: number | null;
  room_number: string;
  room_type_name: string;
  check_out_date: string;
  paid_amount: number;
  total_amount: number;
  total_balance: number;
  status: string;
}

export interface PendingPaymentItem {
  id: number;
  guest_name: string;
  room_number: string;
  paid_amount: number;
  total_amount: number;
  balance: number;
}

export interface OperationsPulse {
  today_arrivals: ArrivalItem[];
  today_departures: DepartureItem[];
  pending_payments: PendingPaymentItem[];
  dirty_rooms_count: number;
}

export interface TimeSeriesPoint {
  date: string;
  revenue: number;
  occupancy_rate: number;
  adr: number;
  revpar: number;
}

export interface RoomTypeOccupancyItem {
  room_type_id: number;
  room_type: string;
  base_price: number;
  total_rooms: number;
  occupied_rooms: number;
  occupancy_rate: number;
}

export interface DashboardAnalyticsData {
  period: PeriodFilter;
  kpis: KpiMetrics;
  operations_pulse: OperationsPulse;
  chart_data: TimeSeriesPoint[];
  room_type_occupancy: RoomTypeOccupancyItem[];
}
