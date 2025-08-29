# 🔐 06 - Faz 4: NFT ve QR Kod Sistemi (2-3 Hafta)

## 🎯 Faz 4 Hedefleri

Bu fazda kullanıcıların plan sahipliklerini kanıtlayacakları NFT sistemi ve offline kimlik doğrulama için QR kod sistemini geliştireceğiz:
- NFT metadata'sı görüntüleme ve yönetimi
- QR kod oluşturma ve doğrulama sistemi
- Offline kimlik doğrulama mekanizması
- Dijital imza tabanlı güvenlik
- Plan kullanım kanıtlama sistemi

## 📋 Sprint Planlaması

### Sprint 4.1: NFT Görüntüleme Sistemi (3-4 gün)
- ✅ NFT metadata'sı çekme ve cache'leme
- ✅ NFT görüntüleme component'i
- ✅ NFT galeri ve detay sayfaları
- ✅ IPFS entegrasyonu
- ✅ Metadata parsing ve validation

### Sprint 4.2: QR Kod Sistemi (4-5 gün)
- ✅ QR kod oluşturma servisi
- ✅ Dijital imza entegrasyonu
- ✅ QR kod tarayıcı component'i
- ✅ Offline doğrulama mekanizması
- ✅ Güvenlik validasyonları

### Sprint 4.3: Kimlik Doğrulama Akışı (3-4 gün)
- ✅ Plan kullanım onayı sistemi
- ✅ Offline kullanım tracking
- ✅ Sync mekanizması
- ✅ Fraud prevention
- ✅ Audit trail

## 🖼️ NFT Görüntüleme Sistemi

### NFT Service
```typescript
// src/services/nft/NFTService.ts
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContractService } from '@/services/blockchain/ContractService';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    customerPlanId: number;
    planType: string;
    producerAddress: string;
    planId: number;
    startDate: number;
    endDate?: number;
  };
}

export interface NFTData {
  tokenId: number;
  owner: string;
  tokenURI: string;
  metadata: NFTMetadata;
  customerPlan: any;
}

class NFTService {
  private static instance: NFTService;
  private cache: Map<string, NFTMetadata> = new Map();

  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  async getNFTsByOwner(ownerAddress: string): Promise<NFTData[]> {
    try {
      // Kullanıcının sahip olduğu customer plan'ları al
      const customerPlans = await ContractService.getCustomerPlans(ownerAddress);
      
      const nfts: NFTData[] = [];
      
      for (const customerPlan of customerPlans) {
        try {
          const nftData = await this.getNFTByCustomerPlan(customerPlan);
          if (nftData) {
            nfts.push(nftData);
          }
        } catch (error) {
          console.error(`Failed to load NFT for customer plan ${customerPlan.custumerPlanId}:`, error);
        }
      }
      
      return nfts;
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      throw new Error('NFT\'ler yüklenemedi');
    }
  }

  async getNFTByCustomerPlan(customerPlan: any): Promise<NFTData | null> {
    try {
      // Customer plan ID'si aynı zamanda NFT token ID'si
      const tokenId = customerPlan.custumerPlanId;
      
      // Token URI'sini contract'tan al
      const tokenURI = await ContractService.getTokenURI(tokenId);
      
      if (!tokenURI) {
        return null;
      }

      // Metadata'yı cache'den kontrol et
      const cacheKey = `nft_${tokenId}`;
      let metadata = this.cache.get(cacheKey);
      
      if (!metadata) {
        metadata = await this.fetchMetadata(tokenURI);
        this.cache.set(cacheKey, metadata);
        
        // Local storage'a da kaydet
        await AsyncStorage.setItem(cacheKey, JSON.stringify(metadata));
      }

      return {
        tokenId,
        owner: customerPlan.customerAddress,
        tokenURI,
        metadata,
        customerPlan,
      };
    } catch (error) {
      console.error('Failed to load NFT:', error);
      return null;
    }
  }

  private async fetchMetadata(tokenURI: string): Promise<NFTMetadata> {
    try {
      // IPFS URI'sini HTTP gateway'e çevir
      const httpURI = this.convertIPFSToHTTP(tokenURI);
      
      const response = await fetch(httpURI, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const metadata = await response.json();
      
      // Metadata validation
      this.validateMetadata(metadata);
      
      return metadata;
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      
      // Fallback metadata
      return this.generateFallbackMetadata();
    }
  }

  private convertIPFSToHTTP(uri: string): string {
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return uri;
  }

  private validateMetadata(metadata: any): void {
    if (!metadata.name || !metadata.description) {
      throw new Error('Invalid metadata: missing required fields');
    }
  }

  private generateFallbackMetadata(): NFTMetadata {
    return {
      name: 'Blimobil Plan NFT',
      description: 'Plan sahiplik belgesi',
      image: 'https://blicence.com/default-nft.png',
      attributes: [],
      properties: {
        customerPlanId: 0,
        planType: 'UNKNOWN',
        producerAddress: '',
        planId: 0,
        startDate: Date.now(),
      },
    };
  }

  async refreshNFTCache(tokenId: number): Promise<void> {
    const cacheKey = `nft_${tokenId}`;
    this.cache.delete(cacheKey);
    await AsyncStorage.removeItem(cacheKey);
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    const keys = await AsyncStorage.getAllKeys();
    const nftKeys = keys.filter(key => key.startsWith('nft_'));
    await AsyncStorage.multiRemove(nftKeys);
  }
}

export default NFTService.getInstance();
```

### NFT Viewer Component
```typescript
// src/components/nft/NFTViewer.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/formatters';
import { NFTData } from '@/services/nft/NFTService';

interface NFTViewerProps {
  nftData: NFTData;
  onGenerateQR?: () => void;
  onViewPlan?: () => void;
}

export const NFTViewer: React.FC<NFTViewerProps> = ({
  nftData,
  onGenerateQR,
  onViewPlan,
}) => {
  const { colors, spacing } = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const { metadata, customerPlan } = nftData;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${metadata.name}\n\n${metadata.description}\n\nPlan ID: ${metadata.properties.customerPlanId}`,
        title: 'Blimobil Plan NFT',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleOpenExternal = () => {
    if (metadata.external_url) {
      Linking.openURL(metadata.external_url);
    }
  };

  const getPlanTypeColor = (planType: string): string => {
    switch (planType) {
      case 'API':
        return colors.success;
      case 'N_USAGE':
        return colors.warning;
      case 'VESTING':
        return colors.info;
      default:
        return colors.gray500;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return colors.success;
      case 'PAUSED':
        return colors.warning;
      case 'EXPIRED':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* NFT Image */}
      <Card style={styles.imageCard}>
        <View style={styles.imageContainer}>
          {imageLoading && !imageError && (
            <View style={styles.imageLoader}>
              <LoadingSpinner size="small" />
            </View>
          )}
          
          {!imageError ? (
            <Image
              source={{ uri: metadata.image }}
              style={styles.nftImage}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.gray200 }]}>
              <Text style={[styles.placeholderText, { color: colors.gray500 }]}>
                🖼️
              </Text>
            </View>
          )}
          
          <View style={styles.imageOverlay}>
            <Badge
              text={metadata.properties.planType}
              color={getPlanTypeColor(metadata.properties.planType)}
              style={styles.planTypeBadge}
            />
            <Badge
              text={customerPlan.status}
              color={getStatusColor(customerPlan.status)}
              style={styles.statusBadge}
            />
          </View>
        </View>
      </Card>

      {/* NFT Metadata */}
      <Card style={styles.metadataCard}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.nftName, { color: colors.textPrimary }]}>
              {metadata.name}
            </Text>
            <Text style={[styles.tokenId, { color: colors.textSecondary }]}>
              Token ID: #{nftData.tokenId}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text style={[styles.shareIcon, { color: colors.primary }]}>📤</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {metadata.description}
        </Text>
      </Card>

      {/* Plan Information */}
      <Card style={styles.planCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Plan Bilgileri
        </Text>
        
        <View style={styles.planInfo}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Plan ID
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              #{metadata.properties.planId}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Başlangıç Tarihi
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {formatDate(new Date(metadata.properties.startDate))}
            </Text>
          </View>
          
          {metadata.properties.endDate && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Bitiş Tarihi
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {formatDate(new Date(metadata.properties.endDate))}
              </Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Üretici
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]} numberOfLines={1}>
              {metadata.properties.producerAddress.slice(0, 6)}...{metadata.properties.producerAddress.slice(-4)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Attributes */}
      {metadata.attributes && metadata.attributes.length > 0 && (
        <Card style={styles.attributesCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Özellikler
          </Text>
          
          <View style={styles.attributesGrid}>
            {metadata.attributes.map((attribute, index) => (
              <View key={index} style={[styles.attributeItem, { backgroundColor: colors.gray100 }]}>
                <Text style={[styles.attributeType, { color: colors.textSecondary }]}>
                  {attribute.trait_type}
                </Text>
                <Text style={[styles.attributeValue, { color: colors.textPrimary }]}>
                  {attribute.value}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Actions */}
      <Card style={styles.actionsCard}>
        <View style={styles.actions}>
          {onGenerateQR && (
            <Button
              title="QR Kod Oluştur"
              variant="primary"
              onPress={onGenerateQR}
              style={styles.actionButton}
            />
          )}
          
          {onViewPlan && (
            <Button
              title="Plan Detayları"
              variant="outline"
              onPress={onViewPlan}
              style={styles.actionButton}
            />
          )}
          
          {metadata.external_url && (
            <Button
              title="Dış Bağlantı"
              variant="secondary"
              onPress={handleOpenExternal}
              style={styles.actionButton}
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageCard: {
    margin: 16,
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  nftImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  planTypeBadge: {
    alignSelf: 'flex-end',
  },
  statusBadge: {
    alignSelf: 'flex-end',
  },
  metadataCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  nftName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  tokenId: {
    fontSize: 14,
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  planInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  attributesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attributeItem: {
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
  },
  attributeType: {
    fontSize: 12,
    marginBottom: 4,
  },
  attributeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
```

## 📱 QR Kod Sistemi

### QR Code Service
```typescript
// src/services/qr/QRCodeService.ts
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletService from '@/services/blockchain/WalletService';
import { CustomerPlan } from '@/types/plans';

export interface QRCodeData {
  type: 'PLAN_USAGE' | 'PLAN_ACCESS' | 'PLAN_VERIFICATION';
  customerPlanId: number;
  walletAddress: string;
  signature: string;
  message: string;
  timestamp: number;
  expiresAt: number;
  nonce: string;
  metadata: {
    planName: string;
    planType: string;
    remainingUsage?: number;
    validUntil?: number;
  };
}

export interface QRVerificationResult {
  isValid: boolean;
  isExpired: boolean;
  customerPlan?: any;
  reason?: string;
}

class QRCodeService {
  private static instance: QRCodeService;

  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }

  async generateUsageQR(
    customerPlan: CustomerPlan,
    usageCount: number = 1,
    validMinutes: number = 15
  ): Promise<string> {
    try {
      const walletAddress = WalletService.getConnectedAddress();
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Check if user has enough usage rights
      if (customerPlan.planType === 'N_USAGE' && customerPlan.remainingQuota < usageCount) {
        throw new Error('Yetersiz kullanım hakkı');
      }

      const nonce = this.generateNonce();
      const timestamp = Date.now();
      const expiresAt = timestamp + (validMinutes * 60 * 1000);
      
      // Create message to sign
      const message = this.createSignatureMessage({
        type: 'PLAN_USAGE',
        customerPlanId: customerPlan.custumerPlanId,
        walletAddress,
        usageCount,
        timestamp,
        nonce,
      });

      // Sign the message
      const signature = await WalletService.signMessage(message);

      const qrData: QRCodeData = {
        type: 'PLAN_USAGE',
        customerPlanId: customerPlan.custumerPlanId,
        walletAddress,
        signature,
        message,
        timestamp,
        expiresAt,
        nonce,
        metadata: {
          planName: customerPlan.planName,
          planType: customerPlan.planType,
          remainingUsage: customerPlan.remainingQuota,
          validUntil: expiresAt,
        },
      };

      // Store QR data locally for tracking
      await this.storeQRData(qrData);

      return JSON.stringify(qrData);
    } catch (error) {
      console.error('QR generation failed:', error);
      throw new Error('QR kod oluşturulamadı');
    }
  }

  async generateAccessQR(
    customerPlan: CustomerPlan,
    validMinutes: number = 30
  ): Promise<string> {
    try {
      const walletAddress = WalletService.getConnectedAddress();
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      const nonce = this.generateNonce();
      const timestamp = Date.now();
      const expiresAt = timestamp + (validMinutes * 60 * 1000);
      
      const message = this.createSignatureMessage({
        type: 'PLAN_ACCESS',
        customerPlanId: customerPlan.custumerPlanId,
        walletAddress,
        timestamp,
        nonce,
      });

      const signature = await WalletService.signMessage(message);

      const qrData: QRCodeData = {
        type: 'PLAN_ACCESS',
        customerPlanId: customerPlan.custumerPlanId,
        walletAddress,
        signature,
        message,
        timestamp,
        expiresAt,
        nonce,
        metadata: {
          planName: customerPlan.planName,
          planType: customerPlan.planType,
        },
      };

      await this.storeQRData(qrData);

      return JSON.stringify(qrData);
    } catch (error) {
      console.error('Access QR generation failed:', error);
      throw new Error('Erişim QR kodu oluşturulamadı');
    }
  }

  async verifyQR(qrString: string): Promise<QRVerificationResult> {
    try {
      const qrData: QRCodeData = JSON.parse(qrString);
      
      // Basic structure validation
      if (!this.isValidQRStructure(qrData)) {
        return {
          isValid: false,
          isExpired: false,
          reason: 'Geçersiz QR kod formatı',
        };
      }

      // Check expiration
      const now = Date.now();
      if (now > qrData.expiresAt) {
        return {
          isValid: false,
          isExpired: true,
          reason: 'QR kod süresi dolmuş',
        };
      }

      // Verify signature
      const isSignatureValid = await this.verifySignature(qrData);
      if (!isSignatureValid) {
        return {
          isValid: false,
          isExpired: false,
          reason: 'Geçersiz imza',
        };
      }

      // Check if QR was already used (prevent replay attacks)
      const isUsed = await this.checkQRUsage(qrData.nonce);
      if (isUsed) {
        return {
          isValid: false,
          isExpired: false,
          reason: 'QR kod daha önce kullanılmış',
        };
      }

      // Verify customer plan validity
      const customerPlan = await this.verifyCustomerPlan(qrData);
      if (!customerPlan) {
        return {
          isValid: false,
          isExpired: false,
          reason: 'Plan bulunamadı veya geçersiz',
        };
      }

      // Mark QR as used
      await this.markQRAsUsed(qrData.nonce);

      return {
        isValid: true,
        isExpired: false,
        customerPlan,
      };
    } catch (error) {
      console.error('QR verification failed:', error);
      return {
        isValid: false,
        isExpired: false,
        reason: 'QR kod doğrulanamadı',
      };
    }
  }

  private createSignatureMessage(data: any): string {
    return `Blimobil Plan ${data.type}\nPlan ID: ${data.customerPlanId}\nWallet: ${data.walletAddress}\nTimestamp: ${data.timestamp}\nNonce: ${data.nonce}`;
  }

  private async verifySignature(qrData: QRCodeData): Promise<boolean> {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(qrData.message, qrData.signature);
      return recoveredAddress.toLowerCase() === qrData.walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  private isValidQRStructure(qrData: any): boolean {
    return (
      qrData &&
      typeof qrData === 'object' &&
      qrData.type &&
      qrData.customerPlanId &&
      qrData.walletAddress &&
      qrData.signature &&
      qrData.message &&
      qrData.timestamp &&
      qrData.expiresAt &&
      qrData.nonce
    );
  }

  private async verifyCustomerPlan(qrData: QRCodeData): Promise<any> {
    try {
      // TODO: Implement customer plan verification from blockchain
      // This would check if the customer plan exists and is valid
      return {}; // Placeholder
    } catch (error) {
      return null;
    }
  }

  private async storeQRData(qrData: QRCodeData): Promise<void> {
    try {
      const key = `qr_${qrData.nonce}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        nonce: qrData.nonce,
        customerPlanId: qrData.customerPlanId,
        timestamp: qrData.timestamp,
        expiresAt: qrData.expiresAt,
        used: false,
      }));
    } catch (error) {
      console.error('Failed to store QR data:', error);
    }
  }

  private async checkQRUsage(nonce: string): Promise<boolean> {
    try {
      const key = `qr_${nonce}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const qrInfo = JSON.parse(data);
        return qrInfo.used === true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async markQRAsUsed(nonce: string): Promise<void> {
    try {
      const key = `qr_${nonce}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const qrInfo = JSON.parse(data);
        qrInfo.used = true;
        qrInfo.usedAt = Date.now();
        await AsyncStorage.setItem(key, JSON.stringify(qrInfo));
      }
    } catch (error) {
      console.error('Failed to mark QR as used:', error);
    }
  }

  private generateNonce(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async cleanupExpiredQRs(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const qrKeys = keys.filter(key => key.startsWith('qr_'));
      const now = Date.now();
      
      for (const key of qrKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const qrInfo = JSON.parse(data);
          if (now > qrInfo.expiresAt) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired QRs:', error);
    }
  }
}

export default QRCodeService.getInstance();
```

### QR Code Generator Component
```typescript
// src/components/qr/QRCodeGenerator.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-generator';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import QRCodeService from '@/services/qr/QRCodeService';
import { CustomerPlan } from '@/types/plans';

interface QRCodeGeneratorProps {
  visible: boolean;
  customerPlan: CustomerPlan;
  qrType: 'usage' | 'access';
  onClose: () => void;
  usageCount?: number;
  validMinutes?: number;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  visible,
  customerPlan,
  qrType,
  onClose,
  usageCount = 1,
  validMinutes = 15,
}) => {
  const { colors, spacing } = useTheme();
  const [qrValue, setQRValue] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (visible) {
      generateQRCode();
    } else {
      // Reset state when modal closes
      setQRValue('');
      setExpiresAt(null);
      setError('');
    }
  }, [visible, qrType, usageCount]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      let qrData: string;
      
      if (qrType === 'usage') {
        qrData = await QRCodeService.generateUsageQR(customerPlan, usageCount, validMinutes);
      } else {
        qrData = await QRCodeService.generateAccessQR(customerPlan, validMinutes);
      }
      
      setQRValue(qrData);
      setExpiresAt(new Date(Date.now() + validMinutes * 60 * 1000));
    } catch (error: any) {
      setError(error.message || 'QR kod oluşturulamadı');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Blimobil Plan QR Kodu\n\nPlan: ${customerPlan.planName}\nTip: ${qrType === 'usage' ? 'Kullanım' : 'Erişim'}\n\n${qrValue}`,
        title: 'Plan QR Kodu',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleRegenerateQR = () => {
    Alert.alert(
      'QR Kod Yenileme',
      'Mevcut QR kod geçersiz hale gelecek. Yeni QR kod oluşturulsun mu?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Oluştur', onPress: generateQRCode },
      ]
    );
  };

  const getQRTitle = () => {
    switch (qrType) {
      case 'usage':
        return `${usageCount} Kullanım QR Kodu`;
      case 'access':
        return 'Erişim QR Kodu';
      default:
        return 'QR Kod';
    }
  };

  const getQRDescription = () => {
    switch (qrType) {
      case 'usage':
        return `Bu QR kod ${usageCount} kullanım hakkı için geçerlidir. Tarandığında kullanım hakkınız düşecektir.`;
      case 'access':
        return 'Bu QR kod plan sahipliğinizi doğrulamak için kullanılabilir. Kullanım hakkınız düşmez.';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.primary }]}>Kapat</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {getQRTitle()}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Plan Info */}
          <Card style={styles.planInfoCard}>
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: colors.textPrimary }]}>
                {customerPlan.planName}
              </Text>
              <Badge
                text={customerPlan.planType}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
              {getQRDescription()}
            </Text>
          </Card>

          {/* QR Code */}
          <Card style={styles.qrCard}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  QR kod oluşturuluyor...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
                <Button
                  title="Tekrar Dene"
                  onPress={generateQRCode}
                  style={styles.retryButton}
                />
              </View>
            ) : qrValue ? (
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrValue}
                  size={250}
                  bgColor={colors.background}
                  fgColor={colors.textPrimary}
                />
                
                {expiresAt && (
                  <View style={styles.expiryContainer}>
                    <Text style={[styles.expiryLabel, { color: colors.textSecondary }]}>
                      Geçerlilik süresi:
                    </Text>
                    <CountdownTimer
                      targetDate={expiresAt}
                      onComplete={() => {
                        setQRValue('');
                        setExpiresAt(null);
                      }}
                      textStyle={[styles.countdown, { color: colors.warning }]}
                    />
                  </View>
                )}
              </View>
            ) : null}
          </Card>

          {/* Usage Info */}
          {qrType === 'usage' && customerPlan.planType === 'N_USAGE' && (
            <Card style={styles.usageCard}>
              <View style={styles.usageInfo}>
                <View style={styles.usageItem}>
                  <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>
                    Mevcut Kullanım Hakkı
                  </Text>
                  <Text style={[styles.usageValue, { color: colors.textPrimary }]}>
                    {customerPlan.remainingQuota}
                  </Text>
                </View>
                <View style={styles.usageItem}>
                  <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>
                    Bu QR ile Kullanılacak
                  </Text>
                  <Text style={[styles.usageValue, { color: colors.warning }]}>
                    {usageCount}
                  </Text>
                </View>
                <View style={styles.usageItem}>
                  <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>
                    Kullanım Sonrası Kalan
                  </Text>
                  <Text style={[styles.usageValue, { color: colors.success }]}>
                    {customerPlan.remainingQuota - usageCount}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {qrValue && (
              <>
                <Button
                  title="Paylaş"
                  variant="secondary"
                  onPress={handleShare}
                  style={styles.actionButton}
                />
                <Button
                  title="Yeni QR Oluştur"
                  variant="outline"
                  onPress={handleRegenerateQR}
                  style={styles.actionButton}
                />
              </>
            )}
          </View>

          {/* Security Warning */}
          <Card style={[styles.warningCard, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.warningTitle, { color: colors.warning }]}>
              ⚠️ Güvenlik Uyarısı
            </Text>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              • QR kodunuzu güvenilir olmayan kişilerle paylaşmayın{'\n'}
              • QR kod süresi dolduğunda otomatik olarak geçersiz hale gelir{'\n'}
              • Her QR kod sadece bir kez kullanılabilir{'\n'}
              • QR kodunuzu kaybederseniz yeni bir tane oluşturabilirsiniz
            </Text>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  planInfoCard: {
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  qrCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  qrContainer: {
    alignItems: 'center',
  },
  expiryContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  expiryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  countdown: {
    fontSize: 18,
    fontWeight: '600',
  },
  usageCard: {
    marginBottom: 16,
  },
  usageInfo: {
    gap: 12,
  },
  usageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageLabel: {
    fontSize: 14,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
```

Bu Faz 4'ün tamamlanmasıyla NFT görüntüleme ve QR kod sistemi hazır olacak. Kullanıcılar planlarını offline olarak da doğrulayabilecekler.
