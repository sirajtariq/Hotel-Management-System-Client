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

export interface RoomTypeSelectorItem {
  id: number | string;
  name: string;
  basePricePerNight: number;
  base_price_per_night?: number;
  basePrice?: number;
  hourlyRate?: number;
  hourly_rate?: number;
  isHourlyAllowed?: boolean;
  is_hourly_allowed?: boolean;
  maxOccupancy?: number;
  max_occupancy?: number;
  amenities?: string[];
}

export interface RoomTypeItem {
  id: string | number;
  propertyId?: string;
  propertyName?: string;
  name: string;
  code?: string;
  description?: string;
  basePricePerNight: number;
  basePrice: number;
  baseRate: number;
  base_price_per_night?: number;
  base_price?: number;
  hourlyRate?: number;
  hourly_rate?: number;
  isHourlyAllowed?: boolean;
  is_hourly_allowed?: boolean;
  is_active?: boolean;
  maxOccupancy: number;
  capacity: number;
  amenities?: string[];
}

export interface CreateRoomTypeInput {
  property?: number | string;
  property_id?: number | string;
  propertyId?: number | string;
  name: string;
  code?: string;
  description?: string;
  max_occupancy?: number;
  capacity?: number;
  maxOccupancy?: number;
  base_price_per_night?: number;
  base_price?: number;
  baseRate?: number;
  basePrice?: number;
  is_hourly_allowed?: boolean;
  isHourlyAllowed?: boolean;
  hourly_rate?: number;
  hourlyRate?: number;
  amenities?: string[];
}

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

function mapRoomTypeItem(item: any): RoomTypeItem {
  const bPrice = parseFloat(item.basePricePerNight ?? item.base_price_per_night ?? item.basePrice ?? item.baseRate ?? item.base_price ?? '0') || 0;
  const hRate = parseFloat(item.hourlyRate ?? item.hourly_rate ?? item.hourly_price ?? '0') || 0;
  const isHourly = Boolean(item.isHourlyAllowed ?? item.is_hourly_allowed ?? true);
  const maxOcc = Number(item.maxOccupancy ?? item.max_occupancy ?? item.capacity ?? 2);

  return {
    id: String(item.id),
    propertyId: String(item.property || item.property_id || item.propertyId || ''),
    propertyName: item.propertyName || item.property_name || '',
    name: item.name || '',
    code: item.code || '',
    description: item.description || '',
    basePricePerNight: bPrice,
    basePrice: bPrice,
    baseRate: bPrice,
    hourlyRate: hRate,
    hourly_rate: hRate,
    isHourlyAllowed: isHourly,
    is_hourly_allowed: isHourly,
    maxOccupancy: maxOcc,
    capacity: maxOcc,
    amenities: Array.isArray(item.amenities) ? item.amenities : [],
  };
}

function normalizeRoom(r: any): Room {
  const roomTypeName = r.roomTypeName || r.room_type_name || r.room_type_details?.name || r.type || 'Standard Room';
  const price = typeof r.basePrice !== 'undefined' && r.basePrice !== null
    ? parseFloat(r.basePrice)
    : (typeof r.base_price !== 'undefined' && r.base_price !== null
        ? parseFloat(r.base_price)
        : parseFloat(r.basePricePerNight || r.base_price_per_night || r.room_type_details?.basePricePerNight || r.room_type_details?.base_price_per_night || '0'));

  const hourlyRateVal = typeof r.hourlyRate !== 'undefined' && r.hourlyRate !== null
    ? parseFloat(r.hourlyRate)
    : (typeof r.hourly_rate !== 'undefined' && r.hourly_rate !== null
        ? parseFloat(r.hourly_rate)
        : parseFloat(r.room_type_details?.hourlyRate || r.room_type_details?.hourly_rate || '0'));

  const statusUpper = String(r.status || 'AVAILABLE').toUpperCase() as RoomStatus;
  const hkStatusUpper = String(r.housekeepingStatus || r.housekeeping_status || 'CLEAN').toUpperCase() as HousekeepingStatus;

  return {
    id: String(r.id),
    propertyId: String(r.property || r.propertyId || ''),
    propertyName: r.propertyName || r.property_name || 'Hotel Property',
    roomNumber: String(r.roomNumber || r.room_number || 'N/A'),
    floor: r.floor ?? 1,
    room_type_name: roomTypeName,
    base_price: isNaN(price) ? 0 : price,
    hourly_rate: isNaN(hourlyRateVal) ? 0 : hourlyRateVal,
    is_hourly_allowed: r.isHourlyAllowed ?? r.is_hourly_allowed ?? r.room_type_details?.is_hourly_allowed ?? true,
    status: statusUpper,
    housekeeping_status: hkStatusUpper,
    current_guest_name: r.currentGuestName || r.current_guest_name || null,
    active_booking_id: r.activeBookingId || r.active_booking_id || null,
    capacity: r.maxOccupancy || r.max_occupancy || r.room_type_details?.max_occupancy || r.capacity || 2,
    amenities: Array.isArray(r.amenities) ? r.amenities : (Array.isArray(r.room_type_details?.amenities) ? r.room_type_details.amenities : []),
  };
}

let roomTypesCache: { data: RoomTypeItem[]; timestamp: number } | null = null;
let pendingRoomTypesPromise: Promise<RoomTypeItem[]> | null = null;

let roomsCache: { key: string; data: Room[]; timestamp: number } | null = null;
let pendingRoomsPromise: Promise<Room[]> | null = null;

export const roomService = {
  async getRoomTypes(forceRefresh = false): Promise<RoomTypeItem[]> {
    const now = Date.now();
    if (!forceRefresh && roomTypesCache && (now - roomTypesCache.timestamp < 10000)) {
      return roomTypesCache.data;
    }
    if (!forceRefresh && pendingRoomTypesPromise) {
      return pendingRoomTypesPromise;
    }

    pendingRoomTypesPromise = (async () => {
      try {
        const response = await apiClient.get('/rooms/types/');
        const raw = extractArray<any>(response.data, []);
        const result = raw.map(mapRoomTypeItem);
        roomTypesCache = { data: result, timestamp: Date.now() };
        return result;
      } catch {
        return roomTypesCache?.data || [];
      } finally {
        pendingRoomTypesPromise = null;
      }
    })();

    return pendingRoomTypesPromise;
  },

  async getRoomTypeSelector(propertyId?: number | string): Promise<RoomTypeSelectorItem[]> {
    try {
      const params = propertyId && propertyId !== 'ALL' ? { propertyId } : {};
      const response = await apiClient.get('/rooms/types/selector/', { params });
      const raw = extractArray<any>(response.data, []);
      return raw.map((item) => {
        const baseP = parseFloat(item.basePricePerNight ?? item.base_price_per_night ?? item.basePrice ?? item.baseRate ?? '0') || 0;
        const hourlyP = item.hourlyRate ?? item.hourly_rate;
        return {
          id: item.id,
          name: item.name,
          basePricePerNight: baseP,
          base_price_per_night: baseP,
          basePrice: baseP,
          hourlyRate: typeof hourlyP !== 'undefined' && hourlyP !== null ? parseFloat(hourlyP) || 0 : undefined,
          hourly_rate: typeof hourlyP !== 'undefined' && hourlyP !== null ? parseFloat(hourlyP) || 0 : undefined,
          isHourlyAllowed: Boolean(item.isHourlyAllowed ?? item.is_hourly_allowed ?? true),
          is_hourly_allowed: Boolean(item.isHourlyAllowed ?? item.is_hourly_allowed ?? true),
          maxOccupancy: item.maxOccupancy ?? item.max_occupancy ?? 2,
          max_occupancy: item.maxOccupancy ?? item.max_occupancy ?? 2,
          amenities: Array.isArray(item.amenities) ? item.amenities : [],
        };
      });
    } catch {
      return [];
    }
  },

  async createRoomType(input: CreateRoomTypeInput): Promise<RoomTypeItem> {
    try {
      const pId = Number(input.property ?? input.property_id ?? input.propertyId);
      const baseP = Number(input.base_price_per_night ?? input.base_price ?? input.baseRate ?? input.basePrice ?? 0);
      const hourlyP = typeof input.hourly_rate !== 'undefined'
        ? Number(input.hourly_rate)
        : (typeof input.hourlyRate !== 'undefined' ? Number(input.hourlyRate) : Math.round(baseP * 0.25));

      const payload = {
        property: pId,
        name: input.name.trim(),
        code: input.code?.trim() || input.name.toLowerCase().replace(/\s+/g, '-'),
        description: input.description?.trim() || '',
        max_occupancy: Number(input.max_occupancy || input.capacity || input.maxOccupancy || 2),
        base_price_per_night: baseP,
        is_hourly_allowed: Boolean(input.is_hourly_allowed ?? input.isHourlyAllowed ?? true),
        hourly_rate: input.is_hourly_allowed === false ? 0 : hourlyP,
        amenities: input.amenities || [],
      };
      const response = await apiClient.post('/rooms/types/', payload);
      return mapRoomTypeItem(response.data);
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
      return mapRoomTypeItem(response.data);
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

  async getRooms(propertyId?: string, forceRefresh = false): Promise<Room[]> {
    const key = propertyId || 'ALL';
    const now = Date.now();

    if (!forceRefresh && roomsCache && roomsCache.key === key && (now - roomsCache.timestamp < 10000)) {
      return roomsCache.data;
    }
    if (!forceRefresh && pendingRoomsPromise) {
      return pendingRoomsPromise;
    }

    pendingRoomsPromise = (async () => {
      try {
        const url = propertyId ? `/rooms/?property_id=${propertyId}` : '/rooms/';
        const response = await apiClient.get(url);
        const rawList = extractArray<any>(response.data, []);
        const result = rawList.map(normalizeRoom);
        roomsCache = { key, data: result, timestamp: Date.now() };
        return result;
      } catch {
        return roomsCache?.data || [];
      } finally {
        pendingRoomsPromise = null;
      }
    })();

    return pendingRoomsPromise;
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

  async deleteRoom(id: string | number): Promise<void> {
    await apiClient.delete(`/rooms/${id}/`);
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
