export type PropertyType = 'hotel' | 'serviced_apartment' | 'resort' | 'guesthouse';

export interface Property {
  id: string;
  name: string;
  code: string;
  type: PropertyType;
  address: string;
  city: string;
  totalRooms: number;
  occupiedRooms: number;
  cleaningRooms: number;
  availableRooms: number;
  monthlyRevenue: number;
  occupancyRate: number;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
}

export interface CreatePropertyInput {
  name: string;
  code: string;
  type: PropertyType;
  address: string;
  city: string;
  totalRooms: number;
}
