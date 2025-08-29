import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ProgressBarAndroid } from 'react-native';

export interface NUsagePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  totalUsageLimit: number;
  pricePerUsage: string;
  isActive: boolean;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  amount: number;
  cost: string;
  description?: string;
}

interface NUsagePlanCardProps {
  plan: NUsagePlan;
  customerPlan?: any;
  remainingUsage: number;
  usageHistory: UsageRecord[];
  onUsePlan?: () => void;
  onBuyPlan?: () => void;
  onViewHistory?: () => void;
  isOwned?: boolean;
}

export const NUsagePlanCard: React.FC<NUsagePlanCardProps> = ({
  plan,
  customerPlan,
  remainingUsage,
  usageHistory,
  onUsePlan,
  onBuyPlan,
  onViewHistory,
  isOwned = false,
}) => {
  const totalUsage = plan.totalUsageLimit;
  const usedAmount = totalUsage - remainingUsage;
  const usagePercentage = totalUsage > 0 ? (usedAmount / totalUsage) * 100 : 0;

  const getStatusColor = () => {
    if (!isOwned) return '#007AFF';
    if (remainingUsage <= 0) return '#dc3545';
    if (usagePercentage > 80) return '#ffc107';
    return '#28a745';
  };

  const getStatusText = () => {
    if (!isOwned) return 'Satın Alınabilir';
    if (remainingUsage <= 0) return 'Kullanım Doldu';
    if (usagePercentage > 80) return 'Az Kullanım Kaldı';
    return 'Aktif';
  };

  const handleUsePlan = () => {
    if (remainingUsage <= 0) {
      Alert.alert('Uyarı', 'Bu plana ait kullanım hakkınız kalmamıştır.');
      return;
    }
    onUsePlan?.();
  };

  const getProgressBarColor = () => {
    if (usagePercentage > 80) return '#dc3545';
    if (usagePercentage > 60) return '#ffc107';
    return '#28a745';
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
        <Text style={styles.planType}>Kullanım Planı</Text>
      </View>

      <Text style={styles.description}>{plan.description}</Text>

      {isOwned && (
        <View style={styles.usageSection}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageTitle}>Kullanım Durumu</Text>
            <Text style={styles.usageStats}>
              {usedAmount} / {totalUsage} kullanım
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(usagePercentage, 100)}%`,
                    backgroundColor: getProgressBarColor(),
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{usagePercentage.toFixed(1)}%</Text>
          </View>

          <View style={styles.usageDetails}>
            <Text style={styles.remainingText}>
              Kalan: {remainingUsage} kullanım
            </Text>
            <Text style={styles.recentUsageText}>
              Son kullanım: {usageHistory.length > 0 
                ? new Date(usageHistory[0].timestamp).toLocaleDateString('tr-TR')
                : 'Henüz kullanılmadı'
              }
            </Text>
          </View>
        </View>
      )}

      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Toplam Fiyat:</Text>
          <Text style={styles.detailValue}>{plan.price} MATIC</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Kullanım Başına:</Text>
          <Text style={styles.detailValue}>{plan.pricePerUsage} MATIC</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Toplam Kullanım:</Text>
          <Text style={styles.detailValue}>{plan.totalUsageLimit} adet</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        {!isOwned ? (
          <TouchableOpacity style={styles.buyButton} onPress={onBuyPlan}>
            <Text style={styles.buttonText}>Satın Al</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ownedActions}>
            <TouchableOpacity 
              style={[
                styles.useButton, 
                remainingUsage <= 0 && styles.disabledButton
              ]} 
              onPress={handleUsePlan}
              disabled={remainingUsage <= 0}
            >
              <Text style={styles.buttonText}>
                {remainingUsage > 0 ? 'Kullan' : 'Kullanım Doldu'}
              </Text>
            </TouchableOpacity>
            
            {usageHistory.length > 0 && (
              <TouchableOpacity style={styles.historyButton} onPress={onViewHistory}>
                <Text style={styles.buttonText}>Geçmiş</Text>
              </TouchableOpacity>
            )}
            
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
  usageSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  usageStats: {
    fontSize: 12,
    color: '#666',
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
  usageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  remainingText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  recentUsageText: {
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
  useButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  historyButton: {
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
  disabledButton: {
    backgroundColor: '#adb5bd',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NUsagePlanCard;
