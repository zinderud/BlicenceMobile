export interface WalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
  chainId: number;
  networkName: string;
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  usdValue?: number;
}

export interface TransactionResult<T = any> {
  success: boolean;
  result?: T;
  error?: string;
  transactionHash?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export interface WalletConnectConfig {
  projectId: string;
  relayUrl: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface SignedMessage {
  message: string;
  signature: string;
  address: string;
  timestamp: number;
}
