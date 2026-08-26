import { apiClient } from '@/lib/axios';
import { Room, RoomStatus, HousekeepingStatus, CreateRoomInput } from '@/types/rooms';

export interface RoomTypeItem {
  id: string | number;
  name: string;
  code?: string;
  description?: string;
  baseRate: number;
  hourlyRate?: number;
  capacity: number;
}

const MOCK_ROOM_TYPES: RoomTypeItem[] = [
  { id: 'rt_1', name: 'Standard Single / Double', code: 'STD', description: 'Cozy room with single/double bed options, AC & high-speed Wi-Fi.', baseRate: 18000, hourlyRate: 4500, capacity: 2 },
  { id: 'rt_2', name: 'Deluxe King Room', code: 'DLX', description: 'Spacious deluxe room with King size bed, balcony and luxury amenities.', baseRate: 28000, hourlyRate: 7000, capacity: 2 },
  { id: 'rt_3', name: 'Executive Suite', code: 'EXEC', description: 'Premium suite with separate living area, work desk and executive lounge access.', baseRate: 45000, hourlyRate: 11250, capacity: 3 },
  { id: 'rt_4', name: 'Family Suite', code: 'FAM', description: '2-Bedroom suite designed for family stays with kitchenette & seating lounge.', baseRate: 52000, hourlyRate: 13000, capacity: 4 },
  { id: 'rt_5', name: 'Penthouse Suite', code: 'PENT', description: 'Luxury top-floor penthouse with private dip pool, butler service & panoramic views.', baseRate: 125000, hourlyRate: 30000, capacity: 6 },
];

const MOCK_ROOMS: Room[] = [
  // Floor 1
  {
    id: 'rm_101',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '101',
    floor: 1,
    room_type_name: 'Standard Single / Double',
    base_price: 18000,
    status: 'AVAILABLE',
    housekeeping_status: 'CLEAN',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'Single/Double Bed', 'TV'],
  },
  {
    id: 'rm_102',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '102',
    floor: 1,
    room_type_name: 'Deluxe King Room',
    base_price: 28000,
    status: 'OCCUPIED',
    housekeeping_status: 'CLEAN',
    current_guest_name: 'Arthur Morgan',
    active_booking_id: 'bk_1002',
    capacity: 2,
    amenities: ['WiFi', 'AC', 'King Bed', 'Balcony'],
  },
  {
    id: 'rm_103',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '103',
    floor: 1,
    room_type_name: 'Standard Single / Double',
    base_price: 18000,
    status: 'CLEANING',
    housekeeping_status: 'IN_PROGRESS',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 2,
    amenities: ['WiFi', 'AC'],
  },
  {
    id: 'rm_104',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '104',
    floor: 1,
    room_type_name: 'Executive Suite',
    base_price: 45000,
    status: 'RESERVED',
    housekeeping_status: 'INSPECTED',
    current_guest_name: 'Zainab Malik',
    active_booking_id: 'bk_1004',
    capacity: 3,
    amenities: ['WiFi', 'AC', 'Minibar', 'Suite Lounge'],
  },
  {
    id: 'rm_105',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '105',
    floor: 1,
    room_type_name: 'Deluxe King Room',
    base_price: 28000,
    status: 'MAINTENANCE',
    housekeeping_status: 'DIRTY',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'King Bed'],
  },
  {
    id: 'rm_106',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '106',
    floor: 1,
    room_type_name: 'Family Suite',
    base_price: 52000,
    status: 'AVAILABLE',
    housekeeping_status: 'INSPECTED',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 4,
    amenities: ['WiFi', 'AC', '2 Bedrooms', 'Living Room'],
  },

  // Floor 2
  {
    id: 'rm_201',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '201',
    floor: 2,
    room_type_name: 'Deluxe King Room',
    base_price: 32000,
    status: 'OCCUPIED',
    housekeeping_status: 'CLEAN',
    current_guest_name: 'Tariq Mahmood',
    active_booking_id: 'bk_2001',
    capacity: 2,
    amenities: ['WiFi', 'AC', 'Sea View', 'King Bed'],
  },
  {
    id: 'rm_202',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '202',
    floor: 2,
    room_type_name: 'Executive Suite',
    base_price: 48000,
    status: 'OCCUPIED',
    housekeeping_status: 'CLEAN',
    current_guest_name: 'Sarah Jenkins',
    active_booking_id: 'bk_2002',
    capacity: 3,
    amenities: ['WiFi', 'AC', 'Jacuzzi', 'Work Desk'],
  },
  {
    id: 'rm_203',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '203',
    floor: 2,
    room_type_name: 'Standard Single / Double',
    base_price: 20000,
    status: 'AVAILABLE',
    housekeeping_status: 'CLEAN',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 2,
    amenities: ['WiFi', 'AC'],
  },
  {
    id: 'rm_204',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '204',
    floor: 2,
    room_type_name: 'Standard Single / Double',
    base_price: 20000,
    status: 'CLEANING',
    housekeeping_status: 'DIRTY',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 2,
    amenities: ['WiFi', 'AC'],
  },
  {
    id: 'rm_205',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '205',
    floor: 2,
    room_type_name: 'Deluxe King Room',
    base_price: 32000,
    status: 'RESERVED',
    housekeeping_status: 'CLEAN',
    current_guest_name: 'Bilal Chaudhry',
    active_booking_id: 'bk_2005',
    capacity: 2,
    amenities: ['WiFi', 'AC', 'King Bed'],
  },
  {
    id: 'rm_206',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '206',
    floor: 2,
    room_type_name: 'Executive Suite',
    base_price: 48000,
    status: 'AVAILABLE',
    housekeeping_status: 'DIRTY',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 3,
    amenities: ['WiFi', 'AC', 'Executive Lounge Access'],
  },

  // Floor 3
  {
    id: 'rm_301',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '301',
    floor: 3,
    room_type_name: 'Penthouse Suite',
    base_price: 125000,
    status: 'OCCUPIED',
    housekeeping_status: 'CLEAN',
    current_guest_name: 'Dr. Usman Ali',
    active_booking_id: 'bk_3001',
    capacity: 6,
    amenities: ['Private Pool', 'Butler Service', 'Panaromic View'],
  },
  {
    id: 'rm_302',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '302',
    floor: 3,
    room_type_name: 'Executive Suite',
    base_price: 55000,
    status: 'AVAILABLE',
    housekeeping_status: 'CLEAN',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 3,
    amenities: ['WiFi', 'AC', 'Balcony'],
  },
  {
    id: 'rm_303',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '303',
    floor: 3,
    room_type_name: 'Family Suite',
    base_price: 60000,
    status: 'OCCUPIED',
    housekeeping_status: 'CLEAN',
    current_guest_name: 'Mr. & Mrs. Farooq',
    active_booking_id: 'bk_3003',
    capacity: 4,
    amenities: ['WiFi', 'AC', 'Kitchenette'],
  },
  {
    id: 'rm_304',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '304',
    floor: 3,
    room_type_name: 'Deluxe King Room',
    base_price: 35000,
    status: 'AVAILABLE',
    housekeeping_status: 'INSPECTED',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 2,
    amenities: ['WiFi', 'AC'],
  },
  {
    id: 'rm_305',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '305',
    floor: 3,
    room_type_name: 'Standard Single / Double',
    base_price: 22000,
    status: 'CLEANING',
    housekeeping_status: 'IN_PROGRESS',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 2,
    amenities: ['WiFi', 'AC'],
  },
  {
    id: 'rm_306',
    propertyId: 'prop_01',
    propertyName: 'Pearl Continental',
    roomNumber: '306',
    floor: 3,
    room_type_name: 'Penthouse Suite',
    base_price: 125000,
    status: 'MAINTENANCE',
    housekeeping_status: 'DIRTY',
    current_guest_name: null,
    active_booking_id: null,
    capacity: 6,
    amenities: ['Private Pool', 'Jacuzzi'],
  },
];

function normalizeRoom(r: any): Room {
  const roomTypeName = r.room_type_name || r.room_type_details?.name || r.type || 'Standard Room';
  const price = typeof r.base_price !== 'undefined' && r.base_price !== null
    ? parseFloat(r.base_price)
    : parseFloat(r.room_type_details?.base_price_per_night || r.basePricePerNight || '0');

  const hourlyRateVal = typeof r.hourly_rate !== 'undefined' && r.hourly_rate !== null
    ? parseFloat(r.hourly_rate)
    : Math.round(price / 6);

  const statusUpper = String(r.status || 'AVAILABLE').toUpperCase() as RoomStatus;
  const hkStatusUpper = String(r.housekeeping_status || 'CLEAN').toUpperCase() as HousekeepingStatus;

  return {
    id: String(r.id),
    propertyId: String(r.property || r.propertyId || ''),
    propertyName: r.property_name || r.propertyName || 'Hotel Property',
    roomNumber: String(r.room_number || r.roomNumber || 'N/A'),
    floor: r.floor ?? 1,
    room_type_name: roomTypeName,
    base_price: isNaN(price) ? 0 : price,
    hourly_rate: isNaN(hourlyRateVal) ? 1000 : hourlyRateVal,
    is_hourly_allowed: r.is_hourly_allowed ?? true,
    status: statusUpper,
    housekeeping_status: hkStatusUpper,
    current_guest_name: r.current_guest_name || null,
    active_booking_id: r.active_booking_id || null,
    capacity: r.room_type_details?.max_occupancy || r.capacity || 2,
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
  };
}

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const roomService = {
  async getRoomTypes(): Promise<RoomTypeItem[]> {
    try {
      const response = await apiClient.get('/rooms/types/');
      const raw = extractArray<any>(response.data, []);
      if (raw.length > 0) {
        return raw.map((item) => ({
          id: String(item.id),
          name: item.name,
          code: item.code || '',
          description: item.description || '',
          baseRate: parseFloat(item.base_price_per_night || item.baseRate || '0'),
          hourlyRate: parseFloat(item.hourly_rate || item.hourlyRate || String(parseFloat(item.base_price_per_night || '0') * 0.25)),
          capacity: item.max_occupancy || item.capacity || 2,
        }));
      }
      return MOCK_ROOM_TYPES;
    } catch {
      return MOCK_ROOM_TYPES;
    }
  },

  async getRooms(propertyId?: string): Promise<Room[]> {
    try {
      const url = propertyId ? `/rooms/?property_id=${propertyId}` : '/rooms/';
      const response = await apiClient.get(url);
      const rawList = extractArray<any>(response.data, []);
      if (rawList.length > 0) {
        return rawList.map(normalizeRoom);
      }
      return MOCK_ROOMS.map(normalizeRoom);
    } catch {
      return MOCK_ROOMS.map(normalizeRoom);
    }
  },

  async updateRoomStatus(roomId: string, status: RoomStatus): Promise<Room> {
    try {
      const response = await apiClient.patch<Room>(`/rooms/${roomId}/`, { status });
      return normalizeRoom(response.data);
    } catch {
      const target = MOCK_ROOMS.find((r) => r.id === roomId);
      if (target) target.status = status;
      return normalizeRoom(target || MOCK_ROOMS[0]);
    }
  },

  async createRoom(input: CreateRoomInput): Promise<Room> {
    try {
      const response = await apiClient.post<Room>('/rooms/', input);
      return normalizeRoom(response.data);
    } catch {
      const newRoom: Room = {
        id: `rm_${Date.now()}`,
        propertyId: input.propertyId,
        propertyName: 'Pearl Continental',
        roomNumber: input.roomNumber,
        floor: input.floor,
        room_type_name: String(input.type),
        base_price: input.basePricePerNight,
        status: 'AVAILABLE',
        housekeeping_status: 'CLEAN',
        current_guest_name: null,
        active_booking_id: null,
        capacity: input.capacity,
        amenities: input.amenities,
      };
      MOCK_ROOMS.unshift(newRoom);
      return newRoom;
    }
  },
};
