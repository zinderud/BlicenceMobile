import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Plan, MarketplaceFilters, SearchResults } from '../../types';

interface MarketplaceState {
  plans: Plan[];
  featuredPlans: Plan[];
  searchResults: SearchResults | null;
  filters: MarketplaceFilters;
  categories: string[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
}

const initialState: MarketplaceState = {
  plans: [],
  featuredPlans: [],
  searchResults: null,
  filters: {},
  categories: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
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
    setFeaturedPlans: (state, action: PayloadAction<Plan[]>) => {
      state.featuredPlans = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<SearchResults>) => {
      state.searchResults = action.payload;
    },
    appendSearchResults: (state, action: PayloadAction<Plan[]>) => {
      if (state.searchResults) {
        state.searchResults.plans.push(...action.payload);
      }
    },
    setFilters: (state, action: PayloadAction<MarketplaceFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<MarketplaceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.searchQuery = '';
      state.selectedCategory = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
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
  setFeaturedPlans,
  setSearchResults,
  appendSearchResults,
  setFilters,
  updateFilters,
  setCategories,
  setSearchQuery,
  setSelectedCategory,
  clearFilters,
  clearSearchResults,
  clearError,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
