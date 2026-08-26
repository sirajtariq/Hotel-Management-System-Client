import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { SuperAdminRoute } from '@/components/layout/SuperAdminRoute';
import { PermissionRoute } from '@/components/auth/PermissionRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { BookingsPage } from '@/features/bookings/pages/BookingsPage';
import { ExpensesPage } from '@/features/expenses/pages/ExpensesPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';

// Restaurant Operations Pages
import { RestaurantPOSPage } from '@/features/restaurant/pages/RestaurantPOSPage';
import { KitchenDisplayPage } from '@/features/restaurant/pages/KitchenDisplayPage';
import { OrderHistoryPage } from '@/features/restaurant/pages/OrderHistoryPage';

// Single Canonical Administration Suite Page
import { AdministrationPage } from '@/features/administration/pages/AdministrationPage';

// SuperAdmin & Profile Pages
import { TenantsPage } from '@/features/tenants/pages/TenantsPage';
import { PlatformAnalyticsPage } from '@/features/platform/pages/PlatformAnalyticsPage';
import { SystemUsersPage } from '@/features/users/pages/SystemUsersPage';
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

          // --- Operations Routes ---
          {
            path: '/bookings',
            element: (
              <PermissionRoute permission="bookings:view">
                <BookingsPage />
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
            path: '/reports',
            element: (
              <PermissionRoute permission="reports:view_pnl">
                <ReportsPage />
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
            path: '/restaurant/orders',
            element: (
              <PermissionRoute permission="restaurant:orders_view">
                <OrderHistoryPage />
              </PermissionRoute>
            ),
          },

          // --- Single Canonical Administration Suite Route ---
          {
            path: '/administration',
            element: (
              <PermissionRoute permission="properties:manage">
                <AdministrationPage />
              </PermissionRoute>
            ),
          },

          // --- Backward Compatibility Redirects for Legacy URLs ---
          { path: '/properties', element: <Navigate to="/administration?tab=properties" replace /> },
          { path: '/rooms', element: <Navigate to="/administration?tab=rooms" replace /> },
          { path: '/staff', element: <Navigate to="/administration?tab=staff" replace /> },
          { path: '/roles', element: <Navigate to="/administration?tab=roles" replace /> },
          { path: '/restaurant/menu', element: <Navigate to="/administration?tab=restaurant" replace /> },
          { path: '/restaurant/tables', element: <Navigate to="/administration?tab=restaurant" replace /> },

          { path: '/administration/properties', element: <Navigate to="/administration?tab=properties" replace /> },
          { path: '/administration/rooms', element: <Navigate to="/administration?tab=rooms" replace /> },
          { path: '/administration/staff', element: <Navigate to="/administration?tab=staff" replace /> },
          { path: '/administration/roles', element: <Navigate to="/administration?tab=roles" replace /> },
          { path: '/administration/account-heads', element: <Navigate to="/administration?tab=account-heads" replace /> },
          { path: '/administration/restaurant-setup', element: <Navigate to="/administration?tab=restaurant" replace /> },

          // --- SuperAdmin Only Routes ---
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
