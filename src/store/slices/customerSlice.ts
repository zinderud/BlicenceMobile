import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerPlan, Plan, UsageData } from '../../types';

interface CustomerState {
  plans: CustomerPlan[];
  activePlans: CustomerPlan[];
  expiredPlans: CustomerPlan[];
  isLoading: boolean;
  error: string | null;
  selectedPlan: CustomerPlan | null;
  usageHistory: any[];
}

const initialState: CustomerState = {
  plans: [],
  activePlans: [],
  expiredPlans: [],
  isLoading: false,
  error: null,
  selectedPlan: null,
  usageHistory: [],
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPlans: (state, action: PayloadAction<CustomerPlan[]>) => {
      state.plans = action.payload;
      state.activePlans = action.payload.filter(plan => plan.status === 'ACTIVE');
      state.expiredPlans = action.payload.filter(plan => plan.status === 'EXPIRED');
    },
    addPlan: (state, action: PayloadAction<CustomerPlan>) => {
      state.plans.push(action.payload);
      if (action.payload.status === 'ACTIVE') {
        state.activePlans.push(action.payload);
      }
    },
    updatePlan: (state, action: PayloadAction<CustomerPlan>) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
      
      // Update filtered lists
      state.activePlans = state.plans.filter(plan => plan.status === 'ACTIVE');
      state.expiredPlans = state.plans.filter(plan => plan.status === 'EXPIRED');
    },
    updatePlanUsage: (state, action: PayloadAction<{ customerPlanId: string; usageData: UsageData }>) => {
      const plan = state.plans.find(p => p.id === action.payload.customerPlanId);
      if (plan) {
        plan.usageData = action.payload.usageData;
      }
    },
    setSelectedPlan: (state, action: PayloadAction<CustomerPlan | null>) => {
      state.selectedPlan = action.payload;
    },
    addUsageHistory: (state, action: PayloadAction<any>) => {
      state.usageHistory.unshift(action.payload);
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
  updatePlanUsage,
  setSelectedPlan,
  addUsageHistory,
  clearError,
} = customerSlice.actions;

export default customerSlice.reducer;
