import React, { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateBookingInput, BookingMode, DiscountType } from '@/types/bookings';
import { roomService } from '@/features/rooms/services/roomService';
import { propertyService } from '@/features/properties/services/propertyService';
import { Room } from '@/types/rooms';
import { Property } from '@/types/properties';
import { formatPKR, formatDate } from '@/lib/formatters';
import { Moon, Clock, Calendar, Check, AlertCircle, Calculator, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingInput) => Promise<void>;
  preselectedRoomId?: string;
}

export function CreateBookingModal({ isOpen, onClose, onSubmit, preselectedRoomId }: CreateBookingModalProps) {
  // Mode selection
  const [bookingMode, setBookingMode] = useState<BookingMode>('NIGHTLY');

  // Rooms & Properties list
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('prop_01');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  // Guest details
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [cnicOrPassport, setCnicOrPassport] = useState<string>('');

  // Nightly state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrowStr);

  // Hourly state
  const [hourlyDate, setHourlyDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('14:00');
  const [durationHours, setDurationHours] = useState<number>(4);
  const [customHours, setCustomHours] = useState<string>('4');

  // Financials
  const [discountType, setDiscountType] = useState<DiscountType>('FLAT');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [customTotalAmount, setCustomTotalAmount] = useState<number | null>(null);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Load properties and rooms
  useEffect(() => {
    const loadInitData = async () => {
      try {
        const [propsList, roomsList] = await Promise.all([
          propertyService.getProperties(),
          roomService.getRooms(),
        ]);
        setProperties(propsList);
        setRooms(roomsList);

        if (preselectedRoomId) {
          const matched = roomsList.find((r) => r.id === preselectedRoomId);
          if (matched) {
            setSelectedRoomId(matched.id);
            setSelectedPropertyId(matched.propertyId);
          }
        } else if (roomsList.length > 0) {
          setSelectedRoomId(roomsList[0].id);
          setSelectedPropertyId(roomsList[0].propertyId);
        }
      } catch {
        // Fallback
      }
    };
    if (isOpen) {
      loadInitData();
    }
  }, [isOpen, preselectedRoomId]);

  // Currently selected room object
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;
  }, [rooms, selectedRoomId]);

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

  // Auto-computed Total, Subtotal, Discount, Tax & Rates
  const defaultNightlyRate = selectedRoom?.base_price || 15000;
  const defaultHourlyRate = selectedRoom?.hourly_rate || Math.round(defaultNightlyRate / 6);

  const subtotalAmount = useMemo(() => {
    if (bookingMode === 'HOURLY') {
      return durationHours * defaultHourlyRate;
    }
    return totalNights * defaultNightlyRate;
  }, [bookingMode, durationHours, defaultHourlyRate, totalNights, defaultNightlyRate]);

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

  // Form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestName.trim()) {
      setErrorMsg('Guest full name is required.');
      return;
    }
    if (!guestPhone.trim()) {
      setErrorMsg('Guest mobile phone is required.');
      return;
    }
    if (!selectedRoomId) {
      setErrorMsg('Please select a room unit.');
      return;
    }

    setIsSubmitting(true);

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
      propertyId: isNaN(Number(selectedPropertyId)) ? selectedPropertyId : Number(selectedPropertyId),
      property: isNaN(Number(selectedPropertyId)) ? selectedPropertyId : Number(selectedPropertyId),
      roomId: isNaN(Number(selectedRoomId)) ? selectedRoomId : Number(selectedRoomId),
      room: isNaN(Number(selectedRoomId)) ? selectedRoomId : Number(selectedRoomId),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || undefined,
      guestPhone: guestPhone.trim(),
      cnicOrPassport: cnicOrPassport.trim() || undefined,
      bookingType: bookingMode,
      checkIn: checkInISO,
      checkOut: checkOutISO,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalDuration: durationLabel,
      nightlyRate: bookingMode === 'NIGHTLY' ? defaultNightlyRate : undefined,
      rateApplied: bookingMode === 'HOURLY' ? defaultHourlyRate : defaultNightlyRate,
      subtotalAmount: subtotalAmount,
      discountType: discountType,
      discountValue: discountValue,
      discountAmount: discountAmount,
      taxRate: taxRate,
      taxAmount: taxAmount,
      totalAmount: finalTotalAmount,
      initialPayment: initialPayment,
      paidAmount: initialPayment,
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(cleanPayload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto p-6 bg-white">
        <SheetHeader className="pb-3 border-b border-slate-100">
          <SheetTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>New Guest Reservation</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Dual Mode
            </span>
          </SheetTitle>
        </SheetHeader>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs">
          {/* Top Segmented Booking Mode Selector */}
          <div className="bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setBookingMode('NIGHTLY');
                setCustomTotalAmount(null);
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
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
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
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
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mobile Phone *</label>
                <Input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <Input
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@gmail.com"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">CNIC / Passport Number</label>
              <Input
                value={cnicOrPassport}
                onChange={(e) => setCnicOrPassport(e.target.value)}
                placeholder="42101-1234567-1"
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          {/* Room Selection */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-slate-700">Room Unit Selection *</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} — {r.room_type_name} ({formatPKR(r.base_price)}/nt | {formatPKR(r.hourly_rate)}/hr)
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Mode Form Controls */}
          {bookingMode === 'NIGHTLY' ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                <span>Nightly Stay Schedule</span>
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
                  <span className="text-[10px] text-slate-400">Standard: 02:00 PM</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Check-Out Date</label>
                  <Input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="text-xs h-8.5 bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Standard: 12:00 PM</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Applied Rate:</span>
                <span className="font-bold text-slate-900 font-mono">{formatPKR(defaultNightlyRate)} / night</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>Hourly Short Stay Schedule</span>
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

              {/* Direct Custom Duration Input & Quick Select Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Stay Duration (Hours) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Enter custom duration or select preset</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={72}
                    value={durationHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setDurationHours(isNaN(val) || val < 1 ? 1 : val);
                    }}
                    className="w-28 text-xs h-8.5 font-mono font-bold text-slate-900 bg-white"
                  />
                  
                  <div className="flex flex-wrap items-center gap-1">
                    {[1, 2, 3, 4, 6, 8, 12].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDurationHours(h)}
                        className={cn(
                          'px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer',
                          durationHours === h
                            ? 'bg-indigo-900 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Calculated Check-Out:</span>
                <span className="font-bold text-indigo-900 font-mono">{calculatedEndTime}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Hourly Rate:</span>
                <span className="font-bold text-slate-900 font-mono">{formatPKR(defaultHourlyRate)} / hr</span>
              </div>
            </div>
          )}

          {/* Live Summary Badge */}
          <div className="rounded-xl bg-indigo-50/90 border border-indigo-200/80 p-3.5 flex items-center justify-between">
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
              <div className="text-[10px] text-indigo-700 font-medium">Auto Computed</div>
              <div className="text-sm font-black text-indigo-900 font-mono">
                {formatPKR(finalTotalAmount)}
              </div>
            </div>
          </div>

          {/* Financials & Manual Override */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5 text-indigo-600" />
              <span>Billing, Discount & Tax Ledger</span>
            </div>

            {/* Discount Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Discount</span>
                  <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDiscountType('FLAT')}
                      className={cn('px-1.5 py-0.5 rounded font-semibold cursor-pointer', discountType === 'FLAT' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-600')}
                    >
                      PKR
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('PERCENTAGE')}
                      className={cn('px-1.5 py-0.5 rounded font-semibold cursor-pointer', discountType === 'PERCENTAGE' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-600')}
                    >
                      %
                    </button>
                  </div>
                </label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    placeholder={discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 1000'}
                    className="text-xs font-mono font-bold text-slate-900 h-8.5 bg-white"
                  />
                  <div className="flex items-center gap-1">
                    {discountType === 'PERCENTAGE'
                      ? [0, 5, 10, 15, 20].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDiscountValue(val)}
                            className={cn(
                              'px-1.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer',
                              discountValue === val
                                ? 'bg-indigo-900 text-white shadow-2xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            )}
                          >
                            {val}%
                          </button>
                        ))
                      : [0, 500, 1000, 2000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDiscountValue(val)}
                            className={cn(
                              'px-1.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer',
                              discountValue === val
                                ? 'bg-indigo-900 text-white shadow-2xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            )}
                          >
                            {val >= 1000 ? `${val / 1000}k` : val}
                          </button>
                        ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Applied Discount Amount</label>
                <div className="h-8.5 px-3 rounded-md bg-emerald-50 border border-emerald-200 flex items-center font-mono font-semibold text-emerald-800 text-xs">
                  -{formatPKR(discountAmount)} {discountType === 'PERCENTAGE' && discountValue > 0 ? `(${discountValue}%)` : ''}
                </div>
              </div>
            </div>

            {/* Tax Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Tax Rate (%)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Manual Input</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 15"
                    className="text-xs font-mono font-bold text-slate-900 h-8.5 bg-white"
                  />
                  <div className="flex items-center gap-1">
                    {[0, 5, 15, 16].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setTaxRate(rate)}
                        className={cn(
                          'px-1.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer',
                          taxRate === rate
                            ? 'bg-indigo-900 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Calculated Tax Amount</label>
                <div className="h-8.5 px-3 rounded-md bg-white border border-slate-200 flex items-center font-mono font-semibold text-slate-800 text-xs">
                  +{formatPKR(taxAmount)} ({taxRate}%)
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-3">
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
                <label className="text-xs font-semibold text-slate-700">Advance / Deposit Paid</label>
                <Input
                  type="number"
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono h-9 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
              <span>Base Subtotal: <strong className="text-slate-900 font-mono">{formatPKR(subtotalAmount)}</strong></span>
              {discountAmount > 0 && <span>Discount: <strong className="text-emerald-700 font-mono">-{formatPKR(discountAmount)}</strong></span>}
              {taxAmount > 0 && <span>Tax ({taxRate}%): <strong className="text-slate-900 font-mono">+{formatPKR(taxAmount)}</strong></span>}
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Remaining Due Balance:</span>
            <span className={cn('font-mono font-bold text-sm', remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700')}>
              {formatPKR(remainingBalance)}
            </span>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Reservation Notes / Special Instructions</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Late arrival, extra towel requested"
              className="text-xs h-9"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 px-5 text-xs bg-indigo-900 text-white hover:bg-indigo-950 font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Confirming Reservation...</span>
                </>
              ) : (
                <span>Confirm Reservation</span>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
