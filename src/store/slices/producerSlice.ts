import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Plan, ProducerStats, PlanStats } from '../../types';

interface ProducerState {
  plans: Plan[];
  stats: ProducerStats | null;
  customers: any[];
  revenue: {
    total: string;
    monthly: string;
    daily: string;
  };
  isLoading: boolean;
  error: string | null;
  selectedPlan: Plan | null;
}

const initialState: ProducerState = {
  plans: [],
  stats: null,
  customers: [],
  revenue: {
    total: '0',
    monthly: '0',
    daily: '0',
  },
  isLoading: false,
  error: null,
  selectedPlan: null,
};

const producerSlice = createSlice({
  name: 'producer',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    },
    addPlan: (state, action: PayloadAction<Plan>) => {
      state.plans.push(action.payload);
    },
    updatePlan: (state, action: PayloadAction<Plan>) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
    },
    setStats: (state, action: PayloadAction<ProducerStats>) => {
      state.stats = action.payload;
    },
    updateStats: (state, action: PayloadAction<Partial<ProducerStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
    setCustomers: (state, action: PayloadAction<any[]>) => {
      state.customers = action.payload;
    },
    addCustomer: (state, action: PayloadAction<any>) => {
      state.customers.push(action.payload);
    },
    updateRevenue: (state, action: PayloadAction<Partial<ProducerState['revenue']>>) => {
      state.revenue = { ...state.revenue, ...action.payload };
    },
    setSelectedPlan: (state, action: PayloadAction<Plan | null>) => {
      state.selectedPlan = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setPlans,
  addPlan,
  updatePlan,
  deletePlan,
  setStats,
  updateStats,
  setCustomers,
  addCustomer,
  updateRevenue,
  setSelectedPlan,
  clearError,
} = producerSlice.actions;

export default producerSlice.reducer;
