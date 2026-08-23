import { apiClient } from '@/lib/axios';
import { Property, CreatePropertyInput } from '@/types/properties';

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop_01',
    name: 'Pearl Continental & Serviced Suites',
    code: 'PCSS',
    type: 'serviced_apartment',
    address: 'Club Road, Opp. Civil Lines',
    city: 'Karachi',
    totalRooms: 45,
    occupiedRooms: 38,
    cleaningRooms: 4,
    availableRooms: 3,
    monthlyRevenue: 3450000,
    occupancyRate: 84.4,
    status: 'active',
    createdAt: '2026-01-10',
  },
  {
    id: 'prop_02',
    name: 'Grand Horizon Luxury Apartments',
    code: 'GHLA',
    type: 'serviced_apartment',
    address: 'Gulberg III, Main Boulevard',
    city: 'Lahore',
    totalRooms: 30,
    occupiedRooms: 24,
    cleaningRooms: 2,
    availableRooms: 4,
    monthlyRevenue: 2800000,
    occupancyRate: 80.0,
    status: 'active',
    createdAt: '2026-02-01',
  },
  {
    id: 'prop_03',
    name: 'Margalla View Boutique Hotel',
    code: 'MVBH',
    type: 'hotel',
    address: 'F-7 Markaz',
    city: 'Islamabad',
    totalRooms: 20,
    occupiedRooms: 15,
    cleaningRooms: 1,
    availableRooms: 4,
    monthlyRevenue: 1950000,
    occupancyRate: 75.0,
    status: 'active',
    createdAt: '2026-03-15',
  },
];

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
      return response.data;
    } catch {
      const newProp: Property = {
        id: `prop_${Date.now()}`,
        ...input,
        occupiedRooms: 0,
        cleaningRooms: 0,
        availableRooms: input.totalRooms,
        monthlyRevenue: 0,
        occupancyRate: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      MOCK_PROPERTIES.unshift(newProp);
      return newProp;
    }
  },
};
