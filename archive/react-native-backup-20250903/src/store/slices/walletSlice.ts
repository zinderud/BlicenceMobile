import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletInfo } from '../../types';

interface WalletState {
  isConnected: boolean;
  walletInfo: WalletInfo | null;
  balance: string;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
  connectionAttempts: number;
}

const initialState: WalletState = {
  isConnected: false,
  walletInfo: null,
  balance: '0',
  chainId: null,
  isLoading: false,
  error: null,
  connectionAttempts: 0,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        state.walletInfo = null;
        state.balance = '0';
        state.chainId = null;
      }
    },
    setWalletInfo: (state, action: PayloadAction<WalletInfo>) => {
      state.walletInfo = action.payload;
      state.isConnected = action.payload.isConnected;
      state.balance = action.payload.balance;
      state.chainId = action.payload.chainId;
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
      if (state.walletInfo) {
        state.walletInfo.balance = action.payload;
      }
    },
    setChainId: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
      if (state.walletInfo) {
        state.walletInfo.chainId = action.payload;
      }
    },
    incrementConnectionAttempts: (state) => {
      state.connectionAttempts += 1;
    },
    resetConnectionAttempts: (state) => {
      state.connectionAttempts = 0;
    },
    disconnect: (state) => {
      state.isConnected = false;
      state.walletInfo = null;
      state.balance = '0';
      state.chainId = null;
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
  setConnected,
  setWalletInfo,
  setBalance,
  setChainId,
  incrementConnectionAttempts,
  resetConnectionAttempts,
  disconnect,
  clearError,
} = walletSlice.actions;

export default walletSlice.reducer;
