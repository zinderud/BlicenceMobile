import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export interface VestingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  vestingStartDate: string;
  vestingEndDate: string;
  cliff: number; // in days
  vestingPeriod: number; // in days
  isActive: boolean;
  createdAt: string;
}

interface VestingPlanCardProps {
  plan: VestingPlan;
  customerPlan?: any;
  currentVestedAmount?: number;
  totalVestingAmount?: number;
  nextVestingDate?: Date;
  onClaimVested?: () => void;
  onBuyPlan?: () => void;
  onViewSchedule?: () => void;
  isOwned?: boolean;
}

export const VestingPlanCard: React.FC<VestingPlanCardProps> = ({
  plan,
  customerPlan,
  currentVestedAmount = 0,
  totalVestingAmount = 0,
  nextVestingDate,
  onClaimVested,
  onBuyPlan,
  onViewSchedule,
  isOwned = false,
}) => {
  const vestingStarted = new Date(plan.vestingStartDate) <= new Date();
  const vestingEnded = new Date(plan.vestingEndDate) <= new Date();
  const vestingPercentage = totalVestingAmount > 0 ? (currentVestedAmount / totalVestingAmount) * 100 : 0;
  
  const getStatusColor = () => {
    if (!isOwned) return '#007AFF';
    if (vestingEnded) return '#28a745';
    if (vestingStarted) return '#ffc107';
    return '#6c757d';
  };

  const getStatusText = () => {
    if (!isOwned) return 'Satın Alınabilir';
    if (vestingEnded) return 'Tamamlandı';
    if (vestingStarted) return 'Aktif';
    return 'Başlamadı';
  };

  const getDaysUntilStart = () => {
    const now = new Date();
    const start = new Date(plan.vestingStartDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getDaysUntilEnd = () => {
    const now = new Date();
    const end = new Date(plan.vestingEndDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleClaimVested = () => {
    if (currentVestedAmount <= 0) {
      Alert.alert('Bilgi', 'Henüz talep edilebilir vesting tutarı bulunmamaktadır.');
      return;
    }
    
    Alert.alert(
      'Vesting Talep Et',
      `${currentVestedAmount.toFixed(4)} MATIC tutarını talep etmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Talep Et', onPress: onClaimVested },
      ]
    );
  };

  const getProgressBarColor = () => {
    if (vestingPercentage >= 100) return '#28a745';
    if (vestingPercentage >= 50) return '#ffc107';
    return '#007AFF';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        <Text style={styles.planType}>Vesting Planı</Text>
      </View>

      <Text style={styles.description}>{plan.description}</Text>

      {isOwned && (
        <View style={styles.vestingSection}>
          <View style={styles.vestingHeader}>
            <Text style={styles.vestingTitle}>Vesting Durumu</Text>
            <Text style={styles.vestingStats}>
              {currentVestedAmount.toFixed(4)} / {totalVestingAmount.toFixed(4)} MATIC
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(vestingPercentage, 100)}%`,
                    backgroundColor: getProgressBarColor(),
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{vestingPercentage.toFixed(1)}%</Text>
          </View>

          <View style={styles.vestingDetails}>
            {!vestingStarted ? (
              <Text style={styles.waitingText}>
                Başlayacak: {getDaysUntilStart()} gün
              </Text>
            ) : !vestingEnded ? (
              <Text style={styles.activeText}>
                Kalan süre: {getDaysUntilEnd()} gün
              </Text>
            ) : (
              <Text style={styles.completedText}>
                Vesting tamamlandı
              </Text>
            )}
            
            {nextVestingDate && vestingStarted && !vestingEnded && (
              <Text style={styles.nextVestingText}>
                Sonraki vesting: {nextVestingDate.toLocaleDateString('tr-TR')}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Toplam Tutar:</Text>
          <Text style={styles.detailValue}>{plan.price} MATIC</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Başlangıç:</Text>
          <Text style={styles.detailValue}>
            {new Date(plan.vestingStartDate).toLocaleDateString('tr-TR')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bitiş:</Text>
          <Text style={styles.detailValue}>
            {new Date(plan.vestingEndDate).toLocaleDateString('tr-TR')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cliff Süresi:</Text>
          <Text style={styles.detailValue}>{plan.cliff} gün</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vesting Süresi:</Text>
          <Text style={styles.detailValue}>{plan.vestingPeriod} gün</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        {!isOwned ? (
          <TouchableOpacity style={styles.buyButton} onPress={onBuyPlan}>
            <Text style={styles.buttonText}>Satın Al</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ownedActions}>
            {vestingStarted && currentVestedAmount > 0 && (
              <TouchableOpacity style={styles.claimButton} onPress={handleClaimVested}>
                <Text style={styles.buttonText}>
                  Talep Et ({currentVestedAmount.toFixed(4)})
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.scheduleButton} onPress={onViewSchedule}>
              <Text style={styles.buttonText}>Takvim</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.buttonText}>Detaylar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  vestingSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  vestingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vestingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  vestingStats: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    minWidth: 40,
  },
  vestingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waitingText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeText: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: '500',
  },
  completedText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  nextVestingText: {
    fontSize: 12,
    color: '#666',
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 8,
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ownedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  claimButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 2,
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VestingPlanCard;
