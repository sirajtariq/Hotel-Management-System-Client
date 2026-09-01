export type SubscriptionPlan = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type BillingType = 'MONTHLY' | 'ONE_TIME' | 'ANNUAL';
export type SubscriptionStatus = 'PAID' | 'DUE_SOON' | 'GRACE_PERIOD' | 'OVERDUE';

export interface TenantItem {
  id: string;
  name: string;
  slug: string;
  subscription_plan: SubscriptionPlan;
  billing_type: BillingType;
  price_amount: number | string;
  subscription_start_date?: string;
  next_due_date?: string | null;
  grace_period_days?: number;
  subscription_status?: SubscriptionStatus;
  is_active: boolean;
  contact_email: string;
  contact_phone: string;
  notes?: string;
  max_properties: number | null;
  max_rooms: number | null;
  max_users: number | null;
  current_properties_count?: number;
  current_rooms_count?: number;
  current_users_count?: number;
  created_at: string;
  updated_at: string;
  users_count?: number;
}

export interface TenantMetrics {
  total_tenants?: number;
  active_tenants?: number;
  inactive_tenants?: number;
  monthly_recurring_revenue?: number;
  one_time_revenue?: number;
  annual_recurring_revenue?: number;
  overdue_count?: number;
  due_soon_count?: number;
  totalTenants?: number;
  activeTenants?: number;
  inactiveTenants?: number;
  monthlyRecurringRevenue?: number;
  oneTimeRevenue?: number;
  annualRecurringRevenue?: number;
  dueSoonCount?: number;
}

export interface CreateTenantPayload {
  name: string;
  slug?: string;
  subscription_plan: SubscriptionPlan;
  billing_type: BillingType;
  price_amount: number;
  contact_email: string;
  contact_phone?: string;
  notes?: string;
  is_active?: boolean;
  max_properties?: number | null;
  max_rooms?: number | null;
  max_users?: number | null;
  admin_username?: string;
  admin_password?: string;
  admin_email?: string;
  admin_first_name?: string;
  admin_last_name?: string;
}

export interface UpdateTenantPayload {
  name?: string;
  subscription_plan?: SubscriptionPlan;
  billing_type?: BillingType;
  price_amount?: number | string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active?: boolean;
  max_properties?: number | null;
  max_rooms?: number | null;
  max_users?: number | null;
}


