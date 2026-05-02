import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingsApi, providerBookingsApi } from '../../api/client';
import { Booking, BookingStatus } from '../../types';

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    todayBookings: number;
  } | null;
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  stats: null,
};

export const fetchClientBookings = createAsyncThunk(
  'bookings/fetchClient',
  async ({ page, limit, status }: { page?: number; limit?: number; status?: BookingStatus }) => {
    const response = await bookingsApi.getMyBookings(page, limit, status);
    return response.data;
  }
);

export const fetchProviderBookings = createAsyncThunk(
  'bookings/fetchProvider',
  async ({ page, limit, status }: { page?: number; limit?: number; status?: BookingStatus }) => {
    const response = await providerBookingsApi.getAll(page, limit, status);
    return response.data;
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id: string) => {
    const response = await bookingsApi.getById(id);
    return response.data.booking;
  }
);

export const fetchProviderBookingStats = createAsyncThunk(
  'bookings/fetchStats',
  async () => {
    const response = await providerBookingsApi.getStats();
    return response.data.stats;
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (data: Record<string, unknown>) => {
    const response = await bookingsApi.create(data);
    return response.data.booking;
  }
);

export const confirmBooking = createAsyncThunk(
  'bookings/confirm',
  async (id: string) => {
    const response = await providerBookingsApi.confirm(id);
    return response.data.booking;
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async ({ id, reason }: { id: string; reason?: string }) => {
    const response = await bookingsApi.cancel(id, reason);
    return response.data.booking;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch client bookings
      .addCase(fetchClientBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClientBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.meta = action.payload.meta;
      })
      .addCase(fetchClientBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      // Fetch provider bookings
      .addCase(fetchProviderBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProviderBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProviderBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      // Fetch by ID
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
      })
      // Fetch stats
      .addCase(fetchProviderBookingStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create booking';
      })
      // Confirm booking
      .addCase(confirmBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentBooking, clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
