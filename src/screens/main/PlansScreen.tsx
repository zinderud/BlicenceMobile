import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAppSelector } from '../../store';
import ApiPlanCard, { ApiPlan } from '../../components/plans/ApiPlanCard';
import NUsagePlanCard, { NUsagePlan, UsageRecord } from '../../components/plans/NUsagePlanCard';
import VestingPlanCard, { VestingPlan } from '../../components/plans/VestingPlanCard';

type PlanType = 'api' | 'vesting' | 'nusage';

interface PlanItem {
  id: string;
  type: PlanType;
  plan: ApiPlan | VestingPlan | NUsagePlan;
  customerPlan?: any;
  isOwned: boolean;
}

const PlansScreen: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    // TODO: Implement actual plan loading from blockchain
    // For now, showing mock data with different plan types
    const mockPlans: PlanItem[] = [
      {
        id: '1',
        type: 'api',
        isOwned: true,
        plan: {
          id: '1',
          name: 'API Premium Plan',
          description: 'Aylık premium API erişimi ile sınırsız istek yapabilirsiniz. 7/24 destek dahildir.',
          price: '10.5',
          duration: 30,
          flowRate: '0.35',
          isActive: true,
          createdAt: '2024-01-01',
        } as ApiPlan,
        customerPlan: {
          id: 'cp1',
          isActive: true,
          totalSpent: '5.25',
          nextPaymentDate: '2024-02-01',
        },
      },
      {
        id: '2',
        type: 'nusage',
        isOwned: true,
        plan: {
          id: '2',
          name: 'Video Processing Credits',
          description: 'Video işleme için kullanabileceğiniz kredi paketi. Her işlem için 1 kredi harcanır.',
          price: '25.0',
          totalUsageLimit: 100,
          pricePerUsage: '0.25',
          isActive: true,
          createdAt: '2024-01-15',
        } as NUsagePlan,
      },
      {
        id: '3',
        type: 'vesting',
        isOwned: true,
        plan: {
          id: '3',
          name: 'Premium Vesting Plan',
          description: 'Altı aylık vesting planı ile kademeli olarak token kazanın.',
          price: '50.0',
          vestingStartDate: '2024-02-01',
          vestingEndDate: '2024-08-01',
          cliff: 30,
          vestingPeriod: 180,
          isActive: true,
          createdAt: '2024-01-10',
        } as VestingPlan,
      },
      {
        id: '4',
        type: 'api',
        isOwned: false,
        plan: {
          id: '4',
          name: 'Basic API Plan',
          description: 'Temel API erişimi ile günlük 1000 istek hakkı.',
          price: '5.0',
          duration: 30,
          flowRate: '0.17',
          isActive: true,
          createdAt: '2024-01-01',
        } as ApiPlan,
      },
    ];
    
    setPlans(mockPlans);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleUsePlan = (planId: string) => {
    Alert.alert('Plan Kullan', `Plan ${planId} kullanılıyor...`);
  };

  const handleStopPlan = (planId: string) => {
    Alert.alert('Plan Durduruldu', `Plan ${planId} durduruldu.`);
  };

  const handleBuyPlan = (planId: string) => {
    Alert.alert('Plan Satın Al', `Plan ${planId} satın alınıyor...`);
  };

  const handleClaimVested = (planId: string) => {
    Alert.alert('Vesting Talep Edildi', `Plan ${planId} için vesting talep edildi.`);
  };

  const handleViewHistory = (planId: string) => {
    Alert.alert('Kullanım Geçmişi', `Plan ${planId} kullanım geçmişi gösteriliyor...`);
  };

  const handleViewSchedule = (planId: string) => {
    Alert.alert('Vesting Takvimi', `Plan ${planId} vesting takvimi gösteriliyor...`);
  };

  const renderPlanItem = ({ item }: { item: PlanItem }) => {
    const commonProps = {
      onBuyPlan: () => handleBuyPlan(item.id),
      isOwned: item.isOwned,
    };

    switch (item.type) {
      case 'api':
        return (
          <ApiPlanCard
            plan={item.plan as ApiPlan}
            customerPlan={item.customerPlan}
            flowRate={item.customerPlan?.flowRate || (item.plan as ApiPlan).flowRate}
            nextPayment={item.customerPlan?.nextPaymentDate ? new Date(item.customerPlan.nextPaymentDate) : undefined}
            totalSpent={parseFloat(item.customerPlan?.totalSpent || '0')}
            onStopPlan={() => handleStopPlan(item.id)}
            onUsePlan={() => handleUsePlan(item.id)}
            {...commonProps}
          />
        );
      
      case 'nusage':
        const nUsagePlan = item.plan as NUsagePlan;
        const remainingUsage = 75; // Mock data
        const usageHistory: UsageRecord[] = [
          {
            id: '1',
            timestamp: '2024-01-25T10:30:00Z',
            amount: 5,
            cost: '1.25',
            description: 'Video processing batch',
          },
        ];
        
        return (
          <NUsagePlanCard
            plan={nUsagePlan}
            customerPlan={item.customerPlan}
            remainingUsage={remainingUsage}
            usageHistory={usageHistory}
            onUsePlan={() => handleUsePlan(item.id)}
            onViewHistory={() => handleViewHistory(item.id)}
            {...commonProps}
          />
        );
      
      case 'vesting':
        const vestingPlan = item.plan as VestingPlan;
        const currentVestedAmount = 12.5; // Mock data
        const totalVestingAmount = 50.0;
        const nextVestingDate = new Date('2024-02-15');
        
        return (
          <VestingPlanCard
            plan={vestingPlan}
            customerPlan={item.customerPlan}
            currentVestedAmount={currentVestedAmount}
            totalVestingAmount={totalVestingAmount}
            nextVestingDate={nextVestingDate}
            onClaimVested={() => handleClaimVested(item.id)}
            onViewSchedule={() => handleViewSchedule(item.id)}
            {...commonProps}
          />
        );
      
      default:
        return null;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {user?.userType === 'customer' ? 'Henüz Planınız Yok' : 'Henüz Plan Oluşturmadınız'}
      </Text>
      <Text style={styles.emptyDescription}>
        {user?.userType === 'customer' 
          ? 'Marketplace\'ten plan satın alarak başlayın' 
          : 'İlk planınızı oluşturun ve satışa başlayın'
        }
      </Text>
      <TouchableOpacity style={styles.emptyActionButton}>
        <Text style={styles.emptyActionText}>
          {user?.userType === 'customer' ? 'Marketplace\'e Git' : 'Plan Oluştur'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const filteredPlans = user?.userType === 'customer' 
    ? plans // Müşteriler hem sahip oldukları hem de satın alabilecekleri planları görür
    : plans.filter(plan => plan.isOwned); // Üreticiler sadece kendi planlarını görür

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.userType === 'customer' ? 'Planlarım' : 'Yayınlanan Planlarım'}
        </Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlanItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
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
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlansScreen;
