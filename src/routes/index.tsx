import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { SuperAdminRoute } from '@/components/layout/SuperAdminRoute';
import { PermissionRoute } from '@/components/auth/PermissionRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Lazy-loaded feature pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BookingsPage = lazy(() => import('@/features/bookings/pages/BookingsPage').then(m => ({ default: m.BookingsPage })));
const ExpensesPage = lazy(() => import('@/features/expenses/pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

// Restaurant Operations Pages
const RestaurantPOSPage = lazy(() => import('@/features/restaurant/pages/RestaurantPOSPage').then(m => ({ default: m.RestaurantPOSPage })));
const KitchenDisplayPage = lazy(() => import('@/features/restaurant/pages/KitchenDisplayPage').then(m => ({ default: m.KitchenDisplayPage })));
const OrderHistoryPage = lazy(() => import('@/features/restaurant/pages/OrderHistoryPage').then(m => ({ default: m.OrderHistoryPage })));

// Single Canonical Administration Suite Page
const AdministrationPage = lazy(() => import('@/features/administration/pages/AdministrationPage').then(m => ({ default: m.AdministrationPage })));

// SuperAdmin & Profile Pages
const TenantsPage = lazy(() => import('@/features/tenants/pages/TenantsPage').then(m => ({ default: m.TenantsPage })));
const PlatformAnalyticsPage = lazy(() => import('@/features/platform/pages/PlatformAnalyticsPage').then(m => ({ default: m.PlatformAnalyticsPage })));
const SystemUsersPage = lazy(() => import('@/features/users/pages/SystemUsersPage').then(m => ({ default: m.SystemUsersPage })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

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
