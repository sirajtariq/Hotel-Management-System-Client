import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateBookingInput, BookingMode, DiscountType } from '@/types/bookings';
import { roomService, AvailableRoomItem } from '@/features/rooms/services/roomService';
import { Property } from '@/types/properties';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatPKR, formatDate } from '@/lib/formatters';
import { staffService } from '@/features/staff/services/staffService';
import { StaffMember } from '@/types/staff';
import { PaymentAccount } from '@/types/accounts';
import { accountService } from '@/features/accounts/services/accountService';
import {
  Moon,
  Clock,
  Calendar,
  AlertCircle,
  Calculator,
  Sparkles,
  Loader2,
  Bed,
  Check,
  LogIn,
  CreditCard,
  X,
  UserCheck,
  Tag,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePropertySelector } from '@/features/properties/hooks/usePropertySelector';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingInput, autoCheckIn?: boolean) => Promise<void>;
  preselectedRoomId?: string;
}

export function CreateBookingModal({ isOpen, onClose, onSubmit, preselectedRoomId }: CreateBookingModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPERADMIN' || user?.role === 'TENANT_ADMIN';
  const userAssignedPropId = (user as any)?.assignedPropertyId || (user as any)?.propertyId || (user as any)?.staffProfile?.propertyId;

  const { data: cachedProperties = [] } = usePropertySelector();

  // Mode selection
  const [bookingMode, setBookingMode] = useState<BookingMode>('NIGHTLY');

  // Rooms & Properties list
  const [properties, setProperties] = useState<Property[]>([]);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoomItem[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);

  // Guest details
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [cnicOrPassport, setCnicOrPassport] = useState<string>('');

  // Dynamic Room Rate State (Dynamic pricing per reservation)
  const [customNightlyRate, setCustomNightlyRate] = useState<number | null>(null);
  const [customHourlyRate, setCustomHourlyRate] = useState<number | null>(null);

  // Nightly state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrowStr);

  // Hourly state
  const [hourlyDate, setHourlyDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('14:00');
  const [durationHours, setDurationHours] = useState<number>(4);

  // Financials
  const [discountType, setDiscountType] = useState<DiscountType>('FLAT');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [customTotalAmount, setCustomTotalAmount] = useState<number | null>(null);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [paymentAccountId, setPaymentAccountId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittingAction, setSubmittingAction] = useState<'RESERVE' | 'CHECK_IN' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Manager Commission & Referrals
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedCommissionRecipientId, setSelectedCommissionRecipientId] = useState<string>('');
  const [commissionAmount, setCommissionAmount] = useState<number>(0);

  // Load properties list & set initial property selection via cached selector
  useEffect(() => {
    if (isOpen) {
      const propsList = cachedProperties as Property[];
      setProperties(propsList);
      if (!isAdmin && userAssignedPropId) {
        setSelectedPropertyId(String(userAssignedPropId));
      } else if (propsList.length > 0) {
        setSelectedPropertyId(String(propsList[0].id));
      }

      // Fetch active staff for commission agent dropdown
      staffService.getStaff({ page_size: 100 }).then((res) => {
        setStaffMembers(res.items.filter((s) => s.is_active !== false));
      }).catch(() => {
        setStaffMembers([]);
      });
    } else {
      setDiscountValue(0);
      setSelectedCommissionRecipientId('');
      setCommissionAmount(0);
      setPaymentAccountId('');
    }
  }, [isOpen, cachedProperties, isAdmin, userAssignedPropId]);

  // Fetch payment accounts based on property
  useEffect(() => {
    if (isOpen && selectedPropertyId) {
      accountService.getPaymentAccounts(undefined, selectedPropertyId).then((accs) => {
        const active = accs.filter((a) => a.is_active);
        setPaymentAccounts(active);
        const defAcc = active.find((a) => a.is_default);
        if (defAcc) setPaymentAccountId(String(defAcc.id));
        else if (active.length > 0) setPaymentAccountId(String(active[0].id));
      });
    }
  }, [isOpen, selectedPropertyId]);

  // Fetch available rooms on-demand whenever selectedPropertyId changes
  useEffect(() => {
    const fetchAvailable = async () => {
      if (!isOpen || !selectedPropertyId) return;
      setIsLoadingRooms(true);
      try {
        const rawAvail = await roomService.getAvailableRooms(selectedPropertyId);
        const availList = rawAvail.filter((r) => {
          const hk = String((r as any).housekeepingStatus || (r as any).housekeeping_status || 'CLEAN').toUpperCase();
          return hk !== 'DIRTY' && hk !== 'DIRTY_ROOM' && hk !== 'IN_PROGRESS' && hk !== 'CLEANING';
        });
        setAvailableRooms(availList);

        if (preselectedRoomId) {
          const matched = availList.find((r) => String(r.id) === String(preselectedRoomId));
          if (matched) {
            setSelectedRoomId(String(matched.id));
          } else if (availList.length > 0) {
            setSelectedRoomId(String(availList[0].id));
          }
        } else if (availList.length > 0) {
          setSelectedRoomId(String(availList[0].id));
        } else {
          setSelectedRoomId('');
        }
      } catch {
        setAvailableRooms([]);
        setSelectedRoomId('');
      } finally {
        setIsLoadingRooms(false);
      }
    };
    fetchAvailable();
  }, [isOpen, selectedPropertyId, preselectedRoomId]);

  // Currently selected room object
  const selectedRoom = useMemo(() => {
    return availableRooms.find((r) => String(r.id) === String(selectedRoomId)) || availableRooms[0] || null;
  }, [availableRooms, selectedRoomId]);

  // Update dynamic rate suggestion when room changes
  useEffect(() => {
    if (selectedRoom) {
      if (selectedRoom.basePrice && selectedRoom.basePrice > 0) {
        setCustomNightlyRate(selectedRoom.basePrice);
      } else if (customNightlyRate === null) {
        setCustomNightlyRate(5000);
      }
      if (selectedRoom.hourlyRate && selectedRoom.hourlyRate > 0) {
        setCustomHourlyRate(selectedRoom.hourlyRate);
      } else if (customHourlyRate === null) {
        setCustomHourlyRate(1000);
      }
    }
  }, [selectedRoom]);

  // Hourly end time auto-calculation
  const calculatedEndTime = useMemo(() => {
    if (!startTime) return '18:00';
    const [hStr, mStr] = startTime.split(':');
    let h = parseInt(hStr || '14', 10);
    const m = parseInt(mStr || '0', 10);
    h = (h + durationHours) % 24;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }, [startTime, durationHours]);

  // Nightly nights count calculation
  const totalNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    return Math.max(1, diff);
  }, [checkInDate, checkOutDate]);

  // Dynamic pricing calculation
  const effectiveNightlyRate = customNightlyRate !== null ? customNightlyRate : (selectedRoom?.basePrice || 5000);
  const effectiveHourlyRate = customHourlyRate !== null ? customHourlyRate : (selectedRoom?.hourlyRate || 1000);

  const subtotalAmount = useMemo(() => {
    if (bookingMode === 'HOURLY') {
      return durationHours * effectiveHourlyRate;
    }
    return totalNights * effectiveNightlyRate;
  }, [bookingMode, durationHours, effectiveHourlyRate, totalNights, effectiveNightlyRate]);

  const discountAmount = useMemo(() => {
    if (discountType === 'PERCENTAGE') {
      return Math.round(subtotalAmount * (discountValue / 100));
    }
    return Math.min(subtotalAmount, discountValue);
  }, [subtotalAmount, discountType, discountValue]);

  const netSubtotal = useMemo(() => {
    return Math.max(0, subtotalAmount - discountAmount);
  }, [subtotalAmount, discountAmount]);

  const taxAmount = useMemo(() => {
    return Math.round(netSubtotal * (taxRate / 100));
  }, [netSubtotal, taxRate]);

  const calculatedTotalAmount = useMemo(() => {
    return netSubtotal + taxAmount;
  }, [netSubtotal, taxAmount]);

  const finalTotalAmount = customTotalAmount !== null ? customTotalAmount : calculatedTotalAmount;
  const remainingBalance = Math.max(0, finalTotalAmount - initialPayment);

  const canInstantCheckIn = bookingMode === 'NIGHTLY' ? checkInDate === todayStr : hourlyDate === todayStr;

  if (!isOpen) return null;

  // Form submit handler supporting both "Create Reservation" and "Instant Check-In"
  const handleFormSubmit = async (e: React.FormEvent, autoCheckIn = false) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestName.trim()) {
      setErrorMsg('Guest full name is required.');
      return;
    }
    if (!selectedRoomId) {
      setErrorMsg('Please select a room unit.');
      return;
    }
    if (discountValue > subtotalAmount) {
      setErrorMsg(`Discount amount (${formatPKR(discountValue)}) cannot exceed Gross Room Total (${formatPKR(subtotalAmount)}).`);
      return;
    }

    setIsSubmitting(true);
    setSubmittingAction(autoCheckIn ? 'CHECK_IN' : 'RESERVE');

    let checkInISO = '';
    let checkOutISO = '';
    let durationLabel = '';

    if (bookingMode === 'HOURLY') {
      const [startH, startM] = startTime.split(':');
      const startDt = new Date(`${hourlyDate}T${startH}:${startM}:00`);
      const endDt = new Date(startDt.getTime() + durationHours * 3600 * 1000);

      checkInISO = startDt.toISOString();
      checkOutISO = endDt.toISOString();
      durationLabel = `${durationHours} Hours`;
    } else {
      const startDt = new Date(`${checkInDate}T14:00:00`);
      const endDt = new Date(`${checkOutDate}T12:00:00`);

      checkInISO = startDt.toISOString();
      checkOutISO = endDt.toISOString();
      durationLabel = `${totalNights} Night${totalNights > 1 ? 's' : ''}`;
    }

    const cleanPayload: CreateBookingInput = {
      property: isNaN(Number(selectedPropertyId)) ? selectedPropertyId : Number(selectedPropertyId),
      room: isNaN(Number(selectedRoomId)) ? selectedRoomId : Number(selectedRoomId),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || undefined,
      guestPhone: guestPhone.trim() || 'N/A', // Phone number is optional now
      cnicOrPassport: cnicOrPassport.trim() || undefined,
      bookingType: bookingMode,
      checkIn: checkInISO,
      checkOut: checkOutISO,
      totalDuration: durationLabel,
      rateApplied: bookingMode === 'HOURLY' ? effectiveHourlyRate : effectiveNightlyRate,
      subtotalAmount: subtotalAmount,
      discountType: discountType,
      discountValue: discountValue,
      discountAmount: discountAmount,
      commissionRecipient: selectedCommissionRecipientId ? (isNaN(Number(selectedCommissionRecipientId)) ? selectedCommissionRecipientId : Number(selectedCommissionRecipientId)) : undefined,
      commissionAmount: commissionAmount > 0 ? commissionAmount : 0,
      taxRate: taxRate,
      totalAmount: finalTotalAmount,
      paidAmount: initialPayment,
      paymentMethod: initialPayment > 0 ? paymentMethod : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(cleanPayload, autoCheckIn);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create reservation.');
    } finally {
      setIsSubmitting(false);
      setSubmittingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 md:px-6 md:py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">New Guest Reservation</h2>
                {preselectedRoomId && selectedRoom && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Pre-selected Room
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">Create reservation or perform instant check-in</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Form Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4">
            {/* Locked Room Metadata Banner (If triggered via Room Card Click) */}
            {preselectedRoomId && selectedRoom && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 flex items-center justify-between font-medium shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold shrink-0">
                    <Bed className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm font-mono text-slate-900">Room #{selectedRoom.roomNumber}</span>
                      <span className="text-[10px] font-bold bg-white text-indigo-900 px-2 py-0.5 rounded-md border border-indigo-200">
                        {selectedRoom.floor ? `Fl ${selectedRoom.floor}` : 'Fl 1'}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 font-medium">{selectedRoom.roomTypeName || 'Standard Room'}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold bg-indigo-900 text-white px-2.5 py-1 rounded-lg shrink-0">
                  Target Room
                </span>
              </div>
            )}

            {/* Top Segmented Booking Mode Selector */}
            <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setBookingMode('NIGHTLY');
                  setCustomTotalAmount(null);
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
                  bookingMode === 'NIGHTLY'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                )}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Nightly Stay (Per Day)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingMode('HOURLY');
                  setCustomTotalAmount(null);
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
                  bookingMode === 'HOURLY'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Hourly / Short Stay</span>
              </button>
            </div>

            {/* Guest Information */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Guest Full Name *</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Arthur Morgan"
                  className="text-xs h-9 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Mobile Phone / WhatsApp <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="text-xs h-9 font-mono bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@gmail.com"
                    className="text-xs h-9 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">CNIC / Passport Number (Optional)</label>
                <Input
                  value={cnicOrPassport}
                  onChange={(e) => setCnicOrPassport(e.target.value)}
                  placeholder="42101-1234567-1"
                  className="text-xs h-9 font-mono bg-white"
                />
              </div>
            </div>

            {/* Property & Room Selection (If not preselected) */}
            {!preselectedRoomId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Property *</span>
                    {!isAdmin && <span className="text-[10px] text-slate-400 font-normal">(Assigned)</span>}
                  </label>
                  <select
                    value={selectedPropertyId}
                    disabled={!isAdmin && properties.length <= 1}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Available Room *</span>
                    {isLoadingRooms && <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />}
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {availableRooms.length === 0 ? (
                      <option value="">No available rooms in property</option>
                    ) : (
                      availableRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Room {r.roomNumber} — {r.roomTypeName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Dynamic Pricing Rate Input & Stay Controls */}
            {bookingMode === 'NIGHTLY' ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Nightly Stay Schedule & Pricing</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Check-In Date</label>
                    <Input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="text-xs h-8.5 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Check-Out Date</label>
                    <Input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="text-xs h-8.5 bg-white"
                    />
                  </div>
                </div>

                {/* Dynamic Rate per Night Input */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                    <span>Rate per Night (PKR) *</span>
                    <span className="text-[10px] text-indigo-600 font-medium">(Receptionist Entered)</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={effectiveNightlyRate}
                    onChange={(e) => {
                      setCustomNightlyRate(parseFloat(e.target.value) || 0);
                      setCustomTotalAmount(null);
                    }}
                    placeholder="e.g. 5000"
                    className="text-xs font-mono font-bold text-slate-900 h-8.5 bg-white"
                    required
                  />
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Estimated Room Subtotal:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {totalNights} night{totalNights > 1 ? 's' : ''} × {formatPKR(effectiveNightlyRate)} = {formatPKR(subtotalAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Hourly Short Stay Schedule & Pricing</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Stay Date</label>
                    <Input
                      type="date"
                      value={hourlyDate}
                      onChange={(e) => setHourlyDate(e.target.value)}
                      className="text-xs h-8.5 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Start Time</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="text-xs h-8.5 bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Dynamic Hourly Rate & Duration Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Duration (Hours) *</label>
                    <Input
                      type="number"
                      min={1}
                      max={72}
                      value={durationHours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setDurationHours(isNaN(val) || val < 1 ? 1 : val);
                        setCustomTotalAmount(null);
                      }}
                      className="text-xs h-8.5 font-mono font-bold text-slate-900 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Hourly Rate (PKR) *</label>
                    <Input
                      type="number"
                      min="0"
                      value={effectiveHourlyRate}
                      onChange={(e) => {
                        setCustomHourlyRate(parseFloat(e.target.value) || 0);
                        setCustomTotalAmount(null);
                      }}
                      placeholder="e.g. 1000"
                      className="text-xs font-mono font-bold text-slate-900 h-8.5 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Calculated Check-Out:</span>
                  <span className="font-bold text-indigo-900 font-mono">{calculatedEndTime}</span>
                </div>
              </div>
            )}

            {/* Live Summary Badge */}
            <div className="rounded-2xl bg-indigo-50/90 border border-indigo-200/80 p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-600" />
                  Live Booking Summary
                </div>
                <div className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                  {bookingMode === 'NIGHTLY' ? (
                    <>
                      <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>{formatDate(checkInDate)} – {formatDate(checkOutDate)} ({totalNights} Night{totalNights > 1 ? 's' : ''})</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>{formatDate(hourlyDate)}, {startTime} – {calculatedEndTime} ({durationHours} Hours)</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-indigo-700 font-medium">Computed Total</div>
                <div className="text-sm font-black text-indigo-900 font-mono">
                  {formatPKR(finalTotalAmount)}
                </div>
              </div>
            </div>

            {/* Financials & Billing Section */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-indigo-600" />
                <span>Billing, Discounts & Advance Payment</span>
              </div>

              {/* Discounts & Manager Referrals Section */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1 text-indigo-900">
                    <Tag className="h-3.5 w-3.5 text-indigo-600" /> Discounts & Referrals
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </div>

                {/* Discount (PKR) Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Discount Amount (PKR)
                    </label>
                    {discountValue > subtotalAmount && (
                      <span className="text-[10px] text-rose-600 font-semibold">
                        Cannot exceed Gross Room Total ({formatPKR(subtotalAmount)})
                      </span>
                    )}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max={subtotalAmount}
                    value={discountValue || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDiscountValue(val);
                      setCustomTotalAmount(null);
                    }}
                    placeholder="e.g. 500"
                    className={cn(
                      "text-xs font-mono h-8.5 bg-slate-50/50",
                      discountValue > subtotalAmount ? "border-rose-400 focus:ring-rose-500 bg-rose-50/50" : ""
                    )}
                  />
                </div>

                {/* Dynamic Breakdown when Discount is applied */}
                {discountAmount > 0 && discountAmount <= subtotalAmount && (
                  <div className="p-2 rounded-xl bg-indigo-50/80 border border-indigo-200 text-[11px] flex items-center justify-between font-medium text-indigo-950">
                    <span>Gross Total: {formatPKR(subtotalAmount)} − Discount: {formatPKR(discountAmount)}</span>
                    <span className="font-bold font-mono text-indigo-900">Net Total: {formatPKR(netSubtotal)}</span>
                  </div>
                )}

                {/* Manager Commission / Referral Selection */}
                <div className="pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <Users className="h-3 w-3 text-indigo-600" /> Referred By / Commission Agent
                    </label>
                    <select
                      value={selectedCommissionRecipientId}
                      onChange={(e) => setSelectedCommissionRecipientId(e.target.value)}
                      className="w-full h-8.5 rounded-md border border-slate-200 bg-slate-50/50 px-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Select Responsible Manager / Agent</option>
                      {staffMembers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.position || 'Staff'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Total & Advance Payment */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Grand Total (PKR) *</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Editable)</span>
                  </label>
                  <Input
                    type="number"
                    value={finalTotalAmount}
                    onChange={(e) => setCustomTotalAmount(parseFloat(e.target.value) || 0)}
                    className="text-xs font-mono font-bold text-slate-900 h-9 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Advance Received (PKR)</label>
                  <Input
                    type="number"
                    min="0"
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="text-xs font-mono h-9 bg-white"
                  />
                </div>
              </div>

              {/* Payment Method selector if advance payment > 0 */}
              {initialPayment > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-indigo-600" /> Advance Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={cn(
                          'py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center',
                          paymentMethod === 'cash'
                            ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={cn(
                          'py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center',
                          paymentMethod === 'card'
                            ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={cn(
                          'py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center',
                          paymentMethod === 'bank_transfer'
                            ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        Bank Transfer
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Deposit To Account</label>
                    <select
                      value={paymentAccountId}
                      onChange={(e) => setPaymentAccountId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {paymentAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} [{(a.propertyName || a.property_name) ? (a.propertyName || a.property_name) : 'Global'}] — Balance: PKR {Number(a.current_balance !== undefined ? a.current_balance : (a.currentBalance !== undefined ? a.currentBalance : 0)).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs mt-2">
                <span className="font-semibold text-slate-700">Remaining Balance Due:</span>
                <span className={cn('font-mono font-bold text-sm', remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700')}>
                  {formatPKR(remainingBalance)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Notes / Special Requests (Optional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Late arrival, ground floor requested"
                className="text-xs h-9 bg-white"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer Actions: Dual Submission Actions */}
        <div className="p-4 md:px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs font-semibold cursor-pointer">
            Cancel
          </Button>

          {/* Action 1: Create Reservation (Status RESERVED) */}
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={(e) => handleFormSubmit(e, false)}
            className="h-9 px-4 text-xs bg-indigo-900 text-white hover:bg-indigo-950 font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting && submittingAction === 'RESERVE' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Reserving...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Create Reservation</span>
              </>
            )}
          </Button>

          {/* Action 2: Instant Check-In (Status CHECKED_IN / OCCUPIED) */}
          {canInstantCheckIn && (
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={(e) => handleFormSubmit(e, true)}
              className="h-9 px-4 text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && submittingAction === 'CHECK_IN' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Checking in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Instant Check-In</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
