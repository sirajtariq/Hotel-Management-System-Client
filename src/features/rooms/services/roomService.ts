import { apiClient } from '@/lib/axios';
import { Room, RoomStatus, HousekeepingStatus, CreateRoomInput } from '@/types/rooms';

export interface AvailableRoomItem {
  id: number | string;
  propertyId: number | string;
  roomNumber: string;
  roomTypeName: string;
  floor?: string;
  maxOccupancy?: number;
  basePrice: number;
  hourlyRate: number;
  isHourlyAllowed: boolean;
}

export interface RoomTypeItem {
  id: string | number;
  propertyId?: string;
  name: string;
  code?: string;
  description?: string;
  baseRate: number;
  hourlyRate?: number;
  is_hourly_allowed?: boolean;
  is_active?: boolean;
  capacity: number;
  amenities?: string[];
}

export interface CreateRoomTypeInput {
  propertyId?: string;
  name: string;
  code?: string;
  description?: string;
  max_occupancy?: number;
  base_price_per_night: number;
  is_hourly_allowed?: boolean;
  hourly_rate?: number;
  amenities?: string[];
}

function normalizeRoom(r: any): Room {
  const roomTypeName = r.room_type_name || r.room_type_details?.name || r.type || 'Standard Room';
  const price = typeof r.base_price !== 'undefined' && r.base_price !== null
    ? parseFloat(r.base_price)
    : parseFloat(r.room_type_details?.base_price_per_night || r.basePricePerNight || '0');

  const hourlyRateVal = typeof r.hourly_rate !== 'undefined' && r.hourly_rate !== null
    ? parseFloat(r.hourly_rate)
    : Math.round(price / 4);

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
      return raw.map((item) => ({
        id: String(item.id),
        propertyId: String(item.property || item.property_id || ''),
        name: item.name,
        code: item.code || '',
        description: item.description || '',
        baseRate: parseFloat(item.base_price_per_night || item.baseRate || '0'),
        hourlyRate: parseFloat(item.hourly_rate || item.hourlyRate || String(parseFloat(item.base_price_per_night || '0') * 0.25)),
        is_hourly_allowed: item.is_hourly_allowed ?? true,
        capacity: item.max_occupancy || item.capacity || 2,
        amenities: Array.isArray(item.amenities) ? item.amenities : [],
      }));
    } catch {
      return [];
    }
  },

  async createRoomType(input: CreateRoomTypeInput): Promise<RoomTypeItem> {
    try {
      const payload = {
        name: input.name,
        code: input.code || input.name.substring(0, 4).toUpperCase(),
        description: input.description || '',
        max_occupancy: input.max_occupancy || 2,
        base_price_per_night: input.base_price_per_night,
        is_hourly_allowed: input.is_hourly_allowed ?? true,
        hourly_rate: input.hourly_rate || Math.round(input.base_price_per_night * 0.25),
        amenities: input.amenities || [],
      };
      const response = await apiClient.post('/rooms/types/', payload);
      const item = response.data;
      return {
        id: String(item.id),
        propertyId: String(item.property || item.propertyId || ''),
        name: item.name,
        code: item.code || '',
        description: item.description || '',
        baseRate: parseFloat(item.base_price_per_night || item.baseRate || '0'),
        hourlyRate: parseFloat(item.hourly_rate || item.hourlyRate || '0'),
        is_hourly_allowed: item.is_hourly_allowed ?? true,
        capacity: item.max_occupancy || item.capacity || 2,
        amenities: item.amenities || [],
      };
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async updateRoomType(id: string | number, input: Partial<CreateRoomTypeInput>): Promise<RoomTypeItem> {
    try {
      const response = await apiClient.patch(`/rooms/types/${id}/`, input);
      const item = response.data;
      return {
        id: String(item.id),
        name: item.name,
        code: item.code || '',
        description: item.description || '',
        baseRate: parseFloat(item.base_price_per_night || item.baseRate || '0'),
        hourlyRate: parseFloat(item.hourly_rate || item.hourlyRate || '0'),
        is_hourly_allowed: item.is_hourly_allowed ?? true,
        capacity: item.max_occupancy || item.capacity || 2,
        amenities: item.amenities || [],
      };
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async deleteRoomType(id: string | number): Promise<void> {
    await apiClient.delete(`/rooms/types/${id}/`);
  },

  async getRooms(propertyId?: string): Promise<Room[]> {
    try {
      const url = propertyId ? `/rooms/?property_id=${propertyId}` : '/rooms/';
      const response = await apiClient.get(url);
      const rawList = extractArray<any>(response.data, []);
      return rawList.map(normalizeRoom);
    } catch {
      return [];
    }
  },

  async updateRoomStatus(roomId: string, status: RoomStatus): Promise<Room> {
    try {
      const response = await apiClient.patch<Room>(`/rooms/${roomId}/`, { status });
      return normalizeRoom(response.data);
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async updateHousekeepingStatus(roomId: string, hkStatus: HousekeepingStatus): Promise<Room> {
    try {
      const response = await apiClient.patch<Room>(`/rooms/${roomId}/`, { housekeeping_status: hkStatus });
      return normalizeRoom(response.data);
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async createRoom(input: CreateRoomInput): Promise<Room> {
    try {
      const response = await apiClient.post<Room>('/rooms/', input);
      return normalizeRoom(response.data);
    } catch (err: any) {
      if (err.response?.data) {
        const msg = typeof err.response.data === 'object'
          ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(err.response.data);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async getAvailableRooms(propertyId?: string | number): Promise<AvailableRoomItem[]> {
    try {
      const params = propertyId && propertyId !== 'ALL' ? { propertyId } : {};
      const response = await apiClient.get<any[]>('/rooms/available/', { params });
      const list = extractArray<any>(response.data, []);
      return list.map((r) => ({
        id: r.id,
        propertyId: r.propertyId ?? r.property_id,
        roomNumber: r.roomNumber ?? r.room_number ?? 'N/A',
        roomTypeName: r.roomTypeName ?? r.room_type_name ?? 'Standard Room',
        floor: r.floor || '',
        maxOccupancy: r.maxOccupancy ?? r.max_occupancy ?? 2,
        basePrice: parseFloat(r.basePrice ?? r.base_price ?? '0'),
        hourlyRate: parseFloat(r.hourlyRate ?? r.hourly_rate ?? '0'),
        isHourlyAllowed: Boolean(r.isHourlyAllowed ?? r.is_hourly_allowed ?? true),
      }));
    } catch {
      return [];
    }
  },
};
