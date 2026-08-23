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

export interface CreateBookingInput {
  propertyId?: string;
  roomId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  cnicOrPassport?: string;
  booking_type?: BookingMode;
  bookingType?: BookingMode;
  checkInDate?: string;
  checkOutDate?: string;
  check_in?: string;
  check_out?: string;
  checkIn?: string;
  checkOut?: string;
  total_duration?: string;
  totalDuration?: string;
  nightlyRate?: number;
  rate_applied?: number;
  rateApplied?: number;
  subtotal_amount?: number;
  subtotalAmount?: number;
  discount_type?: DiscountType;
  discountType?: DiscountType;
  discount_value?: number;
  discountValue?: number;
  discount_amount?: number;
  discountAmount?: number;
  tax_rate?: number;
  taxRate?: number;
  tax_amount?: number;
  taxAmount?: number;
  totalAmount?: number;
  initialPayment?: number;
  notes?: string;
}

export interface RecordPaymentInput {
  bookingId: string;
  amount: number;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer';
  notes?: string;
}
