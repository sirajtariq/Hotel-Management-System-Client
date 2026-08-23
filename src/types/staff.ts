export interface StaffMember {
  id: string;
  name: string;
  phone_number: string;
  position: string;
  department?: string;
  property: string | null;
  property_name?: string;
  monthly_salary: string | number;
  hired_date?: string | null;
  is_active: boolean;
  has_login_access: boolean;
  user_id?: string | number | null;
  username?: string;
  email?: string;
  custom_role?: {
    id: string | number;
    name: string;
  } | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateStaffInput {
  name: string;
  phone_number?: string;
  position: string;
  department?: string;
  property: string | null;
  monthly_salary: number;
  hired_date?: string;
  is_active?: boolean;
  enable_login: boolean;
  login_username?: string;
  login_email?: string;
  password?: string;
  custom_role_id?: string | number | null;
}

export type UpdateStaffInput = Partial<CreateStaffInput>;
