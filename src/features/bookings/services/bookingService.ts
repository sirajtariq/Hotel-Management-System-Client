import { apiClient } from '@/lib/axios';
import { Booking, BookingStatus, CreateBookingInput, RecordPaymentInput } from '@/types/bookings';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk_1001',
    bookingReference: 'BK-2026-881',
    tenantId: 'tenant_01',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomId: 'rm_102',
    roomNumber: '102 (Suite)',
    guest: {
      id: 'gst_01',
      fullName: 'Muhammad Tariq',
      email: 'tariq@gmail.com',
      phone: '+92 300 1234567',
      cnicOrPassport: '42201-1234567-1',
    },
    checkInDate: '2026-08-20',
    checkOutDate: '2026-08-25',
    totalNights: 5,
    totalAmount: 225000,
    paidAmount: 150000,
    remainingAmount: 75000,
    status: 'checked_in',
    paymentStatus: 'partial',
    createdAt: '2026-08-18',
  },
  {
    id: 'bk_1002',
    bookingReference: 'BK-2026-882',
    tenantId: 'tenant_01',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomId: 'rm_201',
    roomNumber: '201 (Penthouse)',
    guest: {
      id: 'gst_02',
      fullName: 'Dr. Ayesha Rehman',
      email: 'ayesha.rehman@hospital.org',
      phone: '+92 321 9876543',
      cnicOrPassport: '35202-9876543-2',
    },
    checkInDate: '2026-08-22',
    checkOutDate: '2026-08-24',
    totalNights: 2,
    totalAmount: 240000,
    paidAmount: 240000,
    remainingAmount: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-08-21',
  },
];

function normalizeBooking(b: any): Booking {
  const total = parseFloat(b.total_amount || b.totalAmount || '0');
  const paid = parseFloat(b.paid_amount || b.paidAmount || '0');
  const remaining = parseFloat(b.remaining_balance || b.remainingAmount || (total - paid));
  const rate = parseFloat(b.nightly_rate || b.nightlyRate || (total / Math.max(1, b.total_nights || b.totalNights || 1)));

  const guestName = b.guest?.fullName || b.guest_name || 'Guest';
  const guestPhone = b.guest?.phone || b.guest_phone || 'N/A';
  const guestEmail = b.guest?.email || b.guest_email || '';
  const guestCnic = b.guest?.cnicOrPassport || b.guest_cnic || 'N/A';

  const roomNum = b.room_details?.room_number || b.room_number
    ? `Room ${b.room_details?.room_number || b.room_number}`
    : (b.roomNumber || 'Room N/A');

  const ref = b.bookingReference || b.booking_reference || `BK-2026-${String(b.id).padStart(3, '0')}`;
  const inv = b.invoice_number || b.invoiceNumber || `INV-RS-2026-${String(b.id).padStart(4, '0')}`;

  return {
    id: String(b.id),
    bookingReference: ref,
    invoiceNumber: inv,
    tenantId: String(b.tenant || b.tenantId || ''),
    tenantName: b.tenant_name || b.tenantName || 'Pearl Suites & Hotel Management',
    propertyId: String(b.property || b.propertyId || ''),
    propertyName: b.property_name || b.propertyName || 'Pearl Continental & Serviced Suites',
    propertyAddress: b.property_address || b.propertyAddress || 'Block 4, Clifton, Club Road',
    propertyCity: b.property_city || b.propertyCity || 'Karachi, Pakistan',
    roomId: String(b.room || b.roomId || ''),
    roomNumber: roomNum,
    roomTypeName: b.room_type_name || b.roomTypeName || b.room_details?.room_type?.name || 'Executive Deluxe Suite',
    guest: {
      id: b.guest?.id || `gst_${b.id}`,
      fullName: guestName,
      email: guestEmail,
      phone: guestPhone,
      cnicOrPassport: guestCnic,
    },
    checkInDate: b.check_in_date || b.checkInDate || '',
    checkOutDate: b.check_out_date || b.checkOutDate || '',
    totalNights: b.total_nights || b.totalNights || 1,
    nightlyRate: isNaN(rate) ? 0 : rate,
    totalAmount: isNaN(total) ? 0 : total,
    paidAmount: isNaN(paid) ? 0 : paid,
    remainingAmount: isNaN(remaining) ? 0 : remaining,
    status: (b.status || 'CONFIRMED').toLowerCase() as any,
    paymentStatus: (b.payment_status || b.paymentStatus || 'UNPAID').toLowerCase() as any,
    createdAt: b.created_at || b.createdAt || new Date().toISOString().split('T')[0],
  };
}


function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const bookingService = {
  async getBookings(params?: { page?: number; page_size?: number; search?: string }): Promise<{ items: Booking[]; totalCount: number }> {
    try {
      const response = await apiClient.get('/bookings/', { params });
      if (response.data && Array.isArray(response.data.results)) {
        return {
          items: response.data.results.map(normalizeBooking),
          totalCount: response.data.count ?? response.data.results.length,
        };
      } else if (Array.isArray(response.data)) {
        return {
          items: response.data.map(normalizeBooking),
          totalCount: response.data.length,
        };
      }
      return { items: [], totalCount: 0 };
    } catch {
      return { items: [], totalCount: 0 };
    }
  },



  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    try {
      const response = await apiClient.patch<Booking>(`/bookings/${id}/`, { status });
      return response.data;
    } catch {
      const target = MOCK_BOOKINGS.find((b) => b.id === id);
      if (target) target.status = status;
      return target || MOCK_BOOKINGS[0];
    }
  },

  async recordPayment(input: RecordPaymentInput): Promise<Booking> {
    try {
      const response = await apiClient.post<Booking>(`/bookings/${input.bookingId}/pay/`, input);
      return response.data;
    } catch {
      const target = MOCK_BOOKINGS.find((b) => b.id === input.bookingId);
      if (target) {
        target.paidAmount += input.amount;
        target.remainingAmount = Math.max(0, target.totalAmount - target.paidAmount);
        target.paymentStatus = target.remainingAmount === 0 ? 'paid' : 'partial';
      }
      return target || MOCK_BOOKINGS[0];
    }
  },

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    try {
      const response = await apiClient.post<Booking>('/bookings/', input);
      return response.data;
    } catch {
      const remaining = Math.max(0, input.totalAmount - input.initialPayment);
      const newBk: Booking = {
        id: `bk_${Date.now()}`,
        bookingReference: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
        tenantId: 'tenant_01',
        propertyId: input.propertyId,
        propertyName: 'Pearl Continental',
        roomId: input.roomId,
        roomNumber: '105 (Deluxe)',
        guest: {
          id: `gst_${Date.now()}`,
          fullName: input.guestName,
          email: input.guestEmail,
          phone: input.guestPhone,
          cnicOrPassport: input.cnicOrPassport,
        },
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        totalNights: 3,
        totalAmount: input.totalAmount,
        paidAmount: input.initialPayment,
        remainingAmount: remaining,
        status: 'confirmed',
        paymentStatus: remaining === 0 ? 'paid' : input.initialPayment > 0 ? 'partial' : 'unpaid',
        createdAt: new Date().toISOString().split('T')[0],
      };
      MOCK_BOOKINGS.unshift(newBk);
      return newBk;
    }
  },
};
