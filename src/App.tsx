import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/hooks/useAuth';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { router } from '@/routes';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,       // 2 minutes before data is considered stale
      gcTime: 10 * 60 * 1000,         // 10 minutes cache garbage collection time
      refetchOnWindowFocus: false,    // Stop spamming backend on browser tab switch
      refetchOnReconnect: true,       // Refetch cleanly if network disconnects and reconnects
      retry: 1,                       // Retry failed requests once before showing error toast
    },
    mutations: {
      retry: 0,                       // Never retry mutations automatically to prevent duplicate state changes
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
