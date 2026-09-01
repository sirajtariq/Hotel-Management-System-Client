import { ReceiptData } from '../../services/restaurantService';

interface KitchenReceiptPrintProps {
  receipt: ReceiptData;
  onClose?: () => void;
}

export function KitchenReceiptPrint({ receipt }: KitchenReceiptPrintProps) {
  const { header, order, items, notes } = receipt;

  return (
    <div className="kot-print-container w-[80mm] p-4 bg-white text-black font-sans text-xs leading-snug mx-auto border border-slate-300">
      <div className="text-center font-bold text-sm uppercase tracking-wide mb-1">
        KITCHEN ORDER TICKET (KOT)
      </div>
      <div className="text-center text-[10px] text-slate-700 mb-2">
        {header.tenant_name} - {header.property_name}
      </div>

      <div className="border-t border-b border-slate-900 py-1 my-2 text-[11px] space-y-0.5">
        <div className="flex justify-between font-semibold">
          <span>KOT #: {order.order_number}</span>
          <span>{order.order_type}</span>
        </div>
        {order.table_number && <div>Table #: <span className="font-bold">{order.table_number}</span></div>}
        {order.room_number && <div>Room #: <span className="font-bold">{order.room_number}</span></div>}
        {order.customer_name && <div>Guest: {order.customer_name}</div>}
        <div>Date/Time: {order.created_at}</div>
        <div>Staff: {order.created_by}</div>
      </div>

      <div className="my-2">
        <div className="flex justify-between font-bold border-b border-slate-900 pb-1 mb-1">
          <span>Quantity & Item</span>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="border-b border-slate-200 pb-1">
              <div className="font-bold text-xs flex justify-between">
                <span>{item.quantity} x {item.item_name}</span>
              </div>
              {item.variation_name && (
                <div className="text-[11px] font-medium pl-3 text-slate-700">Variant: {item.variation_name}</div>
              )}
              {item.special_instructions && (
                <div className="text-[10px] font-semibold italic pl-3 text-slate-900">
                  Note: {item.special_instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {notes && (
        <div className="border-t border-slate-900 pt-1 my-2 text-[10px] italic">
          Order Notes: {notes}
        </div>
      )}

      <div className="text-center border-t border-slate-900 pt-2 mt-3 font-semibold text-[10px]">
        Forward to Kitchen
      </div>
    </div>
  );
}
