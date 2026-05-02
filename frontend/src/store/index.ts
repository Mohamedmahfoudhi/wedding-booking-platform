import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import servicesReducer from './slices/servicesSlice';
import bookingsReducer from './slices/bookingsSlice';
import categoriesReducer from './slices/categoriesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    bookings: bookingsReducer,
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
