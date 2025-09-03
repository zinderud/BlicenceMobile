// Auth related types
export interface User {
  id: string;
  walletAddress: string;
  userType: 'customer' | 'producer';
  profile: UserProfile;
  createdAt: string;
  lastActiveAt: string;
}

export interface UserProfile {
  displayName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  social?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: AuthSession | null;
  walletAddress: string | null;
  userType: 'customer' | 'producer' | null;
  isLoading: boolean;
  error: string | null;
}

// Plan related types
export interface Plan {
  id: string;
  name: string;
  description: string;
  type: PlanType;
  price: string; // ETH amount as string
  maxUsage: number;
  duration: number; // in days
  features: string[];
  producerAddress: string;
  contractAddress: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: PlanMetadata;
}

export type PlanType = 'API' | 'N_USAGE' | 'VESTING';

export interface PlanMetadata {
  category: string;
  tags: string[];
  images: string[];
  documentation?: string;
  supportContact?: string;
  apiEndpoint?: string;
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}

// Customer Plan types
export interface CustomerPlan {
  id: string;
  planId: string;
  plan: Plan;
  customerAddress: string;
  purchaseDate: string;
  expiryDate: string;
  status: CustomerPlanStatus;
  usageData: UsageData;
  nftTokenId?: string;
  qrCode?: string;
  transactions: PlanTransaction[];
}

export type CustomerPlanStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PAUSED';

export interface UsageData {
  totalUsed: number;
  dailyUsage: DailyUsage[];
  lastUsedAt?: string;
  remainingUsage: number;
}

export interface DailyUsage {
  date: string;
  count: number;
  details?: UsageDetail[];
}

export interface UsageDetail {
  timestamp: string;
  endpoint?: string;
  responseTime?: number;
  status: 'success' | 'error';
  metadata?: Record<string, any>;
}

// Transaction types
export interface PlanTransaction {
  id: string;
  type: TransactionType;
  amount: string;
  currency: 'ETH' | 'MATIC' | 'BNB';
  fromAddress: string;
  toAddress: string;
  txHash: string;
  blockNumber: number;
  status: TransactionStatus;
  timestamp: string;
  gasUsed?: string;
  gasFee?: string;
}

export type TransactionType = 'PURCHASE' | 'USAGE_PAYMENT' | 'REFUND' | 'COMMISSION';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

// Producer related types
export interface ProducerStats {
  totalPlans: number;
  totalCustomers: number;
  totalRevenue: string;
  monthlyRevenue: string;
  averageRating: number;
  planStats: PlanStats[];
}

export interface PlanStats {
  planId: string;
  planName: string;
  totalCustomers: number;
  activeCustomers: number;
  revenue: string;
  usageCount: number;
  averageUsagePerCustomer: number;
}

// Marketplace types
export interface MarketplaceFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  planType?: PlanType;
  rating?: number;
  features?: string[];
  sortBy?: 'price' | 'rating' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResults {
  plans: Plan[];
  totalCount: number;
  hasMore: boolean;
  filters: MarketplaceFilters;
}

// Navigation types
export interface RootStackParamList {
  // Auth flows
  Welcome: undefined;
  WalletConnect: undefined;
  UserTypeSelection: undefined;
  ProfileSetup: undefined;
  
  // Main app
  MainTabs: undefined;
  
  // Customer flows
  PlanDetails: { planId: string };
  PurchasePlan: { plan: Plan };
  MyPlans: undefined;
  PlanUsage: { customerPlanId: string };
  QRScanner: { customerPlanId: string };
  
  // Producer flows
  CreatePlan: undefined;
  EditPlan: { planId: string };
  ProducerDashboard: undefined;
  CustomerManagement: undefined;
  Analytics: undefined;
  
  // Shared
  Settings: undefined;
  Profile: undefined;
  Support: undefined;
  Notifications: undefined;
}

export interface CustomerTabParamList {
  Marketplace: undefined;
  MyPlans: undefined;
  Wallet: undefined;
  Profile: undefined;
}

export interface ProducerTabParamList {
  Dashboard: undefined;
  Plans: undefined;
  Customers: undefined;
  Analytics: undefined;
  Profile: undefined;
}

// Component prop types
export interface ComponentProps {
  children?: any;
  style?: any;
  testID?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  read: boolean;
  timestamp: number;
}

export type NotificationType = 
  | 'PLAN_PURCHASED'
  | 'PLAN_EXPIRED'
  | 'USAGE_LIMIT_REACHED'
  | 'PAYMENT_RECEIVED'
  | 'NEW_CUSTOMER'
  | 'PLAN_ACTIVATED'
  | 'SECURITY_ALERT'
  | 'UPDATE_AVAILABLE';

// Wallet types
export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
  provider?: any;
}

export interface WalletConnectionOptions {
  chainId?: number;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  chainName?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
