import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export interface ApiPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: number; // in days
  flowRate: string; // tokens per second
  isActive: boolean;
  createdAt: string;
}

export interface CustomerPlan {
  id: string;
  planId: string;
  userId: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  totalSpent: string;
  nextPaymentDate?: string;
}

interface ApiPlanCardProps {
  plan: ApiPlan;
  customerPlan?: CustomerPlan;
  flowRate: string;
  nextPayment?: Date;
  totalSpent: number;
  onStopPlan?: () => void;
  onUsePlan?: () => void;
  onBuyPlan?: () => void;
  isOwned?: boolean;
}

export const ApiPlanCard: React.FC<ApiPlanCardProps> = ({
  plan,
  customerPlan,
  flowRate,
  nextPayment,
  totalSpent,
  onStopPlan,
  onUsePlan,
  onBuyPlan,
  isOwned = false,
}) => {
  const handleStopPlan = () => {
    Alert.alert(
      'Planı Durdur',
      'Bu planı durdurmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Durdur', style: 'destructive', onPress: onStopPlan },
      ]
    );
  };

  const getStatusColor = () => {
    if (!isOwned) return '#007AFF';
    return customerPlan?.isActive ? '#28a745' : '#6c757d';
  };

  const getStatusText = () => {
    if (!isOwned) return 'Satın Alınabilir';
    return customerPlan?.isActive ? 'Aktif' : 'Pasif';
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
        <Text style={styles.planType}>API Plan</Text>
      </View>

      <Text style={styles.description}>{plan.description}</Text>

      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fiyat:</Text>
          <Text style={styles.detailValue}>{plan.price} MATIC</Text>
        </View>

        {isOwned && customerPlan && (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Akış Hızı:</Text>
              <Text style={styles.detailValue}>{flowRate} MATIC/ay</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Toplam Harcama:</Text>
              <Text style={styles.detailValue}>{totalSpent.toFixed(4)} MATIC</Text>
            </View>

            {nextPayment && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sonraki Ödeme:</Text>
                <Text style={styles.detailValue}>{nextPayment.toLocaleDateString('tr-TR')}</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Süre:</Text>
          <Text style={styles.detailValue}>{plan.duration} gün</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        {!isOwned ? (
          <TouchableOpacity style={styles.buyButton} onPress={onBuyPlan}>
            <Text style={styles.buttonText}>Satın Al</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ownedActions}>
            {customerPlan?.isActive && (
              <>
                <TouchableOpacity style={styles.useButton} onPress={onUsePlan}>
                  <Text style={styles.buttonText}>Kullan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stopButton} onPress={handleStopPlan}>
                  <Text style={styles.buttonText}>Durdur</Text>
                </TouchableOpacity>
              </>
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
  stopButton: {
    backgroundColor: '#dc3545',
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

export default ApiPlanCard;
