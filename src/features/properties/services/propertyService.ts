import { apiClient } from '@/lib/axios';
import { Property, PropertySelectorItem, CreatePropertyInput } from '@/types/properties';

function normalizeProperty(p: any): Property {
  const total = p.total_rooms ?? p.totalRooms ?? 0;
  const booked = p.booked_rooms ?? p.bookedRooms ?? p.occupied_rooms ?? p.occupiedRooms ?? 0;
  const cleaning = p.cleaning_rooms ?? p.cleaningRooms ?? 0;
  const available = p.available_rooms ?? p.availableRooms ?? 0;
  const rent = parseFloat(p.monthly_rent ?? p.monthlyRent ?? p.monthlyRevenue ?? p.est_monthly_revenue ?? p.estMonthlyRevenue ?? '0');
  const occRate = p.occupancy_rate ?? p.occupancyRate ?? (total > 0 ? roundOneDecimal((booked / total) * 100) : 0);

  return {
    id: p.id,
    name: p.name || 'Hotel Branch',
    code: p.code || `P-${p.id}`,
    type: p.property_type || p.propertyType || p.type || 'Hotel Branch',
    propertyType: p.property_type || p.propertyType || p.type || 'Hotel Branch',
    address: p.address || '',
    city: p.city || 'Karachi',
    phone: p.phone || '',
    email: p.email || '',
    monthly_rent: rent,
    monthlyRent: rent,
    totalRooms: total,
    total_rooms: total,
    bookedRooms: booked,
    booked_rooms: booked,
    occupiedRooms: booked,
    occupied_rooms: booked,
    cleaningRooms: cleaning,
    cleaning_rooms: cleaning,
    availableRooms: available,
    available_rooms: available,
    monthlyRevenue: rent,
    estMonthlyRevenue: rent,
    est_monthly_revenue: rent,
    occupancyRate: occRate,
    occupancy_rate: occRate,
    status: (p.status || 'ACTIVE').toUpperCase(),
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
  };
}

function roundOneDecimal(val: number): number {
  return Math.round(val * 10) / 10;
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

  async getPropertySelector(): Promise<PropertySelectorItem[]> {
    try {
      const response = await apiClient.get('/properties/selector/');
      return extractArray<PropertySelectorItem>(response.data, []);
    } catch {
      return [];
    }
  },

  async getPropertyById(id: number | string): Promise<Property> {
    const response = await apiClient.get(`/properties/${id}/`);
    return normalizeProperty(response.data);
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

  async updateProperty(id: number | string, input: Partial<CreatePropertyInput>): Promise<Property> {
    try {
      const response = await apiClient.patch<Property>(`/properties/${id}/`, input);
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

  async deleteProperty(id: number | string): Promise<void> {
    await apiClient.delete(`/properties/${id}/`);
  },
};
