import { ethers } from 'ethers';
import EncryptedStorage from 'react-native-encrypted-storage';

export interface NFTMetadata {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  planId: string;
  planType: 'api' | 'vesting' | 'nusage';
  customerPlanId: string;
  issuedAt: string;
  expiresAt?: string;
}

export interface PlanNFT {
  tokenId: string;
  metadata: NFTMetadata;
  owner: string;
  isActive: boolean;
}

class NFTService {
  private readonly NFT_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567894'; // TODO: Update with actual address
  
  // NFT Contract ABI (simplified)
  private readonly NFT_ABI = [
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function balanceOf(address owner) view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
    'function mint(address to, uint256 planId, string memory metadataURI) returns (uint256)',
    'function burn(uint256 tokenId)',
    'function updateMetadata(uint256 tokenId, string memory newMetadataURI)',
  ];

  async getUserNFTs(userAddress: string): Promise<PlanNFT[]> {
    try {
      // TODO: Implement actual blockchain interaction
      // For now, returning mock data
      const mockNFTs: PlanNFT[] = [
        {
          tokenId: '1',
          owner: userAddress,
          isActive: true,
          metadata: {
            id: '1',
            name: 'API Premium Plan NFT',
            description: 'Bu NFT, API Premium Plan aboneliğinizin sahiplik belgesidir.',
            image: 'https://api.blicence.com/nft/images/api-premium.png',
            attributes: [
              { trait_type: 'Plan Type', value: 'API' },
              { trait_type: 'Plan Name', value: 'API Premium Plan' },
              { trait_type: 'Duration', value: '30 days' },
              { trait_type: 'Flow Rate', value: '0.35 MATIC/month' },
              { trait_type: 'Status', value: 'Active' },
            ],
            planId: '1',
            planType: 'api',
            customerPlanId: 'cp1',
            issuedAt: '2024-01-01T00:00:00Z',
            expiresAt: '2024-02-01T00:00:00Z',
          },
        },
        {
          tokenId: '2',
          owner: userAddress,
          isActive: true,
          metadata: {
            id: '2',
            name: 'Video Processing Credits NFT',
            description: 'Bu NFT, Video Processing Credits paketinizin sahiplik belgesidir.',
            image: 'https://api.blicence.com/nft/images/video-processing.png',
            attributes: [
              { trait_type: 'Plan Type', value: 'N-Usage' },
              { trait_type: 'Plan Name', value: 'Video Processing Credits' },
              { trait_type: 'Total Credits', value: 100 },
              { trait_type: 'Used Credits', value: 25 },
              { trait_type: 'Remaining Credits', value: 75 },
              { trait_type: 'Status', value: 'Active' },
            ],
            planId: '2',
            planType: 'nusage',
            customerPlanId: 'cp2',
            issuedAt: '2024-01-15T00:00:00Z',
          },
        },
        {
          tokenId: '3',
          owner: userAddress,
          isActive: true,
          metadata: {
            id: '3',
            name: 'Premium Vesting Plan NFT',
            description: 'Bu NFT, Premium Vesting Plan yatırımınızın sahiplik belgesidir.',
            image: 'https://api.blicence.com/nft/images/premium-vesting.png',
            attributes: [
              { trait_type: 'Plan Type', value: 'Vesting' },
              { trait_type: 'Plan Name', value: 'Premium Vesting Plan' },
              { trait_type: 'Total Amount', value: '50 MATIC' },
              { trait_type: 'Vested Amount', value: '12.5 MATIC' },
              { trait_type: 'Vesting Progress', value: '25%' },
              { trait_type: 'Status', value: 'Active' },
            ],
            planId: '3',
            planType: 'vesting',
            customerPlanId: 'cp3',
            issuedAt: '2024-01-10T00:00:00Z',
            expiresAt: '2024-08-01T00:00:00Z',
          },
        },
      ];

      return mockNFTs;
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      throw error;
    }
  }

  async getNFTByTokenId(tokenId: string): Promise<PlanNFT | null> {
    try {
      // TODO: Implement actual blockchain interaction
      const userNFTs = await this.getUserNFTs('mock-address');
      return userNFTs.find(nft => nft.tokenId === tokenId) || null;
    } catch (error) {
      console.error('Failed to get NFT by token ID:', error);
      throw error;
    }
  }

  async getNFTsByPlanId(planId: string): Promise<PlanNFT[]> {
    try {
      // TODO: Implement actual blockchain interaction
      const userNFTs = await this.getUserNFTs('mock-address');
      return userNFTs.filter(nft => nft.metadata.planId === planId);
    } catch (error) {
      console.error('Failed to get NFTs by plan ID:', error);
      throw error;
    }
  }

  async mintPlanNFT(planId: string, planType: string, customerPlanId: string): Promise<string> {
    try {
      // TODO: Implement actual NFT minting
      // For now, returning mock token ID
      const mockTokenId = Math.random().toString(36).substr(2, 9);
      
      console.log('Minting NFT for plan:', { planId, planType, customerPlanId });
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return mockTokenId;
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  }

  async verifyNFTOwnership(tokenId: string, userAddress: string): Promise<boolean> {
    try {
      // TODO: Implement actual ownership verification
      const nft = await this.getNFTByTokenId(tokenId);
      return nft?.owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error('Failed to verify NFT ownership:', error);
      return false;
    }
  }

  async generateNFTShareData(tokenId: string): Promise<{
    qrData: string;
    shareText: string;
    shareUrl: string;
  }> {
    try {
      const nft = await this.getNFTByTokenId(tokenId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      // Create shareable data
      const qrData = JSON.stringify({
        tokenId: tokenId,
        owner: nft.owner,
        planId: nft.metadata.planId,
        planType: nft.metadata.planType,
        issuedAt: nft.metadata.issuedAt,
        signature: 'mock-signature', // TODO: Add actual signature
      });

      const shareText = `🎫 ${nft.metadata.name}\n\n` +
        `${nft.metadata.description}\n\n` +
        `Token ID: ${tokenId}\n` +
        `Plan: ${nft.metadata.attributes.find(a => a.trait_type === 'Plan Name')?.value}\n` +
        `Status: ${nft.metadata.attributes.find(a => a.trait_type === 'Status')?.value}\n\n` +
        `#Blicence #NFT #Blockchain`;

      const shareUrl = `https://blicence.com/nft/${tokenId}`;

      return { qrData, shareText, shareUrl };
    } catch (error) {
      console.error('Failed to generate NFT share data:', error);
      throw error;
    }
  }

  async validateQRCode(qrData: string): Promise<{
    isValid: boolean;
    nft?: PlanNFT;
    error?: string;
  }> {
    try {
      const data = JSON.parse(qrData);
      
      // Validate required fields
      if (!data.tokenId || !data.owner || !data.planId) {
        return { isValid: false, error: 'QR kod formatı geçersiz' };
      }

      // Get NFT data
      const nft = await this.getNFTByTokenId(data.tokenId);
      if (!nft) {
        return { isValid: false, error: 'NFT bulunamadı' };
      }

      // Verify ownership
      const isOwner = await this.verifyNFTOwnership(data.tokenId, data.owner);
      if (!isOwner) {
        return { isValid: false, error: 'NFT sahiplik doğrulaması başarısız' };
      }

      // TODO: Verify signature
      
      return { isValid: true, nft };
    } catch (error) {
      console.error('QR code validation error:', error);
      return { isValid: false, error: 'QR kod doğrulaması başarısız' };
    }
  }

  // Cache management
  async cacheNFTData(tokenId: string, nft: PlanNFT): Promise<void> {
    try {
      const cacheKey = `nft_${tokenId}`;
      await EncryptedStorage.setItem(cacheKey, JSON.stringify(nft));
    } catch (error) {
      console.error('Failed to cache NFT data:', error);
    }
  }

  async getCachedNFTData(tokenId: string): Promise<PlanNFT | null> {
    try {
      const cacheKey = `nft_${tokenId}`;
      const cachedData = await EncryptedStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Failed to get cached NFT data:', error);
      return null;
    }
  }

  async clearNFTCache(): Promise<void> {
    try {
      // TODO: Implement cache clearing logic
      console.log('NFT cache cleared');
    } catch (error) {
      console.error('Failed to clear NFT cache:', error);
    }
  }
}

export default new NFTService();
