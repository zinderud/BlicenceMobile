import { ethers, JsonRpcProvider, formatEther } from 'ethers';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Plan, CustomerPlan, Producer, PlanTypes, Status, PlanInfoApi, PlanInfoNUsage, PlanInfoVesting } from '../types/plans';
import FactoryABI from '../contracts/abis/Factory.json';
import ProducerABI from '../contracts/abis/Producer.json';

export interface WalletConnection {
  address: string;
  provider: JsonRpcProvider;
  signer: ethers.Signer;
  chainId: number;
}

export interface ContractAddresses {
  blicenceFactory: string;
  producerStorage: string;
  streamLockManager: string;
  uriGenerator: string;
  producerNUsage: string;
  producerVesting: string;
  producerApi: string;
}

class BlockchainService {
  private provider: JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private walletAddress: string | null = null;
  
  // Polygon Mumbai testnet configuration
  private readonly CHAIN_CONFIG = {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.polygon.technology/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  };

  // Contract addresses for Mumbai testnet
  private readonly CONTRACT_ADDRESSES: ContractAddresses = {
    blicenceFactory: '0x1234567890123456789012345678901234567890', // TODO: Update with actual addresses
    producerStorage: '0x1234567890123456789012345678901234567891',
    streamLockManager: '0x1234567890123456789012345678901234567892',
    uriGenerator: '0x1234567890123456789012345678901234567893',
    producerNUsage: '0x1234567890123456789012345678901234567894',
    producerVesting: '0x1234567890123456789012345678901234567895',
    producerApi: '0x1234567890123456789012345678901234567896',
  };

  async initializeProvider(): Promise<void> {
    try {
      // Initialize JSON RPC provider for Mumbai testnet
      this.provider = new JsonRpcProvider(
        'https://rpc-mumbai.polygon.technology/'
      );
      
      console.log('Blockchain provider initialized');
    } catch (error) {
      console.error('Failed to initialize provider:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<WalletConnection> {
    // This would integrate with WalletConnect or MetaMask mobile
    // For now, we'll simulate wallet connection
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      // TODO: Implement actual wallet connection logic
      // For development, we'll use a mock connection
      const mockWallet = ethers.Wallet.createRandom().connect(this.provider!);
      
      this.signer = mockWallet;
      this.walletAddress = await mockWallet.getAddress();

      // Store wallet info securely
      await this.storeWalletInfo(this.walletAddress);

      const network = await this.provider!.getNetwork();
      const chainId = Number(network.chainId);

      return {
        address: this.walletAddress,
        provider: this.provider!,
        signer: this.signer,
        chainId,
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      this.signer = null;
      this.walletAddress = null;
      await EncryptedStorage.removeItem('wallet_address');
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  async getWalletAddress(): Promise<string | null> {
    if (this.walletAddress) {
      return this.walletAddress;
    }
    
    try {
      const storedAddress = await EncryptedStorage.getItem('wallet_address');
      return storedAddress;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }

  async getBalance(): Promise<string> {
    try {
      if (!this.provider || !this.walletAddress) {
        throw new Error('Wallet not connected');
      }

      const balance = await this.provider.getBalance(this.walletAddress);
      return formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async getContractAddresses(): Promise<ContractAddresses> {
    return this.CONTRACT_ADDRESSES;
  }

  private async storeWalletInfo(address: string): Promise<void> {
    try {
      await EncryptedStorage.setItem('wallet_address', address);
    } catch (error) {
      console.error('Failed to store wallet info:', error);
      throw error;
    }
  }

  // ========== FACTORY CONTRACT METHODS ==========

  /**
   * Create a new producer contract (Bcontract)
   */
  async createProducer(producerData: {
    name: string;
    description: string;
    image: string;
    externalLink: string;
  }): Promise<string> {
    try {
      if (!this.signer || !this.provider) {
        throw new Error('Wallet not connected');
      }

      const factoryContract = new ethers.Contract(
        this.CONTRACT_ADDRESSES.blicenceFactory,
        FactoryABI,
        this.signer
      );

      const tx = await factoryContract.newBcontract({
        producerId: 0, // Will be set by contract
        producerAddress: await this.signer.getAddress(),
        name: producerData.name,
        description: producerData.description,
        image: producerData.image,
        externalLink: producerData.externalLink,
        cloneAddress: ethers.ZeroAddress, // Will be set by contract
        exists: true
      });

      const receipt = await tx.wait();
      console.log('Producer created:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to create producer:', error);
      throw error;
    }
  }

  /**
   * Get current producer ID
   */
  async getCurrentProducerId(): Promise<number> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const factoryContract = new ethers.Contract(
        this.CONTRACT_ADDRESSES.blicenceFactory,
        FactoryABI,
        this.provider
      );

      const currentId = await factoryContract.currentPR_ID();
      return Number(currentId);
    } catch (error) {
      console.error('Failed to get current producer ID:', error);
      throw error;
    }
  }

  // ========== PRODUCER CONTRACT METHODS ==========

  /**
   * Get producer contract instance
   */
  private getProducerContract(producerAddress: string): ethers.Contract {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return new ethers.Contract(producerAddress, ProducerABI, this.signer);
  }

  /**
   * Get producer details
   */
  async getProducer(producerContractAddress: string): Promise<Producer> {
    try {
      const contract = this.getProducerContract(producerContractAddress);
      const producer = await contract.getProducer();
      
      return {
        producerId: Number(producer.producerId),
        producerAddress: producer.producerAddress,
        name: producer.name,
        description: producer.description,
        image: producer.image,
        externalLink: producer.externalLink,
        cloneAddress: producer.cloneAddress,
        exists: producer.exists
      };
    } catch (error) {
      console.error('Failed to get producer:', error);
      throw error;
    }
  }

  /**
   * Create a new plan
   */
  async createPlan(producerContractAddress: string, planData: {
    name: string;
    description: string;
    externalLink: string;
    totalSupply: number;
    backgroundColor: string;
    image: string;
    priceAddress: string;
    startDate: number;
    planType: PlanTypes;
  }): Promise<string> {
    try {
      const contract = this.getProducerContract(producerContractAddress);
      
      const tx = await contract.addPlan({
        planId: 0, // Will be set by contract
        cloneAddress: producerContractAddress,
        producerId: 0, // Will be set by contract
        name: planData.name,
        description: planData.description,
        externalLink: planData.externalLink,
        totalSupply: planData.totalSupply,
        currentSupply: 0,
        backgroundColor: planData.backgroundColor,
        image: planData.image,
        priceAddress: planData.priceAddress,
        startDate: planData.startDate,
        status: Status.active,
        planType: planData.planType,
        custumerPlanIds: []
      });

      const receipt = await tx.wait();
      console.log('Plan created:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to create plan:', error);
      throw error;
    }
  }

  /**
   * Add plan info for NUsage plans
   */
  async addPlanInfoNUsage(producerContractAddress: string, planInfo: PlanInfoNUsage): Promise<string> {
    try {
      const contract = this.getProducerContract(producerContractAddress);
      
      const tx = await contract.addPlanInfoNUsage(planInfo);
      const receipt = await tx.wait();
      
      console.log('Plan info NUsage added:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to add plan info NUsage:', error);
      throw error;
    }
  }

  /**
   * Add plan info for API plans
   */
  async addPlanInfoApi(producerContractAddress: string, planInfo: PlanInfoApi): Promise<string> {
    try {
      const contract = this.getProducerContract(producerContractAddress);
      
      const tx = await contract.addPlanInfoApi(planInfo);
      const receipt = await tx.wait();
      
      console.log('Plan info API added:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to add plan info API:', error);
      throw error;
    }
  }

  /**
   * Add plan info for Vesting plans
   */
  async addPlanInfoVesting(producerContractAddress: string, planInfo: PlanInfoVesting): Promise<string> {
    try {
      const contract = this.getProducerContract(producerContractAddress);
      
      const tx = await contract.addPlanInfoVesting(planInfo);
      const receipt = await tx.wait();
      
      console.log('Plan info Vesting added:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to add plan info Vesting:', error);
      throw error;
    }
  }

  /**
   * Get all plans for a producer
   */
  async getProducerPlans(producerContractAddress: string): Promise<Plan[]> {
    try {
      const contract = this.getProducerContract(producerContractAddress);
      const plans = await contract.getPlans();
      
      return plans.map((plan: any) => ({
        planId: Number(plan.planId),
        cloneAddress: plan.cloneAddress,
        producerId: Number(plan.producerId),
        name: plan.name,
        description: plan.description,
        externalLink: plan.externalLink,
        totalSupply: Number(plan.totalSupply),
        currentSupply: Number(plan.currentSupply),
        backgroundColor: plan.backgroundColor,
        image: plan.image,
        priceAddress: plan.priceAddress,
        startDate: Number(plan.startDate),
        status: plan.status,
        planType: plan.planType,
        custumerPlanIds: plan.custumerPlanIds.map((id: any) => Number(id))
      }));
    } catch (error) {
      console.error('Failed to get producer plans:', error);
      throw error;
    }
  }

  /**
   * Get specific plan details
   */
  async getPlanDetails(producerContractAddress: string, planId: number): Promise<Plan> {
    try {
      const contract = this.getProducerContract(producerContractAddress);
      const plan = await contract.getPlan(planId);
      
      return {
        planId: Number(plan.planId),
        cloneAddress: plan.cloneAddress,
        producerId: Number(plan.producerId),
        name: plan.name,
        description: plan.description,
        externalLink: plan.externalLink,
        totalSupply: Number(plan.totalSupply),
        currentSupply: Number(plan.currentSupply),
        backgroundColor: plan.backgroundColor,
        image: plan.image,
        priceAddress: plan.priceAddress,
        startDate: Number(plan.startDate),
        status: plan.status,
        planType: plan.planType,
        custumerPlanIds: plan.custumerPlanIds.map((id: any) => Number(id))
      };
    } catch (error) {
      console.error('Failed to get plan details:', error);
      throw error;
    }
  }

  /**
   * Purchase a plan (create customer plan)
   */
  async purchasePlan(producerContractAddress: string, customerPlanData: {
    planId: number;
    remainingQuota: number;
    endDate: number;
  }): Promise<string> {
    try {
      if (!this.walletAddress) {
        throw new Error('Wallet not connected');
      }

      const contract = this.getProducerContract(producerContractAddress);
      
      const tx = await contract.addCustomerPlan({
        customerAdress: this.walletAddress,
        planId: customerPlanData.planId,
        custumerPlanId: 0, // Will be set by contract
        producerId: 0, // Will be set by contract
        cloneAddress: producerContractAddress,
        priceAddress: ethers.ZeroAddress, // Will be set by contract
        startDate: Math.floor(Date.now() / 1000),
        endDate: customerPlanData.endDate,
        remainingQuota: customerPlanData.remainingQuota,
        status: Status.active,
        planType: PlanTypes.nUsage // This should be determined from plan
      });

      const receipt = await tx.wait();
      console.log('Plan purchased:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to purchase plan:', error);
      throw error;
    }
  }

  /**
   * Use quota from a customer plan
   */
  async useQuota(producerContractAddress: string, customerPlanId: number): Promise<string> {
    try {
      if (!this.walletAddress) {
        throw new Error('Wallet not connected');
      }

      const contract = this.getProducerContract(producerContractAddress);
      
      // First, we need to get customer plan details to construct the full object
      const customer = await contract.getCustomer(this.walletAddress);
      const customerPlan = customer.customerPlans.find((cp: any) => Number(cp.custumerPlanId) === customerPlanId);
      
      if (!customerPlan) {
        throw new Error('Customer plan not found');
      }

      const tx = await contract.useFromQuota(customerPlan);
      const receipt = await tx.wait();
      
      console.log('Quota used:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to use quota:', error);
      throw error;
    }
  }

  /**
   * Get customer plans for current user
   */
  async getUserPlans(producerContractAddress: string): Promise<CustomerPlan[]> {
    try {
      if (!this.walletAddress) {
        throw new Error('Wallet not connected');
      }

      const contract = this.getProducerContract(producerContractAddress);
      const customer = await contract.getCustomer(this.walletAddress);
      
      return customer.customerPlans.map((cp: any) => ({
        customerAdress: cp.customerAdress,
        planId: Number(cp.planId),
        custumerPlanId: Number(cp.custumerPlanId),
        producerId: Number(cp.producerId),
        cloneAddress: cp.cloneAddress,
        priceAddress: cp.priceAddress,
        startDate: Number(cp.startDate),
        endDate: Number(cp.endDate),
        remainingQuota: Number(cp.remainingQuota),
        status: cp.status,
        planType: cp.planType
      }));
    } catch (error) {
      console.error('Failed to get user plans:', error);
      throw error;
    }
  }

  /**
   * Check stream before usage
   */
  async checkStreamBeforeUsage(producerContractAddress: string, customerPlanId: number): Promise<boolean> {
    try {
      if (!this.walletAddress) {
        throw new Error('Wallet not connected');
      }

      const contract = this.getProducerContract(producerContractAddress);
      const canUse = await contract.checkStreamBeforeUsage(customerPlanId, this.walletAddress);
      
      return canUse;
    } catch (error) {
      console.error('Failed to check stream:', error);
      throw error;
    }
  }
}

export default new BlockchainService();
