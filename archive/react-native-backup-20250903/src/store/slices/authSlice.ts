import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, AuthSession } from '../../types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  session: null,
  walletAddress: null,
  userType: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.walletAddress = action.payload;
    },
    setUserType: (state, action: PayloadAction<'customer' | 'producer'>) => {
      state.userType = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setSession: (state, action: PayloadAction<AuthSession>) => {
      state.session = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<User['profile']>>) => {
      if (state.user) {
        state.user.profile = { ...state.user.profile, ...action.payload };
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.session = null;
      state.walletAddress = null;
      state.userType = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setWalletAddress,
  setUserType,
  setUser,
  setSession,
  updateProfile,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
