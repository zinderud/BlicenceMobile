import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authSlice from './slices/authSlice';
import customerSlice from './slices/customerSlice';
import producerSlice from './slices/producerSlice';
import marketplaceSlice from './slices/marketplaceSlice';
import walletSlice from './slices/walletSlice';
import settingsSlice from './slices/settingsSlice';
import notificationSlice from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    customer: customerSlice,
    producer: producerSlice,
    marketplace: marketplaceSlice,
    wallet: walletSlice,
    settings: settingsSlice,
    notifications: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
