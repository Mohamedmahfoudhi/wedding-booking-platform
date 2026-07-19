export enum UserRole {
  CLIENT = 'client',
  PROVIDER = 'provider',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  governorate?: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  isFeatured: boolean;
  stripeAccountId?: string;
  stripeOnboarded: boolean;
  commissionRate: number;
  totalRevenue: number;
  totalBookings: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  user?: User;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  serviceCount?: number;
}

export enum PriceType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  DAILY = 'daily',
  CUSTOM = 'custom',
}

export enum ServiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ServiceImage {
  id: string;
  url: string;
  publicId?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  features?: string[];
  isPopular: boolean;
  displayOrder: number;
}

export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  basePrice: number;
  priceType: PriceType;
  durationMinutes?: number;
  capacityMin?: number;
  capacityMax?: number;
  location?: string;
  isActive: boolean;
  isFeatured: boolean;
  status: ServiceStatus;
  avgRating: number;
  reviewCount: number;
  bookingCount: number;
  viewCount: number;
  createdAt: string;
  provider?: ProviderProfile;
  category?: Category;
  images?: ServiceImage[];
  packages?: ServicePackage[];
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum BookingSource {
  MARKETPLACE = 'marketplace',
  SAAS = 'saas',
}

export interface Booking {
  id: string;
  bookingNumber: string;
  serviceId: string;
  packageId?: string;
  clientId: string;
  providerId: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  source: BookingSource;
  status: BookingStatus;
  subtotal: number;
  discount: number;
  total: number;
  depositAmount?: number;
  depositPaid: boolean;
  fullyPaid: boolean;
  notes?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  service?: Service;
  client?: User;
  provider?: ProviderProfile;
  package?: ServicePackage;
}

export interface Review {
  id: string;
  bookingId: string;
  serviceId: string;
  clientId: string;
  rating: number;
  comment?: string;
  providerResponse?: string;
  responseDate?: string;
  isVisible: boolean;
  createdAt: string;
  client?: User;
  service?: Service;
}

export interface Favorite {
  id: string;
  userId: string;
  serviceId: string;
  createdAt: string;
  service?: Service;
}

export interface Conversation {
  id: string;
  clientId: string;
  providerId: string;
  serviceId?: string;
  bookingId?: string;
  lastMessageAt?: string;
  createdAt: string;
  client?: User;
  provider?: ProviderProfile;
  service?: Service;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  stripePaymentId?: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'full' | 'remaining';
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  method?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ServiceFilters {
  category?: string;
  city?: string;
  governorate?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  date?: string;
  capacity?: number;
  featured?: boolean;
  sortBy?: 'price' | 'rating' | 'reviews' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
