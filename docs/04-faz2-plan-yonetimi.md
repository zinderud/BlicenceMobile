# 📋 04 - Faz 2: Plan Yönetimi Sistemi (3-4 Hafta)

## 🎯 Faz 2 Hedefleri

Bu fazda kullanıcıların planlarını yönetebilecekleri ve üreticilerin planlarını oluşturup düzenleyebilecekleri sistemleri geliştireceğiz:
- 3 farklı plan tipi için component'ler
- Plan listesi ve detay sayfaları
- Plan oluşturma ve düzenleme arayüzleri
- Gerçek zamanlı plan durumu takibi
- Blockchain contract entegrasyonu

## 📋 Sprint Planlaması

### Sprint 2.1: Plan Component'leri (4-5 gün)
- ✅ API Plan Card komponenti
- ✅ N-Usage Plan Card komponenti
- ✅ Vesting Plan Card komponenti
- ✅ Plan List komponenti
- ✅ Plan durumu göstergeleri

### Sprint 2.2: Müşteri Plan Yönetimi (4-5 gün)
- ✅ Müşteri dashboard ekranı
- ✅ Plan detay sayfaları
- ✅ Kullanım geçmişi
- ✅ Plan iptal/durdurma işlemleri
- ✅ Gerçek zamanlı durum güncellemeleri

### Sprint 2.3: Üretici Plan Yönetimi (5-6 gün)
- ✅ Üretici dashboard ekranı
- ✅ Plan oluşturma formu
- ✅ Plan düzenleme arayüzü
- ✅ Plan istatistikleri
- ✅ Müşteri yönetimi

## 🧩 Plan Component'leri

### API Plan Card Komponenti
```typescript
// src/components/plans/ApiPlanCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { formatCurrency, formatFlowRate, formatTimeRemaining } from '@/utils/formatters';
import { ApiPlan, CustomerPlan } from '@/types/plans';

interface ApiPlanCardProps {
  plan: ApiPlan;
  customerPlan: CustomerPlan;
  onManage?: () => void;
  onStop?: () => void;
  onViewDetails?: () => void;
}

export const ApiPlanCard: React.FC<ApiPlanCardProps> = ({
  plan,
  customerPlan,
  onManage,
  onStop,
  onViewDetails,
}) => {
  const { colors, spacing } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [totalSpent, setTotalSpent] = useState<number>(0);

  useEffect(() => {
    // Gerçek zamanlı harcama hesaplama
    const calculateSpent = () => {
      const flowRatePerSecond = parseFloat(plan.flowRate) / (30 * 24 * 60 * 60); // Aylık flow rate'i saniyeye çevir
      const elapsedSeconds = (Date.now() - customerPlan.startDate) / 1000;
      const spent = flowRatePerSecond * elapsedSeconds;
      setTotalSpent(spent);
    };

    // Kalan süre hesaplama
    const calculateTimeRemaining = () => {
      if (plan.monthLimit && plan.monthLimit > 0) {
        const nextMonthStart = new Date(customerPlan.startDate);
        nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
        const remaining = nextMonthStart.getTime() - Date.now();
        setTimeRemaining(formatTimeRemaining(remaining));
      }
    };

    calculateSpent();
    calculateTimeRemaining();

    // Her saniye güncelle
    const interval = setInterval(() => {
      calculateSpent();
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [plan, customerPlan]);

  const isActive = customerPlan.status === 'ACTIVE';
  const flowRateFormatted = formatFlowRate(plan.flowRate, plan.priceTokenAddress);
  const progressPercentage = plan.monthLimit 
    ? Math.min((totalSpent / plan.monthLimit) * 100, 100)
    : 0;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.planName, { color: colors.textPrimary }]}>
            {plan.name}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isActive ? colors.success : colors.warning }
          ]}>
            <Text style={styles.statusText}>
              {isActive ? 'Aktif' : 'Duraklatıldı'}
            </Text>
          </View>
        </View>
        
        {plan.image && (
          <View style={[styles.planImage, { backgroundColor: plan.backgroundColor || colors.primary }]}>
            <Text style={styles.planImageText}>{plan.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {plan.description}
        </Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Akış Hızı
            </Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {flowRateFormatted}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Toplam Harcama
            </Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {formatCurrency(totalSpent, plan.priceTokenAddress)}
            </Text>
          </View>

          {plan.monthLimit && (
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Aylık Limit
              </Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {formatCurrency(plan.monthLimit, plan.priceTokenAddress)}
              </Text>
            </View>
          )}
        </View>

        {plan.monthLimit && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Aylık Kullanım
              </Text>
              <Text style={[styles.progressPercentage, { color: colors.textPrimary }]}>
                {progressPercentage.toFixed(1)}%
              </Text>
            </View>
            <ProgressBar 
              progress={progressPercentage} 
              color={progressPercentage > 90 ? colors.warning : colors.primary}
            />
            {timeRemaining && (
              <Text style={[styles.timeRemaining, { color: colors.textSecondary }]}>
                Sıfırlanana kadar: {timeRemaining}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Detaylar"
          variant="outline"
          onPress={onViewDetails}
          style={styles.actionButton}
        />
        {onManage && (
          <Button
            title="Yönet"
            variant="secondary"
            onPress={onManage}
            style={styles.actionButton}
          />
        )}
        {onStop && isActive && (
          <Button
            title="Durdur"
            variant="danger"
            onPress={onStop}
            style={styles.actionButton}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 16,
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
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  planImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  planImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeRemaining: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
```

### N-Usage Plan Card Komponenti
```typescript
// src/components/plans/NUsagePlanCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { QRCodeModal } from '@/components/qr/QRCodeModal';
import { formatCurrency } from '@/utils/formatters';
import { NUsagePlan, CustomerPlan } from '@/types/plans';

interface NUsagePlanCardProps {
  plan: NUsagePlan;
  customerPlan: CustomerPlan;
  onUse?: () => void;
  onViewHistory?: () => void;
  onViewDetails?: () => void;
}

export const NUsagePlanCard: React.FC<NUsagePlanCardProps> = ({
  plan,
  customerPlan,
  onUse,
  onViewHistory,
  onViewDetails,
}) => {
  const { colors } = useTheme();
  const [showQRModal, setShowQRModal] = React.useState(false);
  
  const usedCount = customerPlan.totalUsage - customerPlan.remainingQuota;
  const totalCount = customerPlan.totalUsage;
  const usagePercentage = totalCount > 0 ? (usedCount / totalCount) * 100 : 0;
  const isExpired = customerPlan.remainingQuota <= 0;
  const isNearExpiry = customerPlan.remainingQuota <= 5 && customerPlan.remainingQuota > 0;

  const getStatusColor = () => {
    if (isExpired) return colors.error;
    if (isNearExpiry) return colors.warning;
    return colors.success;
  };

  const getStatusText = () => {
    if (isExpired) return 'Kullanım Tükendi';
    if (isNearExpiry) return 'Az Kaldı';
    return 'Aktif';
  };

  return (
    <>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.planName, { color: colors.textPrimary }]}>
              {plan.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
          
          {plan.image && (
            <View style={[styles.planImage, { backgroundColor: plan.backgroundColor || colors.primary }]}>
              <Text style={styles.planImageText}>{plan.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {plan.description}
          </Text>

          <View style={styles.usageContainer}>
            <View style={styles.usageHeader}>
              <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>
                Kullanım Durumu
              </Text>
              <Text style={[styles.usageCount, { color: colors.textPrimary }]}>
                {usedCount} / {totalCount}
              </Text>
            </View>
            
            <ProgressBar 
              progress={usagePercentage} 
              color={getStatusColor()}
              style={styles.progressBar}
            />
            
            <View style={styles.remainingContainer}>
              <Text style={[styles.remainingText, { color: colors.textSecondary }]}>
                Kalan: {customerPlan.remainingQuota} kullanım
              </Text>
              <Text style={[styles.priceText, { color: colors.textPrimary }]}>
                {formatCurrency(plan.oneUsagePrice, plan.priceTokenAddress)} / kullanım
              </Text>
            </View>
          </View>

          <View style={styles.limitsContainer}>
            <View style={styles.limitItem}>
              <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>
                Min. Kullanım
              </Text>
              <Text style={[styles.limitValue, { color: colors.textPrimary }]}>
                {plan.minUsageLimit}
              </Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>
                Max. Kullanım
              </Text>
              <Text style={[styles.limitValue, { color: colors.textPrimary }]}>
                {plan.maxUsageLimit}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Detaylar"
            variant="outline"
            onPress={onViewDetails}
            style={styles.actionButton}
          />
          
          {onViewHistory && (
            <Button
              title="Geçmiş"
              variant="secondary"
              onPress={onViewHistory}
              style={styles.actionButton}
            />
          )}
          
          <Button
            title="QR Kod"
            variant="primary"
            onPress={() => setShowQRModal(true)}
            style={styles.actionButton}
            disabled={isExpired}
          />
        </View>
      </Card>

      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        customerPlan={customerPlan}
        plan={plan}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 16,
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
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  planImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  planImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  usageContainer: {
    marginBottom: 16,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
  },
  usageCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    marginBottom: 8,
  },
  remainingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  limitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  limitItem: {
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
```

### Vesting Plan Card Komponenti
```typescript
// src/components/plans/VestingPlanCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { VestingPlan, CustomerPlan } from '@/types/plans';

interface VestingPlanCardProps {
  plan: VestingPlan;
  customerPlan: CustomerPlan;
  onActivate?: () => void;
  onViewDetails?: () => void;
}

export const VestingPlanCard: React.FC<VestingPlanCardProps> = ({
  plan,
  customerPlan,
  onActivate,
  onViewDetails,
}) => {
  const { colors } = useTheme();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const cliffDate = new Date(plan.cliffDate);
  const isCliffReached = currentTime >= cliffDate.getTime();
  const isActive = customerPlan.status === 'ACTIVE';
  const isReady = isCliffReached && !isActive;

  // Vested amount hesaplama
  const calculateVestedAmount = (): number => {
    if (!isActive || !isCliffReached) return 0;
    
    const elapsedTime = currentTime - cliffDate.getTime();
    const flowRatePerSecond = parseFloat(plan.flowRate) / (30 * 24 * 60 * 60); // Aylık flow rate'i saniyeye çevir
    const vestedAmount = (elapsedTime / 1000) * flowRatePerSecond;
    
    return Math.max(0, vestedAmount);
  };

  const vestedAmount = calculateVestedAmount();

  const getStatusInfo = () => {
    if (isActive) {
      return {
        text: 'Aktif',
        color: colors.success,
      };
    } else if (isReady) {
      return {
        text: 'Başlatılabilir',
        color: colors.warning,
      };
    } else {
      return {
        text: 'Beklemede',
        color: colors.textSecondary,
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.planName, { color: colors.textPrimary }]}>
            {plan.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>
        
        {plan.image && (
          <View style={[styles.planImage, { backgroundColor: plan.backgroundColor || colors.primary }]}>
            <Text style={styles.planImageText}>{plan.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {plan.description}
        </Text>

        <View style={styles.vestingInfo}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Başlangıç Tarihi
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {formatDate(cliffDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Başlangıç Ücreti
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {formatCurrency(plan.startAmount, plan.priceTokenAddress)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Akış Hızı
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {formatCurrency(parseFloat(plan.flowRate), plan.priceTokenAddress)} / ay
            </Text>
          </View>

          {isActive && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Toplam Vested
              </Text>
              <Text style={[styles.infoValue, { color: colors.success }]}>
                {formatCurrency(vestedAmount, plan.priceTokenAddress)}
              </Text>
            </View>
          )}
        </View>

        {!isCliffReached && (
          <View style={styles.countdownContainer}>
            <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
              Başlamaya kalan süre:
            </Text>
            <CountdownTimer 
              targetDate={cliffDate} 
              textStyle={{ color: colors.primary, fontSize: 18, fontWeight: '600' }}
            />
          </View>
        )}

        {isReady && (
          <View style={styles.readyContainer}>
            <Text style={[styles.readyText, { color: colors.warning }]}>
              ⚠️ Plan başlatılmaya hazır!
            </Text>
            <Text style={[styles.readySubtext, { color: colors.textSecondary }]}>
              Başlangıç ücreti ödenecek ve akış başlayacak.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Detaylar"
          variant="outline"
          onPress={onViewDetails}
          style={styles.actionButton}
        />
        
        {onActivate && isReady && (
          <Button
            title="Planı Başlat"
            variant="primary"
            onPress={onActivate}
            style={styles.actionButton}
          />
        )}
        
        {isActive && (
          <Button
            title="Aktif"
            variant="success"
            disabled
            style={styles.actionButton}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 16,
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
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  planImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  planImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  vestingInfo: {
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
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 16,
  },
  countdownLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  readyContainer: {
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    marginBottom: 16,
  },
  readyText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  readySubtext: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
```

## 📱 Plan Listesi ve Dashboard

### Müşteri Dashboard
```typescript
// src/screens/customer/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';
import { RootState, AppDispatch } from '@/store';
import { fetchCustomerPlans, fetchWalletBalance } from '@/store/slices/customerSlice';

import { ApiPlanCard } from '@/components/plans/ApiPlanCard';
import { NUsagePlanCard } from '@/components/plans/NUsagePlanCard';
import { VestingPlanCard } from '@/components/plans/VestingPlanCard';
import { StatsCard } from '@/components/common/StatsCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

export const DashboardScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  const { 
    plans, 
    isLoading, 
    error,
    totalValue,
    activeCount,
    walletBalance 
  } = useSelector((state: RootState) => state.customer);
  
  const { walletAddress } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      loadData();
    }
  }, [walletAddress]);

  const loadData = async () => {
    if (walletAddress) {
      await Promise.all([
        dispatch(fetchCustomerPlans(walletAddress)),
        dispatch(fetchWalletBalance(walletAddress))
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderPlanCard = (customerPlan: any) => {
    const { plan } = customerPlan;
    
    switch (plan.planType) {
      case 'API':
        return (
          <ApiPlanCard
            key={customerPlan.custumerPlanId}
            plan={plan}
            customerPlan={customerPlan}
            onViewDetails={() => navigation.navigate('PlanDetail', { customerPlanId: customerPlan.custumerPlanId })}
          />
        );
      case 'N_USAGE':
        return (
          <NUsagePlanCard
            key={customerPlan.custumerPlanId}
            plan={plan}
            customerPlan={customerPlan}
            onViewDetails={() => navigation.navigate('PlanDetail', { customerPlanId: customerPlan.custumerPlanId })}
            onViewHistory={() => navigation.navigate('UsageHistory', { customerPlanId: customerPlan.custumerPlanId })}
          />
        );
      case 'VESTING':
        return (
          <VestingPlanCard
            key={customerPlan.custumerPlanId}
            plan={plan}
            customerPlan={customerPlan}
            onViewDetails={() => navigation.navigate('PlanDetail', { customerPlanId: customerPlan.custumerPlanId })}
            onActivate={() => {/* TODO: Implement activation */}}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && plans.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <StatsCard
          title="Toplam Değer"
          value={`${totalValue.toFixed(2)} DAI`}
          icon="wallet"
          color={colors.primary}
        />
        <StatsCard
          title="Aktif Planlar"
          value={activeCount.toString()}
          icon="list"
          color={colors.success}
        />
        <StatsCard
          title="Cüzdan Bakiyesi"
          value={`${walletBalance.toFixed(2)} ETH`}
          icon="card"
          color={colors.accent}
        />
      </View>

      {/* Plans Section */}
      <View style={styles.plansSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Aktif Planlarım
        </Text>
        
        {plans.length === 0 ? (
          <EmptyState
            title="Henüz bir planınız yok"
            description="Marketplace'den planları keşfedin ve satın alın."
            actionText="Planları Keşfet"
            onAction={() => navigation.navigate('Marketplace')}
          />
        ) : (
          plans.map(renderPlanCard)
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  plansSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
```

Bu Faz 2'nin tamamlanmasıyla kullanıcılar planlarını görüntüleyebilecek ve temel yönetim işlemlerini yapabilecekler. Sonraki fazda NFT ve QR kod sistemi geliştirilecek.
