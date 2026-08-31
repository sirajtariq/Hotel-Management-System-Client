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
  hourlyRate?: number;
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
  property?: number | string;
  property_id?: number | string;
  propertyId?: string | number;
  room_type?: number | string;
  room_type_id?: number | string;
  roomTypeId?: number | string;
  roomType?: number | string;
  roomNumber: string;
  room_number?: string;
  floor: number | string;
  type?: RoomType;
  basePrice?: number;
  basePricePerNight?: number;
  base_price?: number;
  hourlyRate?: number;
  hourly_rate?: number;
  isHourlyAllowed?: boolean;
  is_hourly_allowed?: boolean;
  capacity?: number;
  max_occupancy?: number;
  amenities?: string[];
  status?: RoomStatus;
  housekeepingStatus?: HousekeepingStatus;
  housekeeping_status?: HousekeepingStatus;
}
