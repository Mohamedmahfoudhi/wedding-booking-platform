import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadUser } from './store/slices/authSlice';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import ProviderLayout from './layouts/ProviderLayout';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';

// Public pages
import HomePage from './pages/public/HomePage';
import SearchPage from './pages/public/SearchPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import ProviderPage from './pages/public/ProviderPage';
import CategoryPage from './pages/public/CategoryPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Client pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientBookings from './pages/client/ClientBookings';
import ClientFavorites from './pages/client/ClientFavorites';
import ClientMessages from './pages/client/ClientMessages';

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderServices from './pages/provider/ProviderServices';
import ProviderServiceForm from './pages/provider/ProviderServiceForm';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderCalendar from './pages/provider/ProviderCalendar';
import ProviderReviews from './pages/provider/ProviderReviews';
import ProviderSettings from './pages/provider/ProviderSettings';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProviders from './pages/admin/AdminProviders';
import AdminServices from './pages/admin/AdminServices';
import AdminCategories from './pages/admin/AdminCategories';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ height: '100vh' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/providers/:slug" element={<ProviderPage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" /> : <RegisterPage />
        } />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Client routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['client', 'provider', 'admin']}>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route path="/account" element={<ClientDashboard />} />
          <Route path="/account/bookings" element={<ClientBookings />} />
          <Route path="/account/favorites" element={<ClientFavorites />} />
          <Route path="/account/messages" element={<ClientMessages />} />
        </Route>

        {/* Provider routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderLayout />
          </ProtectedRoute>
        }>
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/provider/services" element={<ProviderServices />} />
          <Route path="/provider/services/new" element={<ProviderServiceForm />} />
          <Route path="/provider/services/:id/edit" element={<ProviderServiceForm />} />
          <Route path="/provider/bookings" element={<ProviderBookings />} />
          <Route path="/provider/calendar" element={<ProviderCalendar />} />
          <Route path="/provider/reviews" element={<ProviderReviews />} />
          <Route path="/provider/settings" element={<ProviderSettings />} />
        </Route>

        {/* Admin routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
