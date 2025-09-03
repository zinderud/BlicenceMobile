import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useAppSelector } from '../../store';
import ApiPlanCard, { ApiPlan } from '../../components/plans/ApiPlanCard';
import NUsagePlanCard, { NUsagePlan } from '../../components/plans/NUsagePlanCard';
import VestingPlanCard, { VestingPlan } from '../../components/plans/VestingPlanCard';

type PlanType = 'all' | 'api' | 'vesting' | 'nusage';

interface MarketplacePlan {
  id: string;
  type: 'api' | 'vesting' | 'nusage';
  plan: ApiPlan | VestingPlan | NUsagePlan;
  producer: {
    id: string;
    name: string;
    rating: number;
    totalSales: number;
  };
  isOwned: boolean;
}

const MarketplaceScreen: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [plans, setPlans] = useState<MarketplacePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MarketplacePlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<PlanType>('all');

  useEffect(() => {
    loadMarketplacePlans();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [plans, searchQuery, selectedFilter]);

  const loadMarketplacePlans = async () => {
    // TODO: Implement actual marketplace plan loading from blockchain
    // For now, showing mock data
    const mockPlans: MarketplacePlan[] = [
      {
        id: 'mp1',
        type: 'api',
        isOwned: false,
        plan: {
          id: 'api1',
          name: 'Premium API Access',
          description: 'High-performance API with unlimited requests and 24/7 support.',
          price: '15.0',
          duration: 30,
          flowRate: '0.5',
          isActive: true,
          createdAt: '2024-01-01',
        } as ApiPlan,
        producer: {
          id: 'prod1',
          name: 'TechCorp Solutions',
          rating: 4.8,
          totalSales: 156,
        },
      },
      {
        id: 'mp2',
        type: 'nusage',
        isOwned: false,
        plan: {
          id: 'nusage1',
          name: 'AI Image Generation Credits',
          description: 'Generate high-quality images using our AI models. Each credit = 1 image.',
          price: '20.0',
          totalUsageLimit: 50,
          pricePerUsage: '0.4',
          isActive: true,
          createdAt: '2024-01-10',
        } as NUsagePlan,
        producer: {
          id: 'prod2',
          name: 'AI Innovations',
          rating: 4.6,
          totalSales: 89,
        },
      },
      {
        id: 'mp3',
        type: 'vesting',
        isOwned: false,
        plan: {
          id: 'vest1',
          name: 'Startup Investment Vesting',
          description: 'Invest in promising startups with a structured vesting schedule.',
          price: '100.0',
          vestingStartDate: '2024-03-01',
          vestingEndDate: '2024-09-01',
          cliff: 60,
          vestingPeriod: 180,
          isActive: true,
          createdAt: '2024-01-05',
        } as VestingPlan,
        producer: {
          id: 'prod3',
          name: 'Venture Capital Plus',
          rating: 4.9,
          totalSales: 234,
        },
      },
      {
        id: 'mp4',
        type: 'api',
        isOwned: true, // User already owns this
        plan: {
          id: 'api2',
          name: 'Basic API Plan',
          description: 'Essential API access for small projects.',
          price: '5.0',
          duration: 30,
          flowRate: '0.17',
          isActive: true,
          createdAt: '2024-01-01',
        } as ApiPlan,
        producer: {
          id: 'prod1',
          name: 'TechCorp Solutions',
          rating: 4.8,
          totalSales: 156,
        },
      },
    ];
    
    setPlans(mockPlans);
  };

  const filterPlans = () => {
    let filtered = plans;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(plan => plan.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plan => 
        plan.plan.name.toLowerCase().includes(query) ||
        plan.plan.description.toLowerCase().includes(query) ||
        plan.producer.name.toLowerCase().includes(query)
      );
    }

    setFilteredPlans(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarketplacePlans();
    setRefreshing(false);
  };

  const handleBuyPlan = (planId: string) => {
    // TODO: Implement actual purchase logic
    console.log('Buying plan:', planId);
  };

  const renderFilterButton = (filter: PlanType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPlanItem = ({ item }: { item: MarketplacePlan }) => {
    const commonProps = {
      onBuyPlan: () => handleBuyPlan(item.id),
      isOwned: item.isOwned,
    };

    const PlanComponent = () => {
      switch (item.type) {
        case 'api':
          return (
            <ApiPlanCard
              plan={item.plan as ApiPlan}
              flowRate={(item.plan as ApiPlan).flowRate}
              totalSpent={0}
              {...commonProps}
            />
          );
        
        case 'nusage':
          return (
            <NUsagePlanCard
              plan={item.plan as NUsagePlan}
              remainingUsage={(item.plan as NUsagePlan).totalUsageLimit}
              usageHistory={[]}
              {...commonProps}
            />
          );
        
        case 'vesting':
          return (
            <VestingPlanCard
              plan={item.plan as VestingPlan}
              currentVestedAmount={0}
              totalVestingAmount={parseFloat(item.plan.price)}
              {...commonProps}
            />
          );
        
        default:
          return null;
      }
    };

    return (
      <View style={styles.marketplaceItem}>
        {PlanComponent()}
        
        {/* Producer Info */}
        <View style={styles.producerInfo}>
          <Text style={styles.producerName}>{item.producer.name}</Text>
          <View style={styles.producerStats}>
            <Text style={styles.producerRating}>⭐ {item.producer.rating.toFixed(1)}</Text>
            <Text style={styles.producerSales}>{item.producer.totalSales} satış</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Plan Bulunamadı</Text>
      <Text style={styles.emptyDescription}>
        Arama kriterlerinizi değiştirin veya farklı bir kategori seçin.
      </Text>
      <TouchableOpacity 
        style={styles.clearFiltersButton}
        onPress={() => {
          setSearchQuery('');
          setSelectedFilter('all');
        }}
      >
        <Text style={styles.clearFiltersText}>Filtreleri Temizle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <Text style={styles.headerSubtitle}>Plan keşfedin ve satın alın</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Plan veya üretici ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('all', 'Tümü')}
        {renderFilterButton('api', 'API')}
        {renderFilterButton('nusage', 'Kullanım')}
        {renderFilterButton('vesting', 'Vesting')}
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredPlans.length} plan bulundu
        </Text>
      </View>

      {/* Plans List */}
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
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  marketplaceItem: {
    marginBottom: 8,
  },
  producerInfo: {
    backgroundColor: 'white',
    marginTop: -8,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  producerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  producerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  producerRating: {
    fontSize: 12,
    color: '#666',
  },
  producerSales: {
    fontSize: 12,
    color: '#666',
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
  clearFiltersButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MarketplaceScreen;
