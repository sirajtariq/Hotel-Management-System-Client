import { Badge } from '@/components/ui/badge';
import { BookingStatus, PaymentStatus } from '@/types/bookings';
import { STATUS_STYLE_MAP } from '@/lib/formatters';

interface BookingStatusBadgeProps {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

export function BookingStatusBadge({ status, paymentStatus }: BookingStatusBadgeProps) {
  if (status) {
    const style = STATUS_STYLE_MAP[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <Badge className={`${style} capitalize text-[10px] font-medium`}>
        {(status || '').replace('_', ' ')}
      </Badge>

    );
  }

  if (paymentStatus) {
    const style = STATUS_STYLE_MAP[paymentStatus] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <Badge className={`${style} uppercase text-[9px] font-semibold tracking-wider`}>
        {paymentStatus}
      </Badge>
    );
  }

  return null;
}
