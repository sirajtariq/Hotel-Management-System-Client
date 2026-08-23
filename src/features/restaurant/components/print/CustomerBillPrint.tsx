import { ReceiptData } from '../../services/restaurantService';

interface CustomerBillPrintProps {
  receipt: ReceiptData;
}

export function CustomerBillPrint({ receipt }: CustomerBillPrintProps) {
  const { header, order, financials, items, notes } = receipt;

  return (
    <div className="bill-print-container w-[80mm] p-4 bg-white text-black font-sans text-xs leading-snug mx-auto border border-slate-300">
      <div className="text-center font-bold text-sm uppercase tracking-wide">
        {header.tenant_name}
      </div>
      <div className="text-center font-semibold text-[11px] mb-1">
        {header.property_name}
      </div>
      {header.property_address && <div className="text-center text-[10px] text-slate-600">{header.property_address}</div>}
      {header.property_phone && <div className="text-center text-[10px] text-slate-600">Tel: {header.property_phone}</div>}

      <div className="text-center font-bold text-xs uppercase my-2 border-t border-b border-slate-900 py-1">
        RESTAURANT TAX INVOICE
      </div>

      <div className="text-[10px] space-y-0.5 mb-2">
        <div className="flex justify-between font-semibold">
          <span>Order #: {order.order_number}</span>
          <span>{order.order_type}</span>
        </div>
        {order.table_number && <div>Table #: {order.table_number}</div>}
        {order.room_number && <div>Room #: {order.room_number}</div>}
        {order.customer_name && <div>Guest: {order.customer_name}</div>}
        <div>Date: {order.created_at}</div>
        <div>Payment Mode: {order.payment_method || 'CASH'} ({order.payment_status})</div>
      </div>

      <div className="border-t border-b border-slate-900 py-1 my-2">
        <div className="flex justify-between font-bold text-[11px] border-b border-slate-900 pb-1 mb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/6 text-center">Qty</span>
          <span className="w-1/3 text-right">Price</span>
        </div>

        <div className="space-y-1 text-[11px]">
          {items.map((item) => (
            <div key={item.id}>
              <div className="flex justify-between font-semibold">
                <span className="w-1/2 truncate">{item.item_name}</span>
                <span className="w-1/6 text-center">{item.quantity}</span>
                <span className="w-1/3 text-right">{Number(item.total_price).toLocaleString()}</span>
              </div>
              {item.variation_name && (
                <div className="text-[9px] text-slate-600 pl-2">Variant: {item.variation_name}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1 text-[11px] font-semibold border-b border-slate-900 pb-2 mb-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>PKR {Number(financials.subtotal).toLocaleString()}</span>
        </div>
        {Number(financials.discount_amount) > 0 && (
          <div className="flex justify-between text-slate-700">
            <span>Discount ({financials.discount_type}):</span>
            <span>- PKR {Number(financials.discount_amount).toLocaleString()}</span>
          </div>
        )}
        {Number(financials.tax_amount) > 0 && (
          <div className="flex justify-between">
            <span>GST Tax ({financials.tax_percentage}%):</span>
            <span>+ PKR {Number(financials.tax_amount).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-900">
          <span>Grand Total:</span>
          <span>PKR {Number(financials.grand_total).toLocaleString()}</span>
        </div>
      </div>

      {notes && <div className="text-[10px] italic mb-2">Note: {notes}</div>}

      <div className="text-center text-[10px] font-semibold mt-3">
        Thank You For Dining With Us
      </div>
    </div>
  );
}
