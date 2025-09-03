import EncryptedStorage from 'react-native-encrypted-storage';

export interface QRCodeData {
  type: 'plan_verification' | 'nft_ownership' | 'usage_proof';
  tokenId?: string;
  planId: string;
  userId: string;
  timestamp: string;
  signature: string;
  metadata?: any;
}

export interface UsageProof {
  planId: string;
  userId: string;
  usageAmount: number;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceId: string;
  signature: string;
}

class QRCodeService {
  
  /**
   * Plan sahipliği için QR kod oluşturur
   */
  async generatePlanVerificationQR(planId: string, tokenId?: string): Promise<string> {
    try {
      const userId = await this.getUserId();
      const timestamp = new Date().toISOString();
      
      const qrData: QRCodeData = {
        type: 'plan_verification',
        planId,
        tokenId,
        userId,
        timestamp,
        signature: await this.generateSignature({ planId, userId, timestamp }),
      };

      return JSON.stringify(qrData);
    } catch (error) {
      console.error('Failed to generate plan verification QR:', error);
      throw error;
    }
  }

  /**
   * NFT sahipliği için QR kod oluşturur
   */
  async generateNFTOwnershipQR(tokenId: string, planId: string): Promise<string> {
    try {
      const userId = await this.getUserId();
      const timestamp = new Date().toISOString();
      
      const qrData: QRCodeData = {
        type: 'nft_ownership',
        tokenId,
        planId,
        userId,
        timestamp,
        signature: await this.generateSignature({ tokenId, planId, userId, timestamp }),
      };

      return JSON.stringify(qrData);
    } catch (error) {
      console.error('Failed to generate NFT ownership QR:', error);
      throw error;
    }
  }

  /**
   * Kullanım kanıtı için QR kod oluşturur
   */
  async generateUsageProofQR(planId: string, usageAmount: number): Promise<string> {
    try {
      const userId = await this.getUserId();
      const timestamp = new Date().toISOString();
      const deviceId = await this.getDeviceId();
      
      const usageProof: UsageProof = {
        planId,
        userId,
        usageAmount,
        timestamp,
        deviceId,
        signature: await this.generateSignature({ planId, userId, usageAmount, timestamp, deviceId }),
      };

      const qrData: QRCodeData = {
        type: 'usage_proof',
        planId,
        userId,
        timestamp,
        signature: usageProof.signature,
        metadata: usageProof,
      };

      return JSON.stringify(qrData);
    } catch (error) {
      console.error('Failed to generate usage proof QR:', error);
      throw error;
    }
  }

  /**
   * QR kod verilerini doğrular
   */
  async validateQRCode(qrString: string): Promise<{
    isValid: boolean;
    data?: QRCodeData;
    error?: string;
  }> {
    try {
      const qrData: QRCodeData = JSON.parse(qrString);
      
      // Basic validation
      if (!qrData.type || !qrData.planId || !qrData.userId || !qrData.signature) {
        return { isValid: false, error: 'QR kod formatı geçersiz' };
      }

      // Check timestamp (not older than 24 hours for security)
      const qrTimestamp = new Date(qrData.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - qrTimestamp.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        return { isValid: false, error: 'QR kod süresi dolmuş' };
      }

      // Verify signature
      const isSignatureValid = await this.verifySignature(qrData);
      if (!isSignatureValid) {
        return { isValid: false, error: 'QR kod imzası geçersiz' };
      }

      // Type-specific validation
      switch (qrData.type) {
        case 'nft_ownership':
          if (!qrData.tokenId) {
            return { isValid: false, error: 'NFT token ID eksik' };
          }
          break;
        
        case 'usage_proof':
          if (!qrData.metadata || !qrData.metadata.usageAmount) {
            return { isValid: false, error: 'Kullanım bilgileri eksik' };
          }
          break;
      }

      return { isValid: true, data: qrData };
    } catch (error) {
      console.error('QR validation error:', error);
      return { isValid: false, error: 'QR kod okuma hatası' };
    }
  }

  /**
   * QR koddan plan bilgilerini çıkarır
   */
  async extractPlanInfo(qrString: string): Promise<{
    planId: string;
    planType?: string;
    tokenId?: string;
    owner?: string;
    isValid: boolean;
  } | null> {
    try {
      const validation = await this.validateQRCode(qrString);
      
      if (!validation.isValid || !validation.data) {
        return null;
      }

      const data = validation.data;
      
      return {
        planId: data.planId,
        tokenId: data.tokenId,
        owner: data.userId,
        isValid: true,
      };
    } catch (error) {
      console.error('Failed to extract plan info:', error);
      return null;
    }
  }

  /**
   * Offline doğrulama için QR kod verisini saklar
   */
  async storeOfflineVerification(qrData: QRCodeData): Promise<void> {
    try {
      const verificationId = `${qrData.planId}_${Date.now()}`;
      const key = `offline_verification_${verificationId}`;
      
      // Store the verification data
      await EncryptedStorage.setItem(key, JSON.stringify(qrData));
      
      // Update the verification list
      const verificationListJson = await EncryptedStorage.getItem('offline_verification_list');
      const verificationIds: string[] = verificationListJson ? JSON.parse(verificationListJson) : [];
      verificationIds.push(verificationId);
      await EncryptedStorage.setItem('offline_verification_list', JSON.stringify(verificationIds));
      
      // Clean old offline verifications (keep only last 10)
      await this.cleanOldOfflineVerifications();
    } catch (error) {
      console.error('Failed to store offline verification:', error);
      throw error;
    }
  }

  /**
   * Offline doğrulamaları getirir
   */
  async getOfflineVerifications(): Promise<QRCodeData[]> {
    try {
      // Since EncryptedStorage doesn't have getAllKeys, we'll use a different approach
      // Store a list of verification IDs separately
      const verificationListJson = await EncryptedStorage.getItem('offline_verification_list');
      const verificationIds: string[] = verificationListJson ? JSON.parse(verificationListJson) : [];
      
      const verifications: QRCodeData[] = [];
      
      for (const id of verificationIds) {
        try {
          const key = `offline_verification_${id}`;
          const data = await EncryptedStorage.getItem(key);
          if (data) {
            verifications.push(JSON.parse(data));
          }
        } catch (error) {
          console.error('Failed to parse offline verification:', error);
        }
      }
      
      return verifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get offline verifications:', error);
      return [];
    }
  }

  /**
   * Eski offline doğrulamaları temizler
   */
  private async cleanOldOfflineVerifications(): Promise<void> {
    try {
      const verificationListJson = await EncryptedStorage.getItem('offline_verification_list');
      const verificationIds: string[] = verificationListJson ? JSON.parse(verificationListJson) : [];
      
      if (verificationIds.length > 10) {
        // Remove oldest verifications
        const idsToRemove = verificationIds.slice(0, verificationIds.length - 10);
        const remainingIds = verificationIds.slice(verificationIds.length - 10);
        
        // Remove old verification data
        for (const id of idsToRemove) {
          await EncryptedStorage.removeItem(`offline_verification_${id}`);
        }
        
        // Update the list
        await EncryptedStorage.setItem('offline_verification_list', JSON.stringify(remainingIds));
      }
    } catch (error) {
      console.error('Failed to clean old offline verifications:', error);
    }
  }

  /**
   * Digital imza oluşturur
   */
  private async generateSignature(data: any): Promise<string> {
    try {
      // TODO: Implement actual digital signature using wallet private key
      // For now, returning a mock signature
      const dataString = JSON.stringify(data);
      const mockSignature = Buffer.from(dataString).toString('base64');
      return `mock_signature_${mockSignature.substring(0, 16)}`;
    } catch (error) {
      console.error('Failed to generate signature:', error);
      throw error;
    }
  }

  /**
   * Digital imzayı doğrular
   */
  private async verifySignature(qrData: QRCodeData): Promise<boolean> {
    try {
      // TODO: Implement actual signature verification
      // For now, returning true for mock signatures
      return qrData.signature.startsWith('mock_signature_');
    } catch (error) {
      console.error('Failed to verify signature:', error);
      return false;
    }
  }

  /**
   * Kullanıcı ID'sini getirir
   */
  private async getUserId(): Promise<string> {
    try {
      const walletAddress = await EncryptedStorage.getItem('wallet_address');
      return walletAddress || 'unknown_user';
    } catch (error) {
      console.error('Failed to get user ID:', error);
      return 'unknown_user';
    }
  }

  /**
   * Cihaz ID'sini getirir
   */
  private async getDeviceId(): Promise<string> {
    try {
      // TODO: Use react-native-device-info to get actual device ID
      let deviceId = await EncryptedStorage.getItem('device_id');
      
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
        await EncryptedStorage.setItem('device_id', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return 'unknown_device';
    }
  }
}

export default new QRCodeService();
