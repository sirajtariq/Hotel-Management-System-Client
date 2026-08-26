export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'pending';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Guest {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  cnicOrPassport?: string;
}

export type BookingMode = 'NIGHTLY' | 'HOURLY';

export type DiscountType = 'FLAT' | 'PERCENTAGE';

export interface Booking {
  id: string;
  bookingReference: string;
  invoiceNumber?: string;
  tenantId?: string;
  tenantName?: string;
  propertyId?: string;
  propertyName: string;
  propertyAddress?: string;
  propertyCity?: string;
  roomId?: string;
  roomNumber: string;
  roomTypeName?: string;
  guest: Guest;
  booking_type?: BookingMode | string;
  bookingType?: BookingMode | string;
  checkInDate: string;
  checkOutDate: string;
  check_in?: string | null;
  check_out?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  totalNights: number;
  total_duration?: string;
  totalDuration?: string;
  nightlyRate?: number;
  rate_applied?: number;
  rateApplied?: number;
  subtotal_amount?: number;
  subtotalAmount?: number;
  discount_type?: DiscountType | string;
  discountType?: DiscountType | string;
  discount_value?: number;
  discountValue?: number;
  discount_amount?: number;
  discountAmount?: number;
  tax_rate?: number;
  taxRate?: number;
  tax_amount?: number;
  taxAmount?: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialNotes?: string;
  createdAt: string;
}

export interface BookingListItem {
  id: string;
  invoiceNumber?: string;
  propertyName: string;
  roomNumber: string;
  roomTypeName?: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  bookingType: BookingMode | string;
  checkIn?: string | null;
  checkOut?: string | null;
  checkInDate?: string;
  checkOutDate?: string;
  totalDuration?: string;
  totalAmount: number;
  paidAmount: number;
  remainingBalance?: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingInput {
  propertyId: number | string;
  property?: number | string;
  roomId: number | string;
  room?: number | string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  cnicOrPassport?: string;
  bookingType: BookingMode;
  checkIn: string;          // ISO String: e.g. "2026-08-26T09:00:00.000Z"
  checkOut: string;         // ISO String: e.g. "2026-08-27T07:00:00.000Z"
  checkInDate?: string;
  checkOutDate?: string;
  totalDuration?: string;
  nightlyRate?: number;
  rateApplied?: number;
  subtotalAmount?: number;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  initialPayment?: number;
  paidAmount?: number;
  notes?: string;
}

export interface RecordPaymentInput {
  bookingId: string;
  amount: number;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer';
  notes?: string;
}
