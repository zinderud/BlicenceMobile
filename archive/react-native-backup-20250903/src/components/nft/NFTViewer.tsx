import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import NFTService, { PlanNFT, NFTMetadata } from '../../services/NFTService';
import QRCodeService from '../../services/QRCodeService';

interface NFTViewerProps {
  tokenId: string;
  onNFTLoaded?: (nft: NFTMetadata) => void;
  showActions?: boolean;
}

const NFTViewer: React.FC<NFTViewerProps> = ({ 
  tokenId, 
  onNFTLoaded, 
  showActions = true 
}) => {
  const [nft, setNft] = useState<PlanNFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNFTData();
  }, [tokenId]);

  const loadNFTData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get from cache first
      const cachedNFT = await NFTService.getCachedNFTData(tokenId);
      if (cachedNFT) {
        setNft(cachedNFT);
        onNFTLoaded?.(cachedNFT.metadata);
      }
      
      // Load fresh data
      const nftData = await NFTService.getNFTByTokenId(tokenId);
      if (nftData) {
        setNft(nftData);
        onNFTLoaded?.(nftData.metadata);
        
        // Cache the data
        await NFTService.cacheNFTData(tokenId, nftData);
      } else {
        setError('NFT bulunamadı');
      }
    } catch (err: any) {
      console.error('NFT loading error:', err);
      setError(err.message || 'NFT yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!nft) return;
    
    try {
      const qrData = await QRCodeService.generateNFTOwnershipQR(
        nft.tokenId, 
        nft.metadata.planId
      );
      
      // Navigate to QR display screen
      Alert.alert('QR Kod', 'QR kod oluşturuldu!'); // TODO: Navigate to QR screen
    } catch (error) {
      console.error('QR generation error:', error);
      Alert.alert('Hata', 'QR kod oluşturulamadı');
    }
  };

  const handleShare = async () => {
    if (!nft) return;
    
    try {
      const shareData = await NFTService.generateNFTShareData(nft.tokenId);
      // TODO: Implement actual sharing
      Alert.alert('Paylaş', shareData.shareText);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Hata', 'Paylaşım verisi oluşturulamadı');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'expired': return '#dc3545';
      default: return '#007AFF';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>NFT yükleniyor...</Text>
      </View>
    );
  }

  if (error || !nft) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'NFT bulunamadı'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadNFTData}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* NFT Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: nft.metadata.image }} 
          style={styles.nftImage}
          defaultSource={require('../../assets/nft-placeholder.png') as any}
        />
        
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(nft.metadata.attributes.find(a => a.trait_type === 'Status')?.value as string || 'active') }
          ]}>
            <Text style={styles.statusText}>
              {nft.metadata.attributes.find(a => a.trait_type === 'Status')?.value || 'Active'}
            </Text>
          </View>
        </View>
      </View>

      {/* NFT Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.nftName}>{nft.metadata.name}</Text>
        <Text style={styles.nftDescription}>{nft.metadata.description}</Text>
        
        {/* Token Info */}
        <View style={styles.tokenInfoContainer}>
          <View style={styles.tokenInfoRow}>
            <Text style={styles.tokenInfoLabel}>Token ID:</Text>
            <Text style={styles.tokenInfoValue}>{nft.tokenId}</Text>
          </View>
          
          <View style={styles.tokenInfoRow}>
            <Text style={styles.tokenInfoLabel}>Owner:</Text>
            <Text style={styles.tokenInfoValue}>{nft.owner.substring(0, 10)}...</Text>
          </View>
          
          <View style={styles.tokenInfoRow}>
            <Text style={styles.tokenInfoLabel}>Plan ID:</Text>
            <Text style={styles.tokenInfoValue}>{nft.metadata.planId}</Text>
          </View>
        </View>

        {/* Attributes */}
        <View style={styles.attributesContainer}>
          <Text style={styles.attributesTitle}>Özellikler</Text>
          <View style={styles.attributesGrid}>
            {nft.metadata.attributes.map((attr, index) => (
              <View key={index} style={styles.attributeItem}>
                <Text style={styles.attributeType}>{attr.trait_type}</Text>
                <Text style={styles.attributeValue}>{attr.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesContainer}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Çıkarım Tarihi:</Text>
            <Text style={styles.dateValue}>{formatDate(nft.metadata.issuedAt)}</Text>
          </View>
          
          {nft.metadata.expiresAt && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Son Kullanma:</Text>
              <Text style={styles.dateValue}>{formatDate(nft.metadata.expiresAt)}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleGenerateQR}>
              <Text style={styles.actionButtonText}>QR Kod Oluştur</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
              <Text style={styles.actionButtonText}>Paylaş</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: 'white',
    marginBottom: 16,
  },
  nftImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  statusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  nftName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  nftDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  tokenInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginBottom: 20,
  },
  tokenInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tokenInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  attributesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginBottom: 20,
  },
  attributesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attributeItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
    flex: 1,
  },
  attributeType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  attributeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  datesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NFTViewer;
