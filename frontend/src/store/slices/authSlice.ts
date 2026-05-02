import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/client';
import { User, LoginResponse } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }
    const response = await authApi.me();
    // Backend wraps response in { success, data }
    const data = response.data as { success: boolean; data: { user: User } };
    return data.data.user;
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return rejectWithValue('Session expired');
  }
});

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      // Backend wraps response in { success, data }
      const data = (response.data as { success: boolean; data: LoginResponse }).data;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.user;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    data: { email: string; password: string; firstName?: string; lastName?: string; role?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.register(data);
      // Backend wraps response in { success, data }
      const responseData = (response.data as { success: boolean; data: LoginResponse }).data;
      localStorage.setItem('accessToken', responseData.accessToken);
      localStorage.setItem('refreshToken', responseData.refreshToken);
      return responseData.user;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    await authApi.logout(refreshToken || undefined);
  } catch (error) {
    // Ignore errors, still clear local storage
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
