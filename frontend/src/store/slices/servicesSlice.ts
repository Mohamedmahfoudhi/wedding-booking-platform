import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { servicesApi } from '../../api/client';
import { Service, ServiceFilters } from '../../types';

interface ServicesState {
  services: Service[];
  featuredServices: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
  filters: ServiceFilters;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ServicesState = {
  services: [],
  featuredServices: [],
  currentService: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 12,
    sortBy: 'newest',
    sortOrder: 'desc',
  },
  meta: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
};

export const searchServices = createAsyncThunk(
  'services/search',
  async (filters: ServiceFilters) => {
    const response = await servicesApi.search(filters);
    return response.data;
  }
);

export const fetchFeaturedServices = createAsyncThunk(
  'services/fetchFeatured',
  async (limit: number = 8) => {
    const response = await servicesApi.getFeatured(limit);
    return response.data.services;
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchById',
  async (id: string) => {
    const response = await servicesApi.getById(id);
    return response.data.service;
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ServiceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search services
      .addCase(searchServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.services;
        state.meta = action.payload.meta;
      })
      .addCase(searchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search services';
      })
      // Featured services
      .addCase(fetchFeaturedServices.fulfilled, (state, action) => {
        state.featuredServices = action.payload;
      })
      // Fetch by ID
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch service';
      });
  },
});

export const { setFilters, clearFilters, clearCurrentService } = servicesSlice.actions;
export default servicesSlice.reducer;
