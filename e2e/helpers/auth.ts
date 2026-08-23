import { Page, expect } from '@playwright/test';

export interface TestUserCredentials {
  email: string;
  password: string;
  name: string;
}

export const USER_CREDENTIALS = {
  superadmin: {
    email: 'superadmin@platform.com',
    password: 'SuperAdminSecret123!',
    name: 'Super Admin',
  },
  tenant_admin: {
    email: 'admin@hotel.com',
    password: 'TenantAdminPass123!',
    name: 'Hamza Owner',
  },
  receptionist: {
    email: 'receptionist@hotel.com',
    password: 'StaffPass123!',
    name: 'Sarah Receptionist',
  },
};

export async function loginAs(
  page: Page,
  role: 'superadmin' | 'tenant_admin' | 'receptionist'
) {
  const creds = USER_CREDENTIALS[role];

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill login credentials
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', creds.email);
  await page.fill('input[type="password"], input[name="password"], input[placeholder*="password" i]', creds.password);
  await page.click('button[type="submit"]');

  // Wait for login to complete and navigate to dashboard or tenants
  await page.waitForURL((url) => url.pathname.includes('/dashboard') || url.pathname.includes('/tenants'), {
    timeout: 15000,
  });
}
