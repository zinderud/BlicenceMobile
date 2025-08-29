export interface NFTMetadata {
  tokenId: number;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  imageUrl: string;
  externalUrl?: string;
  attributes: NFTAttribute[];
  owner: string;
  tokenUri: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTCollection {
  contractAddress: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  externalUrl?: string;
  totalSupply?: number;
}

export interface QRCodeData {
  type: 'PLAN_USAGE' | 'IDENTITY_VERIFICATION' | 'PAYMENT';
  customerPlanId?: number;
  walletAddress?: string;
  signature: string;
  message: string;
  timestamp: number;
  expiresAt: number;
  metadata?: {
    planName?: string;
    usageCount?: number;
    nftTokenId?: number;
  };
}

export interface OfflineProof {
  customerPlanId: number;
  walletAddress: string;
  signature: string;
  messageHash: string;
  timestamp: number;
  expiresAt: number;
  isVerified: boolean;
}
