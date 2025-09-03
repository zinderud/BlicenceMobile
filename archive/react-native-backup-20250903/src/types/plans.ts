export enum PlanTypes {
  api = 0,
  nUsage = 1,
  vestingApi = 2
}

export enum Status {
  inactive = 0,
  active = 1,
  expired = 2
}

// Producer interface matching Solidity DataTypes.Producer
export interface Producer {
  producerId: number;
  producerAddress: string;
  name: string;
  description: string;
  image: string;
  externalLink: string;
  cloneAddress: string;
  exists: boolean;
}

// Plan interface matching Solidity DataTypes.Plan
export interface Plan {
  planId: number;
  cloneAddress: string;
  producerId: number;
  name: string;
  description: string;
  externalLink: string;
  totalSupply: number;
  currentSupply: number;
  backgroundColor: string;
  image: string;
  priceAddress: string;
  startDate: number;
  status: Status;
  planType: PlanTypes;
  custumerPlanIds: number[];
}

// CustomerPlan interface matching Solidity DataTypes.CustomerPlan
export interface CustomerPlan {
  customerAdress: string;
  planId: number;
  custumerPlanId: number;
  producerId: number;
  cloneAddress: string;
  priceAddress: string;
  startDate: number;
  endDate: number;
  remainingQuota: number;
  status: Status;
  planType: PlanTypes;
  // Additional mobile-specific fields
  planName?: string;
  planDescription?: string;
  planImage?: string;
  nftTokenId?: number;
  totalQuota?: number;
  isActive?: boolean;
}

// Customer interface matching Solidity DataTypes.Customer
export interface Customer {
  customer: string;
  customerPlans: CustomerPlan[];
}

// Plan info interfaces matching Solidity DataTypes
export interface PlanInfoApi {
  planId: number;
  flowRate: number;
  perMonthLimit: number;
}

export interface PlanInfoNUsage {
  planId: number;
  oneUsagePrice: number;
  minUsageLimit: number;
  maxUsageLimit: number;
}

export interface PlanInfoVesting {
  planId: number;
  cliffDate: number;
  flowRate: number;
  startAmount: number;
  ctx: Uint8Array;
}

// Legacy interfaces for backward compatibility
export interface PlanInfoAll {
  planId: number;
  oneUsagePrice: number;
  minUsageLimit: number;
  maxUsageLimit: number;
  cliffDate: number;
  flowRate: number;
  startAmount: number;
  ctx: Uint8Array;
}

export interface ApiPlanInfo {
  planId: number;
  flowRate: number;
  ctx: Uint8Array;
}

export interface NUsagePlanInfo {
  planId: number;
  oneUsagePrice: number;
  minUsageLimit: number;
  maxUsageLimit: number;
}

export interface VestingPlanInfo {
  planId: number;
  cliffDate: number;
  startAmount: number;
}

export interface UsageRecord {
  id: number;
  customerPlanId: number;
  usageAmount: number;
  timestamp: number;
  transactionHash: string;
  cost: number;
}

export interface PlanUsageStats {
  customerPlanId: number;
  totalUsed: number;
  remainingUsage: number;
  usagePercentage: number;
  averageUsagePerDay: number;
  lastUsageTime: Date | null;
  totalSpent: number;
  estimatedEndDate: Date | null;
}
