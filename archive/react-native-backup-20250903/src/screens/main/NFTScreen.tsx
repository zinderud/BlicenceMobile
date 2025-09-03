import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Modal } from 'react-native';
import { useAppSelector } from '../../store';
import NFTService, { PlanNFT } from '../../services/NFTService';
import NFTViewer from '../../components/nft/NFTViewer';
import QRCodeGenerator from '../../components/qr/QRCodeGenerator';

const NFTScreen: React.FC = () => {
  const { walletInfo } = useAppSelector(state => state.wallet);
  const [nfts, setNfts] = useState<PlanNFT[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<PlanNFT | null>(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrNFT, setQrNFT] = useState<PlanNFT | null>(null);

  useEffect(() => {
    loadNFTs();
  }, [walletInfo?.address]);

  const loadNFTs = async () => {
    if (!walletInfo?.address) return;
    
    try {
      const userNFTs = await NFTService.getUserNFTs(walletInfo.address);
      setNfts(userNFTs);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNFTs();
    setRefreshing(false);
  };

  const handleNFTPress = (nft: PlanNFT) => {
    setSelectedNFT(nft);
    setShowNFTModal(true);
  };

  const handleGenerateQR = (nft: PlanNFT) => {
    setQrNFT(nft);
    setShowQRModal(true);
  };

  const getPlanTypeColor = (planType: string) => {
    switch (planType) {
      case 'api': return '#007AFF';
      case 'vesting': return '#28a745';
      case 'nusage': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getPlanTypeText = (planType: string) => {
    switch (planType) {
      case 'api': return 'API Plan';
      case 'vesting': return 'Vesting';
      case 'nusage': return 'Kullanım';
      default: return 'Plan';
    }
  };

  const renderNFTItem = ({ item }: { item: PlanNFT }) => (
    <TouchableOpacity style={styles.nftCard} onPress={() => handleNFTPress(item)}>
      <View style={styles.nftImageContainer}>
        <Image 
          source={{ uri: item.metadata.image }} 
          style={styles.nftImage}
          // defaultSource={require('../../assets/nft-placeholder.png') as any}
        />
        
        {/* Plan Type Badge */}
        <View style={[
          styles.planTypeBadge, 
          { backgroundColor: getPlanTypeColor(item.metadata.planType) }
        ]}>
          <Text style={styles.planTypeText}>
            {getPlanTypeText(item.metadata.planType)}
          </Text>
        </View>
      </View>
      
      <View style={styles.nftInfo}>
        <Text style={styles.nftName} numberOfLines={2}>
          {item.metadata.name}
        </Text>
        
        <Text style={styles.nftDescription} numberOfLines={2}>
          {item.metadata.description}
        </Text>
        
        <View style={styles.nftDetails}>
          <Text style={styles.tokenId}>#{item.tokenId}</Text>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: item.isActive ? '#28a745' : '#6c757d' }
            ]} />
            <Text style={[
              styles.statusText, 
              { color: item.isActive ? '#28a745' : '#6c757d' }
            ]}>
              {item.isActive ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={() => handleGenerateQR(item)}
          >
            <Text style={styles.qrButtonText}>QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>NFT Bulunamadı</Text>
      <Text style={styles.emptyDescription}>
        Henüz hiç NFT'niz bulunmuyor. Plan satın aldığınızda otomatik olarak NFT sahiplik belgesi oluşturulur.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NFT Koleksiyonum</Text>
        <Text style={styles.headerSubtitle}>
          {nfts.length} NFT sahiplik belgesi
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{nfts.filter(n => n.isActive).length}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{nfts.filter(n => n.metadata.planType === 'api').length}</Text>
          <Text style={styles.statLabel}>API</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{nfts.filter(n => n.metadata.planType === 'vesting').length}</Text>
          <Text style={styles.statLabel}>Vesting</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{nfts.filter(n => n.metadata.planType === 'nusage').length}</Text>
          <Text style={styles.statLabel}>Kullanım</Text>
        </View>
      </View>

      {/* NFT List */}
      <FlatList
        data={nfts}
        keyExtractor={(item) => item.tokenId}
        renderItem={renderNFTItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* NFT Detail Modal */}
      <Modal
        visible={showNFTModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNFTModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowNFTModal(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          
          {selectedNFT && (
            <NFTViewer 
              tokenId={selectedNFT.tokenId}
              showActions={true}
            />
          )}
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          
          {qrNFT && (
            <QRCodeGenerator
              planId={qrNFT.metadata.planId}
              tokenId={qrNFT.tokenId}
              type="nft_ownership"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 8,
  },
  nftCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nftImageContainer: {
    position: 'relative',
  },
  nftImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  planTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  nftInfo: {
    padding: 12,
  },
  nftName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nftDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  nftDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenId: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickActions: {
    alignItems: 'flex-end',
  },
  qrButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  qrButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default NFTScreen;
