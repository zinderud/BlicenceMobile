import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import QRCodeService from '../../services/QRCodeService';

interface QRCodeGeneratorProps {
  planId: string;
  tokenId?: string;
  type: 'plan_verification' | 'nft_ownership' | 'usage_proof';
  usageAmount?: number;
  onQRGenerated?: (qrData: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  planId,
  tokenId,
  type,
  usageAmount,
  onQRGenerated,
}) => {
  const [qrData, setQrData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQR();
  }, [planId, tokenId, type, usageAmount]);

  const generateQR = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      let qrString = '';
      
      switch (type) {
        case 'plan_verification':
          qrString = await QRCodeService.generatePlanVerificationQR(planId, tokenId);
          break;
        
        case 'nft_ownership':
          if (!tokenId) {
            throw new Error('NFT sahipliği için token ID gereklidir');
          }
          qrString = await QRCodeService.generateNFTOwnershipQR(tokenId, planId);
          break;
        
        case 'usage_proof':
          if (!usageAmount) {
            throw new Error('Kullanım kanıtı için kullanım miktarı gereklidir');
          }
          qrString = await QRCodeService.generateUsageProofQR(planId, usageAmount);
          break;
        
        default:
          throw new Error('Geçersiz QR kod türü');
      }
      
      setQrData(qrString);
      onQRGenerated?.(qrString);
      
    } catch (err: any) {
      console.error('QR generation error:', err);
      setError(err.message || 'QR kod oluşturulamadı');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    generateQR();
  };

  const handleShare = () => {
    if (!qrData) return;
    
    // TODO: Implement actual sharing
    Alert.alert('QR Kod Paylaş', 'QR kod paylaşım özelliği yakında eklenecek!');
  };

  const handleSaveOffline = async () => {
    if (!qrData) return;
    
    try {
      const parsedData = JSON.parse(qrData);
      await QRCodeService.storeOfflineVerification(parsedData);
      Alert.alert('Başarılı', 'QR kod offline kullanım için kaydedildi!');
    } catch (error) {
      console.error('Offline save error:', error);
      Alert.alert('Hata', 'QR kod kaydedilemedi');
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'plan_verification': return 'Plan Doğrulama';
      case 'nft_ownership': return 'NFT Sahiplik';
      case 'usage_proof': return 'Kullanım Kanıtı';
      default: return 'QR Kod';
    }
  };

  const getTypeDescription = () => {
    switch (type) {
      case 'plan_verification': 
        return 'Bu QR kod ile plan sahipliğinizi doğrulayabilirsiniz.';
      case 'nft_ownership': 
        return 'Bu QR kod ile NFT sahipliğinizi kanıtlayabilirsiniz.';
      case 'usage_proof': 
        return 'Bu QR kod ile plan kullanımınızı kanıtlayabilirsiniz.';
      default: 
        return 'QR kod ile işlem yapabilirsiniz.';
    }
  };

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>QR kod oluşturuluyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{getTypeTitle()}</Text>
        <Text style={styles.description}>{getTypeDescription()}</Text>
      </View>

      {/* QR Code Display Area */}
      <View style={styles.qrContainer}>
        {/* TODO: Replace with actual QR code component */}
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrPlaceholderText}>QR KOD</Text>
          <Text style={styles.qrPlaceholderSubtext}>
            {qrData.substring(0, 50)}...
          </Text>
        </View>
      </View>

      {/* QR Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plan ID:</Text>
          <Text style={styles.infoValue}>{planId}</Text>
        </View>
        
        {tokenId && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Token ID:</Text>
            <Text style={styles.infoValue}>{tokenId}</Text>
          </View>
        )}
        
        {usageAmount && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kullanım Miktarı:</Text>
            <Text style={styles.infoValue}>{usageAmount}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Oluşturulma:</Text>
          <Text style={styles.infoValue}>
            {new Date().toLocaleString('tr-TR')}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
          <Text style={styles.actionButtonText}>Yenile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
          <Text style={styles.actionButtonText}>Paylaş</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.offlineButton]} onPress={handleSaveOffline}>
          <Text style={styles.actionButtonText}>Offline Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* Warning */}
      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>
          ⚠️ Bu QR kod 24 saat süreyle geçerlidir. Güvenlik için düzenli olarak yenileyin.
        </Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: width - 80,
    height: width - 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  qrPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  qrPlaceholderSubtext: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#28a745',
  },
  offlineButton: {
    backgroundColor: '#17a2b8',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default QRCodeGenerator;
