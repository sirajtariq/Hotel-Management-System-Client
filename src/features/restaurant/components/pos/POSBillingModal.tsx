import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Building, Tag, Percent, Loader2 } from 'lucide-react';
import { PaymentAccount } from '@/types/accounts';
import { accountService } from '@/features/accounts/services/accountService';

interface POSBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discountType: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  taxPercentage: number;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  onUpdateBilling: (data: {
    discountType: 'FLAT' | 'PERCENTAGE';
    discountValue: number;
    taxPercentage: number;
    paymentMethod: string;
    customerName: string;
    customerPhone: string;
  }) => void;
  onConfirmOrder: (paymentStatus: 'UNPAID' | 'PAID' | 'BILLED_TO_ROOM') => void;
}

export function POSBillingModal({
  isOpen,
  onClose,
  subtotal,
  discountType: initDiscType,
  discountValue: initDiscVal,
  taxPercentage: initTaxPct,
  paymentMethod: initPaymentMethod,
  customerName: initName,
  customerPhone: initPhone,
  onUpdateBilling,
  onConfirmOrder,
}: POSBillingModalProps) {
  const [discType, setDiscType] = useState<'FLAT' | 'PERCENTAGE'>(initDiscType);
  const [discVal, setDiscVal] = useState<number>(initDiscVal);
  const [taxPct, setTaxPct] = useState<number>(initTaxPct);
  const [payMethod, setPayMethod] = useState<string>(initPaymentMethod || 'CASH');
  const [custName, setCustName] = useState<string>(initName);
  const [custPhone, setCustPhone] = useState<string>(initPhone);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      accountService.getPaymentAccounts().then((accs) => {
        const active = accs.filter((a) => (a.isActive ?? a.is_active));
        setPaymentAccounts(active);
        const defAcc = active.find((a) => (a.isDefault ?? a.is_default));
        if (defAcc) setSelectedAccountId(defAcc.id);
        else if (active.length > 0) setSelectedAccountId(active[0].id);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate local breakdown
  const discountAmount =
    discType === 'PERCENTAGE' ? (subtotal * discVal) / 100 : Math.min(discVal, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * taxPct) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleApplyAndConfirm = async (status: 'UNPAID' | 'PAID' | 'BILLED_TO_ROOM') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      onUpdateBilling({
        discountType: discType,
        discountValue: discVal,
        taxPercentage: taxPct,
        paymentMethod: payMethod,
        customerName: custName,
        customerPhone: custPhone,
      });
      await onConfirmOrder(status);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentModes = [
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'ROOM_FOLIO', label: 'Bill to Room', icon: Building },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Billing & Payment Setup</h2>
            <p className="text-xs text-slate-500">Configure discounts, GST tax %, and payment method</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Guest / Customer Name
              </label>
              <input
                type="text"
                placeholder="Walk-in Guest"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+92 300 0000000"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Discount Setup */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Discount Adjustment
            </label>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDiscType('FLAT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    discType === 'FLAT' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Tag className="h-3 w-3 inline mr-1" />
                  FLAT (PKR)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscType('PERCENTAGE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    discType === 'PERCENTAGE' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Percent className="h-3 w-3 inline mr-1" />
                  % OFF
                </button>
              </div>

              <input
                type="number"
                min="0"
                step="any"
                value={discVal}
                onChange={(e) => setDiscVal(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* GST Tax % */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tax / GST Rate (%)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={taxPct}
              onChange={(e) => setTaxPct(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentModes.map((mode) => {
                const Icon = mode.icon;
                const isSel = payMethod === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPayMethod(mode.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                      isSel
                        ? 'border-indigo-900 bg-indigo-50 text-indigo-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deposit Account */}
          {payMethod !== 'ROOM_FOLIO' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Deposit To Payment Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {paymentAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.account_type}) — Balance: PKR {a.current_balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Financial summary box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">PKR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({discType === 'PERCENTAGE' ? `${discVal}%` : 'FLAT'}):</span>
                <span className="font-semibold">- PKR {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST Tax ({taxPct}%):</span>
                <span className="font-semibold">+ PKR {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="text-indigo-900">PKR {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleApplyAndConfirm('UNPAID')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save as Unpaid
          </button>

          {payMethod === 'ROOM_FOLIO' ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleApplyAndConfirm('BILLED_TO_ROOM')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Posting...' : 'Post to Room Folio'}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleApplyAndConfirm('PAID')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Processing...' : 'Pay Now & Complete'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
