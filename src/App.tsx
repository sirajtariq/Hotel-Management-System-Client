import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/hooks/useAuth';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { router } from '@/routes';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,        // 2 minutes before data is considered stale
      gcTime: 10 * 60 * 1000,          // 10 minutes cache garbage collection time
      refetchOnWindowFocus: false,     // Stop spamming backend on browser tab switch
      refetchOnReconnect: true,        // Refetch cleanly if network disconnects and reconnects
      retry: 1,                        // Retry failed requests once before showing error toast
    },
    mutations: {
      retry: 0,                        // Never retry mutations automatically to prevent duplicate state changes
    },
  },
});

// Dynamic Title Helper Component
function DynamicDocumentTitle() {
  const auth = useAuth() as any;
  const tenant = auth?.tenant || auth?.user?.tenant;
  const tenantName = tenant?.name || auth?.user?.tenant_name;

  useEffect(() => {
    if (tenantName && typeof tenantName === 'string' && tenantName.trim()) {
      document.title = `${tenantName.trim()} | StayOS`;
    } else {
      document.title = 'StayOS — Hotel Management & Operations Platform';
    }
  }, [tenantName]);

  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DynamicDocumentTitle />
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;