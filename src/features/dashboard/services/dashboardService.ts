import { apiClient } from '@/lib/axios';
import {
  DashboardAnalyticsData,
  PeriodFilter,
  KpiMetrics,
  OperationsPulse,
  ArrivalItem,
  DepartureItem,
  PendingPaymentItem,
} from '@/types/dashboard';

function normalizeArrival(item: any): ArrivalItem {
  return {
    id: item.id,
    guest_name: item.guestName || item.guest_name || 'Guest',
    guest_phone: item.guestPhone || item.guest_phone || '',
    room_id: item.roomId ?? item.room_id ?? null,
    room_number: item.roomNumber || item.room_number || 'N/A',
    room_type_name: item.roomTypeName || item.room_type_name || 'Room',
    check_in_date: item.checkInDate || item.check_in_date || '',
    advance_paid: parseFloat(item.advancePaid || item.advance_paid || '0'),
    total_amount: parseFloat(item.totalAmount || item.total_amount || '0'),
    status: item.status || 'CONFIRMED',
  };
}

function normalizeDeparture(item: any): DepartureItem {
  return {
    id: item.id,
    guest_name: item.guestName || item.guest_name || 'Guest',
    guest_phone: item.guestPhone || item.guest_phone || '',
    room_id: item.roomId ?? item.room_id ?? null,
    room_number: item.roomNumber || item.room_number || 'N/A',
    room_type_name: item.roomTypeName || item.room_type_name || 'Room',
    check_out_date: item.checkOutDate || item.check_out_date || '',
    paid_amount: parseFloat(item.paidAmount || item.paid_amount || '0'),
    total_amount: parseFloat(item.totalAmount || item.total_amount || '0'),
    total_balance: parseFloat(item.totalBalance || item.total_balance || '0'),
    status: item.status || 'CHECKED_IN',
  };
}

function normalizePendingPayment(item: any): PendingPaymentItem {
  return {
    id: item.id,
    guest_name: item.guestName || item.guest_name || 'Guest',
    room_number: item.roomNumber || item.room_number || 'N/A',
    paid_amount: parseFloat(item.paidAmount || item.paid_amount || '0'),
    total_amount: parseFloat(item.totalAmount || item.total_amount || '0'),
    balance: parseFloat(item.balance || '0'),
  };
}

function normalizeDashboardAnalytics(data: any): DashboardAnalyticsData {
  if (!data) {
    return {
      period: 'today',
      kpis: {
        today_revenue: 0,
        period_revenue: 0,
        revenue_trend: 0,
        total_rooms: 0,
        occupied_rooms: 0,
        occupancy_rate: 0,
        occupancy_trend: 0,
        adr: 0,
        adr_trend: 0,
        revpar: 0,
        revpar_trend: 0,
      },
      operations_pulse: {
        today_arrivals: [],
        today_departures: [],
        pending_payments: [],
        dirty_rooms_count: 0,
      },
      chart_data: [],
      room_type_occupancy: [],
    };
  }

  const k = data.kpis || {};
  const kpis: KpiMetrics = {
    today_revenue: parseFloat(k.todayRevenue || k.today_revenue || '0'),
    period_revenue: parseFloat(k.periodRevenue || k.period_revenue || '0'),
    revenue_trend: parseFloat(k.revenueTrend || k.revenue_trend || '0'),
    total_rooms: k.totalRooms ?? k.total_rooms ?? 0,
    occupied_rooms: k.occupiedRooms ?? k.occupied_rooms ?? 0,
    occupancy_rate: parseFloat(k.occupancyRate || k.occupancy_rate || '0'),
    occupancy_trend: parseFloat(k.occupancyTrend || k.occupancy_trend || '0'),
    adr: parseFloat(k.adr || '0'),
    adr_trend: parseFloat(k.adrTrend || k.adr_trend || '0'),
    revpar: parseFloat(k.revpar || '0'),
    revpar_trend: parseFloat(k.revparTrend || k.revpar_trend || '0'),
  };

  const pulseRaw = data.operationsPulse || data.operations_pulse || {};
  const arrivalsRaw = pulseRaw.todayArrivals || pulseRaw.today_arrivals || [];
  const departuresRaw = pulseRaw.todayDepartures || pulseRaw.today_departures || [];
  const pendingPaymentsRaw = pulseRaw.pendingPayments || pulseRaw.pending_payments || [];

  const operations_pulse: OperationsPulse = {
    today_arrivals: Array.isArray(arrivalsRaw) ? arrivalsRaw.map(normalizeArrival) : [],
    today_departures: Array.isArray(departuresRaw) ? departuresRaw.map(normalizeDeparture) : [],
    pending_payments: Array.isArray(pendingPaymentsRaw) ? pendingPaymentsRaw.map(normalizePendingPayment) : [],
    dirty_rooms_count: pulseRaw.dirtyRoomsCount ?? pulseRaw.dirty_rooms_count ?? 0,
  };

  const chartRaw = data.chartData || data.chart_data || [];
  const chart_data = Array.isArray(chartRaw)
    ? chartRaw.map((pt: any) => ({
        date: pt.date || '',
        revenue: parseFloat(pt.revenue || '0'),
        occupancy_rate: parseFloat(pt.occupancyRate || pt.occupancy_rate || '0'),
        adr: parseFloat(pt.adr || '0'),
        revpar: parseFloat(pt.revpar || '0'),
      }))
    : [];

  const roomTypeRaw = data.roomTypeOccupancy || data.room_type_occupancy || [];
  const room_type_occupancy = Array.isArray(roomTypeRaw)
    ? roomTypeRaw.map((rt: any) => ({
        room_type_id: rt.roomTypeId ?? rt.room_type_id ?? 0,
        room_type: rt.roomType || rt.room_type || '',
        base_price: parseFloat(rt.basePrice || rt.base_price || '0'),
        total_rooms: rt.totalRooms ?? rt.total_rooms ?? 0,
        occupied_rooms: rt.occupiedRooms ?? rt.occupied_rooms ?? 0,
        occupancy_rate: parseFloat(rt.occupancyRate || rt.occupancy_rate || '0'),
      }))
    : [];

  return {
    period: data.period || 'today',
    kpis,
    operations_pulse,
    chart_data,
    room_type_occupancy,
  };
}

export const dashboardService = {
  async getAnalytics(period: PeriodFilter = 'today', propertyId?: string): Promise<DashboardAnalyticsData> {
    const params: Record<string, any> = { period };
    if (propertyId && propertyId !== 'ALL') {
      params.property_id = propertyId;
    }

    const response = await apiClient.get<any>('/reports/dashboard_analytics/', { params });
    return normalizeDashboardAnalytics(response.data);
  },
};
