import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { SuperAdminRoute } from '@/components/layout/SuperAdminRoute';
import { PermissionRoute } from '@/components/auth/PermissionRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { PropertiesPage } from '@/features/properties/pages/PropertiesPage';
import { RoomsPage } from '@/features/rooms/pages/RoomsPage';
import { BookingsPage } from '@/features/bookings/pages/BookingsPage';
import { ExpensesPage } from '@/features/expenses/pages/ExpensesPage';
import { StaffPage } from '@/features/staff/pages/StaffPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { RolesPage } from '@/features/roles/pages/RolesPage';
import { TenantsPage } from '@/features/tenants/pages/TenantsPage';
import { PlatformAnalyticsPage } from '@/features/platform/pages/PlatformAnalyticsPage';
import { SystemUsersPage } from '@/features/users/pages/SystemUsersPage';

import { RestaurantPOSPage } from '@/features/restaurant/pages/RestaurantPOSPage';
import { KitchenDisplayPage } from '@/features/restaurant/pages/KitchenDisplayPage';
import { MenuCatalogPage } from '@/features/restaurant/pages/MenuCatalogPage';
import { TableManagementPage } from '@/features/restaurant/pages/TableManagementPage';
import { OrderHistoryPage } from '@/features/restaurant/pages/OrderHistoryPage';

import { ProfilePage } from '@/features/profile/pages/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/profile', element: <ProfilePage /> },
          {
            path: '/properties',
            element: (
              <PermissionRoute permission="properties:view">
                <PropertiesPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/rooms',
            element: (
              <PermissionRoute permission="rooms:view">
                <RoomsPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/bookings',
            element: (
              <PermissionRoute permission="bookings:view">
                <BookingsPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/restaurant/pos',
            element: (
              <PermissionRoute permission="restaurant:pos">
                <RestaurantPOSPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/restaurant/kitchen',
            element: (
              <PermissionRoute permission="restaurant:kitchen">
                <KitchenDisplayPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/restaurant/menu',
            element: (
              <PermissionRoute permission="restaurant:menu_manage">
                <MenuCatalogPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/restaurant/tables',
            element: (
              <PermissionRoute permission="restaurant:tables_manage">
                <TableManagementPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/restaurant/orders',
            element: (
              <PermissionRoute permission="restaurant:orders_view">
                <OrderHistoryPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/expenses',
            element: (
              <PermissionRoute permission="expenses:view">
                <ExpensesPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/staff',
            element: (
              <PermissionRoute permission="staff:view">
                <StaffPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/reports',
            element: (
              <PermissionRoute permission="reports:view_pnl">
                <ReportsPage />
              </PermissionRoute>
            ),
          },
          {
            path: '/roles',
            element: (
              <PermissionRoute permission="roles:manage">
                <RolesPage />
              </PermissionRoute>
            ),
          },

          {
            element: <SuperAdminRoute />,
            children: [
              { path: '/tenants', element: <TenantsPage /> },
              { path: '/platform-analytics', element: <PlatformAnalyticsPage /> },
              { path: '/users', element: <SystemUsersPage /> },
            ],
          },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);


