import { apiClient } from '@/lib/axios';
import { Property, CreatePropertyInput } from '@/types/properties';

function normalizeProperty(p: any): Property {
  return {
    id: String(p.id),
    name: p.name || 'Hotel Property',
    code: p.code || `P-${p.id}`,
    type: (p.type || 'serviced_apartment').toLowerCase() as any,
    address: p.address || '',
    city: p.city || 'Karachi',
    totalRooms: p.total_rooms || p.totalRooms || 0,
    occupiedRooms: p.occupied_rooms || p.occupiedRooms || 0,
    cleaningRooms: p.cleaning_rooms || p.cleaningRooms || 0,
    availableRooms: p.available_rooms || p.availableRooms || 0,
    monthlyRevenue: parseFloat(p.monthly_rent || p.monthlyRevenue || '0'),
    occupancyRate: p.occupancy_rate || p.occupancyRate || 0,
    status: (p.status || 'ACTIVE').toLowerCase() as any,
    createdAt: p.created_at || p.createdAt || new Date().toISOString().split('T')[0],
  };
}

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      const response = await apiClient.get('/properties/');
      const rawList = extractArray<any>(response.data, []);
      return rawList.map(normalizeProperty);
    } catch {
      return [];
    }
  },

  async createProperty(input: CreatePropertyInput): Promise<Property> {
    try {
      const response = await apiClient.post<Property>('/properties/', input);
      return normalizeProperty(response.data);
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
};
