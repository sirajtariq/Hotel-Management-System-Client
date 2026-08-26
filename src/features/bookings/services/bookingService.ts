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
  const total = parseFloat(b.totalAmount ?? b.total_amount ?? '0');
  const paid = parseFloat(b.paidAmount ?? b.paid_amount ?? '0');
  const remVal = b.remainingBalance ?? b.remaining_balance ?? b.remainingAmount ?? (total - paid);
  const remaining = parseFloat(remVal || '0');
  const rate = parseFloat(b.nightlyRate ?? b.nightly_rate ?? (total / Math.max(1, b.totalNights ?? b.total_nights ?? 1)));

  const guestName = b.guestName || b.guest_name || b.guest?.fullName || 'Guest';
  const guestPhone = b.guestPhone || b.guest_phone || b.guest?.phone || 'N/A';
  const guestEmail = b.guestEmail || b.guest_email || b.guest?.email || '';
  const guestCnic = b.guestCnic || b.guest_cnic || b.guest?.cnicOrPassport || 'N/A';

  const roomNum = String(b.roomNumber || b.room_number || b.room_details?.room_number || 'Room N/A');
  const roomTypeName = b.roomTypeName || b.room_type_name || b.room_details?.room_type?.name || 'Executive Deluxe Suite';

  const inv = b.invoiceNumber || b.invoice_number || (b.id ? `INV-RS-2026-${String(b.id).padStart(4, '0')}` : '');
  const ref = b.bookingReference || b.booking_reference || inv || `BK-2026-${String(b.id).padStart(3, '0')}`;

  const rawCheckIn = b.checkInDate || b.check_in_date || (b.checkIn ? String(b.checkIn).split('T')[0] : (b.check_in ? String(b.check_in).split('T')[0] : ''));
  const rawCheckOut = b.checkOutDate || b.check_out_date || (b.checkOut ? String(b.checkOut).split('T')[0] : (b.check_out ? String(b.check_out).split('T')[0] : ''));

  return {
    id: String(b.id),
    bookingReference: ref,
    invoiceNumber: inv,
    tenantId: String(b.tenant || b.tenantId || ''),
    tenantName: b.tenantName || b.tenant_name || 'Pearl Suites & Hotel Management',
    propertyId: String(b.property || b.propertyId || ''),
    propertyName: b.propertyName || b.property_name || 'Pearl Continental & Serviced Suites',
    propertyAddress: b.propertyAddress || b.property_address || 'Block 4, Clifton, Club Road',
    propertyCity: b.propertyCity || b.property_city || 'Karachi, Pakistan',
    roomId: String(b.room || b.roomId || ''),
    roomNumber: roomNum.startsWith('Room ') ? roomNum : `Room ${roomNum}`,
    roomTypeName: roomTypeName,
    guest: {
      id: b.guest?.id || `gst_${b.id}`,
      fullName: guestName,
      email: guestEmail,
      phone: guestPhone,
      cnicOrPassport: guestCnic,
    },
    checkInDate: rawCheckIn,
    checkOutDate: rawCheckOut,
    checkIn: b.checkIn || b.check_in || null,
    checkOut: b.checkOut || b.check_out || null,
    totalNights: b.totalNights || b.total_nights || 1,
    totalDuration: b.totalDuration || b.total_duration || '',
    bookingType: b.bookingType || b.booking_type || 'NIGHTLY',
    booking_type: b.bookingType || b.booking_type || 'NIGHTLY',
    nightlyRate: isNaN(rate) ? 0 : rate,
    totalAmount: isNaN(total) ? 0 : total,
    paidAmount: isNaN(paid) ? 0 : paid,
    remainingAmount: isNaN(remaining) ? 0 : remaining,
    status: (b.status || 'CONFIRMED').toLowerCase() as any,
    paymentStatus: (b.paymentStatus || b.payment_status || 'UNPAID').toLowerCase() as any,
    createdAt: b.createdAt || b.created_at || new Date().toISOString().split('T')[0],
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
      return normalizeBooking(response.data);
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async recordPayment(input: RecordPaymentInput): Promise<Booking> {
    try {
      const response = await apiClient.post<Booking>(`/bookings/${input.bookingId}/record-payment/`, {
        amount: input.amount,
      });
      return normalizeBooking(response.data);
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    try {
      const response = await apiClient.post<Booking>('/bookings/', input);
      return normalizeBooking(response.data);
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },
};
