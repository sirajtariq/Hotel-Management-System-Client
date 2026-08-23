import { CreateBookingModal } from './CreateBookingModal';
import { CreateBookingInput } from '@/types/bookings';

interface BookingFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingInput) => Promise<void>;
  preselectedRoomId?: string;
}

export function BookingFormDrawer({ isOpen, onClose, onSubmit, preselectedRoomId }: BookingFormDrawerProps) {
  return (
    <CreateBookingModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      preselectedRoomId={preselectedRoomId}
    />
  );
}

