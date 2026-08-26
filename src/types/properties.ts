export type PropertyType = 'hotel' | 'serviced_apartment' | 'resort' | 'guesthouse' | 'Boutique Villa' | string;

export interface Property {
  id: string | number;
  name: string;
  code?: string;
  type?: PropertyType;
  propertyType?: string;
  property_type?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  monthly_rent?: number | string;
  monthlyRent?: number | string;
  totalRooms?: number;
  total_rooms?: number;
  bookedRooms?: number;
  booked_rooms?: number;
  occupiedRooms?: number;
  occupied_rooms?: number;
  cleaningRooms?: number;
  cleaning_rooms?: number;
  availableRooms?: number;
  available_rooms?: number;
  monthlyRevenue?: number;
  estMonthlyRevenue?: number;
  est_monthly_revenue?: number;
  occupancyRate?: number;
  occupancy_rate?: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE' | 'active' | 'maintenance' | 'inactive' | string;
  createdAt?: string;
  created_at?: string;
}

export interface PropertySelectorItem {
  id: string | number;
  name: string;
  city: string;
}

export interface CreatePropertyInput {
  name: string;
  property_type?: string;
  type?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  monthly_rent?: number;
  status?: string;
}
