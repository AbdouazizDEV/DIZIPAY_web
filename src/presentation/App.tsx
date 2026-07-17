import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './providers/AuthProvider';
import { ToastProvider } from './providers/ToastProvider';
import { ToastViewport } from './components/feedback/ToastViewport';
import { MerchantLayout } from './layouts/MerchantLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { GuestOnlyRoute } from './routes/GuestOnlyRoute';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CreateLinkPage } from './pages/CreateLink/CreateLinkPage';
import { LinksListPage } from './pages/LinksList/LinksListPage';
import { LinkDetailPage } from './pages/LinkDetail/LinkDetailPage';
import { PublicPayPage } from './pages/PublicPay/PublicPayPage';
import { CreatePayoutPage } from './pages/CreatePayout/CreatePayoutPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/pay/:token" element={<PublicPayPage />} />

              <Route element={<GuestOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<MerchantLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="links" element={<LinksListPage />} />
                  <Route path="links/new" element={<CreateLinkPage />} />
                  <Route path="links/:token" element={<LinkDetailPage />} />
                  <Route path="payouts/new" element={<CreatePayoutPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <ToastViewport />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
