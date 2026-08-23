export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE' | 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
export type HousekeepingStatus = 'CLEAN' | 'DIRTY' | 'IN_PROGRESS' | 'INSPECTED' | 'clean' | 'dirty' | 'in_progress' | 'inspected';
export type RoomType = 'single' | 'double' | 'deluxe' | 'suite' | 'penthouse' | 'studio_apartment' | string;

export interface Room {
  id: string;
  propertyId: string;
  propertyName?: string;
  roomNumber: string;
  floor: number | string;
  room_type_name: string;
  base_price: number;
  hourly_rate?: number;
  is_hourly_allowed?: boolean;
  type?: RoomType;
  basePricePerNight?: number;
  status: RoomStatus;
  housekeeping_status: HousekeepingStatus;
  current_guest_name?: string | null;
  active_booking_id?: string | number | null;
  capacity?: number;
  amenities?: string[];
  lastCleanedAt?: string;
  assignedHousekeeper?: string;
}

export interface CreateRoomInput {
  propertyId: string;
  roomNumber: string;
  floor: number | string;
  type: RoomType;
  basePricePerNight: number;
  capacity: number;
  amenities: string[];
}

