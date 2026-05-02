import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          // Backend wraps response in { success, data }
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: Record<string, unknown>) => api.post('/admin/categories', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/admin/categories/${id}`, data),
  delete: (id: string) => api.delete(`/admin/categories/${id}`),
};

// Services API
export const servicesApi = {
  search: (params: Record<string, unknown>) => api.get('/services', { params }),
  getFeatured: (limit = 8) => api.get('/services/featured', { params: { limit } }),
  getById: (id: string) => api.get(`/services/${id}`),
  getReviews: (serviceId: string, page = 1, limit = 10) =>
    api.get(`/services/${serviceId}/reviews`, { params: { page, limit } }),
  getAvailability: (serviceId: string) =>
    api.get(`/services/${serviceId}/availability`),
  getAvailableDates: (serviceId: string, month: number, year: number) =>
    api.get(`/services/${serviceId}/availability/dates`, { params: { month, year } }),
};

// Provider Services API
export const providerServicesApi = {
  getAll: (page = 1, limit = 10) =>
    api.get('/provider/services', { params: { page, limit } }),
  getById: (id: string) => api.get(`/provider/services/${id}`),
  create: (data: Record<string, unknown>) => api.post('/provider/services', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/provider/services/${id}`, data),
  delete: (id: string) => api.delete(`/provider/services/${id}`),
  addImages: (id: string, images: { url: string; publicId?: string }[]) =>
    api.post(`/provider/services/${id}/images`, { images }),
  deleteImage: (serviceId: string, imageId: string) =>
    api.delete(`/provider/services/${serviceId}/images/${imageId}`),
  addPackage: (serviceId: string, data: Record<string, unknown>) =>
    api.post(`/provider/services/${serviceId}/packages`, data),
  updatePackage: (serviceId: string, packageId: string, data: Record<string, unknown>) =>
    api.patch(`/provider/services/${serviceId}/packages/${packageId}`, data),
  deletePackage: (serviceId: string, packageId: string) =>
    api.delete(`/provider/services/${serviceId}/packages/${packageId}`),
};

// Bookings API
export const bookingsApi = {
  create: (data: Record<string, unknown>) => api.post('/bookings', data),
  getMyBookings: (page = 1, limit = 10, status?: string) =>
    api.get('/bookings', { params: { page, limit, status } }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string, reason?: string) =>
    api.post(`/bookings/${id}/cancel`, { reason }),
};

// Provider Bookings API
export const providerBookingsApi = {
  getAll: (page = 1, limit = 10, status?: string) =>
    api.get('/provider/bookings', { params: { page, limit, status } }),
  getById: (id: string) => api.get(`/provider/bookings/${id}`),
  getStats: () => api.get('/provider/bookings/stats'),
  getCalendar: (start: string, end: string) =>
    api.get('/provider/bookings/calendar', { params: { start, end } }),
  create: (data: Record<string, unknown>) => api.post('/provider/bookings', data),
  confirm: (id: string) => api.post(`/provider/bookings/${id}/confirm`),
  reject: (id: string, reason?: string) =>
    api.post(`/provider/bookings/${id}/reject`, { reason }),
  complete: (id: string) => api.post(`/provider/bookings/${id}/complete`),
  markNoShow: (id: string) => api.post(`/provider/bookings/${id}/no-show`),
};

// Providers API
export const providersApi = {
  register: (data: Record<string, unknown>) => api.post('/providers/register', data),
  getProfile: () => api.get('/providers/profile'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/providers/profile', data),
  getBySlug: (slug: string) => api.get(`/providers/${slug}`),
  getDashboardStats: () => api.get('/providers/dashboard/stats'),
};

// Reviews API
export const reviewsApi = {
  create: (bookingId: string, data: { rating: number; comment?: string }) =>
    api.post(`/bookings/${bookingId}/review`, data),
  getMyReviews: (page = 1, limit = 10) =>
    api.get('/reviews/my', { params: { page, limit } }),
  update: (id: string, data: { rating?: number; comment?: string }) =>
    api.patch(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  getProviderReviews: (page = 1, limit = 10) =>
    api.get('/provider/reviews', { params: { page, limit } }),
  respond: (id: string, response: string) =>
    api.post(`/provider/reviews/${id}/respond`, { response }),
};

// Favorites API
export const favoritesApi = {
  getAll: (page = 1, limit = 12) =>
    api.get('/favorites', { params: { page, limit } }),
  add: (serviceId: string) => api.post(`/favorites/${serviceId}`),
  remove: (serviceId: string) => api.delete(`/favorites/${serviceId}`),
  check: (serviceId: string) => api.get(`/favorites/${serviceId}/check`),
};

// Messages API
export const messagesApi = {
  getConversations: () => api.get('/conversations'),
  startConversation: (providerId: string, serviceId?: string) =>
    api.post('/conversations', { providerId, serviceId }),
  getConversation: (id: string) => api.get(`/conversations/${id}`),
  getMessages: (conversationId: string, page = 1, limit = 50) =>
    api.get(`/conversations/${conversationId}/messages`, { params: { page, limit } }),
  sendMessage: (conversationId: string, content: string, attachmentUrl?: string) =>
    api.post(`/conversations/${conversationId}/messages`, { content, attachmentUrl }),
  markAsRead: (conversationId: string) =>
    api.post(`/conversations/${conversationId}/read`),
  getUnreadCount: () => api.get('/conversations/unread-count'),
};

// Notifications API
export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get('/notifications', { params: { page, limit } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Payments API
export const paymentsApi = {
  createIntent: (bookingId: string, type: 'deposit' | 'full' | 'remaining', amount?: number) =>
    api.post('/payments/create-intent', { bookingId, type, amount }),
  getByBooking: (bookingId: string) =>
    api.get(`/payments/booking/${bookingId}`),
};

// Provider Stripe API
export const providerStripeApi = {
  startOnboarding: () => api.post('/provider/stripe/onboard'),
  getStatus: () => api.get('/provider/stripe/status'),
  getPayouts: (page = 1, limit = 10) =>
    api.get('/provider/stripe/payouts', { params: { page, limit } }),
};

// Users API
export const usersApi = {
  updateProfile: (data: Record<string, unknown>) => api.patch('/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/users/change-password', data),
  getProfile: () => api.get('/users/profile'),
};

// Availability API
export const availabilityApi = {
  getWeeklySchedule: (serviceId: string) =>
    api.get(`/availability/${serviceId}/weekly`),
  setWeeklySchedule: (serviceId: string, schedule: Record<string, unknown>[]) =>
    api.put(`/availability/${serviceId}/weekly`, { schedule }),
  getBlockedDates: (serviceId: string, startDate: string, endDate: string) =>
    api.get(`/availability/${serviceId}/blocked`, { params: { startDate, endDate } }),
  addBlockedDate: (serviceId: string, data: { date: string; reason?: string }) =>
    api.post(`/availability/${serviceId}/blocked`, data),
  removeBlockedDate: (serviceId: string, blockedDateId: string) =>
    api.delete(`/availability/${serviceId}/blocked/${blockedDateId}`),
  checkAvailability: (serviceId: string, date: string, startTime?: string, endTime?: string) =>
    api.get(`/availability/${serviceId}/check`, { params: { date, startTime, endTime } }),
};

// Upload API
export const uploadApi = {
  upload: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { folder },
    });
  },
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { folder },
    });
  },
  uploadImages: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { folder },
    });
  },
  deleteImage: (publicId: string) => api.delete(`/upload/${publicId}`),
  getSignature: (folder?: string) =>
    api.get('/upload/signature', { params: { folder } }),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRevenueChart: (months = 12) =>
    api.get('/admin/dashboard/revenue', { params: { months } }),
  getUsers: (page = 1, limit = 10, role?: string, search?: string) =>
    api.get('/admin/users', { params: { page, limit, role, search } }),
  updateUser: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getProviders: (page = 1, limit = 10, verified?: boolean, search?: string) =>
    api.get('/admin/providers', { params: { page, limit, verified, search } }),
  verifyProvider: (id: string, verified: boolean) =>
    api.patch(`/admin/providers/${id}/verify`, { verified }),
  featureProvider: (id: string, featured: boolean) =>
    api.patch(`/admin/providers/${id}/feature`, { featured }),
  getServices: (params: { page?: number; limit?: number; status?: string; category?: string; search?: string }) =>
    api.get('/admin/services', { params }),
  approveService: (id: string) => api.post(`/admin/services/${id}/approve`),
  rejectService: (id: string, reason: string) =>
    api.post(`/admin/services/${id}/reject`, { reason }),
  featureService: (id: string, featured: boolean) =>
    api.patch(`/admin/services/${id}/feature`, { featured }),
  toggleFeatured: (id: string) => api.patch(`/admin/services/${id}/toggle-featured`),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`),
  getReviews: (page = 1, limit = 10) =>
    api.get('/admin/reviews', { params: { page, limit } }),
  toggleReviewVisibility: (id: string) =>
    api.patch(`/admin/reviews/${id}/visibility`),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
};
