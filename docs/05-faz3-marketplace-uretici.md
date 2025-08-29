# 🛒 05 - Faz 3: Marketplace ve Üretici Sistemi (4-5 Hafta)

## 🎯 Faz 3 Hedefleri

Bu fazda kullanıcıların yeni planları keşfedebileceği marketplace'i ve üreticilerin planlarını yönetebileceği sistemi geliştireceğiz:
- Marketplace arayüzü ve plan keşif sistemi
- Kategori bazlı filtreleme ve arama
- Üretici profil sayfaları
- Üretici dashboard ve plan yönetimi
- Plan oluşturma ve düzenleme araçları
- Müşteri analitiği ve gelir takibi

## 📋 Sprint Planlaması

### Sprint 3.1: Marketplace Temel Altyapı (5-6 gün)
- ✅ Marketplace ana sayfası
- ✅ Plan kategorileri ve filtreleme
- ✅ Arama fonksiyonalitesi
- ✅ Plan listesi ve grid görünümleri
- ✅ Infinite scroll ve pagination

### Sprint 3.2: Plan Keşif ve Önizleme (4-5 gün)
- ✅ Plan detay önizleme modali
- ✅ Üretici profil sayfaları
- ✅ Plan karşılaştırma
- ✅ Favori planlar sistemi
- ✅ Sosyal proof (değerlendirmeler)

### Sprint 3.3: Üretici Dashboard (5-6 gün)
- ✅ Üretici ana dashboard
- ✅ Plan oluşturma wizard'ı
- ✅ Plan düzenleme arayüzü
- ✅ Müşteri listesi ve detayları
- ✅ Gelir analitiği

### Sprint 3.4: İleri Üretici Özellikleri (4-5 gün)
- ✅ Plan performans analitiği
- ✅ Müşteri segmentasyonu
- ✅ Bildirim yönetimi
- ✅ Toplu işlemler

## 🛒 Marketplace Sistemi

### Marketplace Ana Sayfası
```typescript
// src/screens/marketplace/MarketplaceScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { RootState, AppDispatch } from '@/store';
import { 
  fetchFeaturedPlans, 
  fetchCategories, 
  searchPlans 
} from '@/store/slices/marketplaceSlice';

import { SearchBar } from '@/components/marketplace/SearchBar';
import { CategoryGrid } from '@/components/marketplace/CategoryGrid';
import { FeaturedPlans } from '@/components/marketplace/FeaturedPlans';
import { PlanGrid } from '@/components/marketplace/PlanGrid';
import { FilterModal } from '@/components/marketplace/FilterModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const MarketplaceScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    featuredPlans,
    categories,
    searchResults,
    isLoading,
    error,
    filters
  } = useSelector((state: RootState) => state.marketplace);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'featured' | 'categories' | 'search'>('featured');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      dispatch(fetchFeaturedPlans()),
      dispatch(fetchCategories())
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveSection('search');
      await dispatch(searchPlans({ query, filters }));
    } else {
      setActiveSection('featured');
    }
  }, [filters]);

  const handleCategorySelect = (categoryId: string) => {
    navigation.navigate('CategoryPlans', { categoryId });
  };

  const handlePlanPress = (planId: number) => {
    navigation.navigate('PlanPreview', { planId });
  };

  const handleProducerPress = (producerAddress: string) => {
    navigation.navigate('ProducerProfile', { producerAddress });
  };

  if (isLoading && !featuredPlans.length) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Search */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Planları Keşfet
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onFilterPress={() => setShowFilters(true)}
          placeholder="Plan veya üretici ara..."
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {activeSection === 'featured' && (
          <>
            {/* Featured Plans Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Öne Çıkan Planlar
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('AllFeatured')}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>
                    Tümünü Gör
                  </Text>
                </TouchableOpacity>
              </View>
              <FeaturedPlans
                plans={featuredPlans}
                onPlanPress={handlePlanPress}
                onProducerPress={handleProducerPress}
              />
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Kategoriler
              </Text>
              <CategoryGrid
                categories={categories}
                onCategoryPress={handleCategorySelect}
              />
            </View>

            {/* Popular Plans Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Popüler Planlar
              </Text>
              <PlanGrid
                plans={featuredPlans.slice(0, 6)} // Geçici olarak featured'dan kullan
                onPlanPress={handlePlanPress}
                numColumns={2}
              />
            </View>
          </>
        )}

        {activeSection === 'categories' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Tüm Kategoriler
            </Text>
            <CategoryGrid
              categories={categories}
              onCategoryPress={handleCategorySelect}
              expanded
            />
          </View>
        )}

        {activeSection === 'search' && (
          <View style={styles.section}>
            <View style={styles.searchHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Arama Sonuçları
              </Text>
              <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
                {searchResults.length} plan bulundu
              </Text>
            </View>
            <PlanGrid
              plans={searchResults}
              onPlanPress={handlePlanPress}
              numColumns={1}
              showProducer
            />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={(newFilters) => {
          // Apply filters and refresh search if needed
          if (searchQuery.trim()) {
            dispatch(searchPlans({ query: searchQuery, filters: newFilters }));
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 14,
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

### Plan Önizleme Modali
```typescript
// src/components/marketplace/PlanPreviewModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatFlowRate } from '@/utils/formatters';
import { Plan, Producer } from '@/types/plans';

interface PlanPreviewModalProps {
  visible: boolean;
  plan: Plan | null;
  producer: Producer | null;
  onClose: () => void;
  onPurchase?: (plan: Plan) => void;
  onViewProducer?: (producer: Producer) => void;
}

const { height } = Dimensions.get('window');

export const PlanPreviewModal: React.FC<PlanPreviewModalProps> = ({
  visible,
  plan,
  producer,
  onClose,
  onPurchase,
  onViewProducer,
}) => {
  const { colors, spacing } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!plan || !producer) return null;

  const renderPlanSpecificInfo = () => {
    switch (plan.planType) {
      case 'API':
        return (
          <View style={styles.planInfo}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
              Akış Detayları
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Akış Hızı
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {formatFlowRate(plan.flowRate, plan.priceTokenAddress)}
              </Text>
            </View>
            {plan.monthLimit && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Aylık Limit
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {formatCurrency(plan.monthLimit, plan.priceTokenAddress)}
                </Text>
              </View>
            )}
          </View>
        );

      case 'N_USAGE':
        return (
          <View style={styles.planInfo}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
              Kullanım Detayları
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Kullanım Başına
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {formatCurrency(plan.oneUsagePrice, plan.priceTokenAddress)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Min. Kullanım
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {plan.minUsageLimit}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Max. Kullanım
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {plan.maxUsageLimit}
              </Text>
            </View>
          </View>
        );

      case 'VESTING':
        return (
          <View style={styles.planInfo}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
              Vesting Detayları
            </Text>
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
                Cliff Süresi
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {plan.cliffDate ? new Date(plan.cliffDate).toLocaleDateString() : 'Belirlenmemiş'}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
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
            Plan Detayları
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Plan Image/Header */}
          <View style={[styles.planHeader, { backgroundColor: plan.backgroundColor || colors.primary }]}>
            {plan.image ? (
              <Image source={{ uri: plan.image }} style={styles.planImage} />
            ) : (
              <View style={styles.planPlaceholder}>
                <Text style={styles.planPlaceholderText}>{plan.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          {/* Plan Basic Info */}
          <View style={styles.basicInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.planName, { color: colors.textPrimary }]}>
                {plan.name}
              </Text>
              <Badge
                text={plan.planType}
                color={getPlanTypeColor(plan.planType)}
              />
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {plan.description}
            </Text>

            {/* Producer Info */}
            <TouchableOpacity
              style={styles.producerInfo}
              onPress={() => onViewProducer?.(producer)}
            >
              <View style={styles.producerAvatar}>
                <Text style={styles.producerAvatarText}>
                  {producer.producerName.charAt(0)}
                </Text>
              </View>
              <View style={styles.producerDetails}>
                <Text style={[styles.producerName, { color: colors.textPrimary }]}>
                  {producer.producerName}
                </Text>
                <Text style={[styles.producerSite, { color: colors.textSecondary }]}>
                  {producer.siteName || 'Websitesi belirtilmemiş'}
                </Text>
              </View>
              <Text style={[styles.viewProducer, { color: colors.primary }]}>
                Görüntüle →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Plan Specific Information */}
          {renderPlanSpecificInfo()}

          {/* Plan Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {plan.totalSupply || 'Sınırsız'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Toplam Kapasite
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {plan.currentUsage || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Mevcut Kullanım
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {plan.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Durum
              </Text>
            </View>
          </View>

          {/* External Link */}
          {plan.externalLink && (
            <TouchableOpacity style={styles.externalLink}>
              <Text style={[styles.externalLinkText, { color: colors.primary }]}>
                🔗 Dış Bağlantıyı Görüntüle
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Purchase Button */}
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <Button
            title="Planı Satın Al"
            onPress={() => onPurchase?.(plan)}
            style={styles.purchaseButton}
            disabled={plan.status !== 'ACTIVE'}
          />
        </View>
      </View>
    </Modal>
  );
};

const getPlanTypeColor = (planType: string): string => {
  switch (planType) {
    case 'API':
      return '#10B981';
    case 'N_USAGE':
      return '#F59E0B';
    case 'VESTING':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
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
  },
  planHeader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  planPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
  },
  basicInfo: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  producerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  producerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  producerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  producerDetails: {
    flex: 1,
  },
  producerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  producerSite: {
    fontSize: 14,
  },
  viewProducer: {
    fontSize: 14,
    fontWeight: '500',
  },
  planInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  externalLink: {
    padding: 16,
    alignItems: 'center',
  },
  externalLinkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  purchaseButton: {
    width: '100%',
  },
});
```

## 🏭 Üretici Dashboard Sistemi

### Üretici Ana Dashboard
```typescript
// src/screens/producer/ProducerDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { RootState, AppDispatch } from '@/store';
import { 
  fetchProducerStats, 
  fetchProducerPlans,
  fetchRecentCustomers 
} from '@/store/slices/producerSlice';

import { StatsCard } from '@/components/common/StatsCard';
import { Chart } from '@/components/common/Chart';
import { RecentActivity } from '@/components/producer/RecentActivity';
import { QuickActions } from '@/components/producer/QuickActions';
import { TopPlans } from '@/components/producer/TopPlans';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const ProducerDashboardScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    stats,
    recentActivity,
    topPlans,
    isLoading,
    error
  } = useSelector((state: RootState) => state.producer);
  
  const { walletAddress } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (walletAddress) {
      loadDashboardData();
    }
  }, [walletAddress, selectedTimeframe]);

  const loadDashboardData = async () => {
    if (walletAddress) {
      await Promise.all([
        dispatch(fetchProducerStats({ producerAddress: walletAddress, timeframe: selectedTimeframe })),
        dispatch(fetchProducerPlans(walletAddress)),
        dispatch(fetchRecentCustomers(walletAddress))
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (isLoading && !stats) {
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
      {/* Quick Actions */}
      <View style={styles.section}>
        <QuickActions
          onCreatePlan={() => navigation.navigate('CreatePlan')}
          onViewCustomers={() => navigation.navigate('Customers')}
          onViewAnalytics={() => navigation.navigate('Analytics')}
          onManagePlans={() => navigation.navigate('ManagePlans')}
        />
      </View>

      {/* Stats Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Genel Bakış
          </Text>
          <View style={styles.timeframeSelector}>
            {(['7d', '30d', '90d'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === period && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedTimeframe(period)}
              >
                <Text style={[
                  styles.timeframeText,
                  { color: selectedTimeframe === period ? 'white' : colors.textSecondary }
                ]}>
                  {period === '7d' ? '7 Gün' : period === '30d' ? '30 Gün' : '90 Gün'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="Toplam Gelir"
            value={`${stats?.totalRevenue.toFixed(2) || 0} DAI`}
            change={stats?.revenueChange}
            icon="trending-up"
            color={colors.success}
          />
          <StatsCard
            title="Aktif Müşteriler"
            value={stats?.activeCustomers?.toString() || '0'}
            change={stats?.customerChange}
            icon="users"
            color={colors.primary}
          />
          <StatsCard
            title="Aktif Planlar"
            value={stats?.activePlans?.toString() || '0'}
            change={stats?.planChange}
            icon="list"
            color={colors.accent}
          />
          <StatsCard
            title="Dönüşüm Oranı"
            value={`${stats?.conversionRate?.toFixed(1) || 0}%`}
            change={stats?.conversionChange}
            icon="target"
            color={colors.warning}
          />
        </View>
      </View>

      {/* Revenue Chart */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Gelir Trendi
        </Text>
        <Chart
          data={stats?.revenueChart || []}
          type="line"
          color={colors.primary}
          style={styles.chart}
        />
      </View>

      {/* Top Performing Plans */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            En İyi Performans Gösteren Planlar
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              Detaylı Analiz
            </Text>
          </TouchableOpacity>
        </View>
        <TopPlans
          plans={topPlans}
          onPlanPress={(planId) => navigation.navigate('PlanAnalytics', { planId })}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Son Aktiviteler
        </Text>
        <RecentActivity
          activities={recentActivity}
          onViewAll={() => navigation.navigate('ActivityLog')}
        />
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chart: {
    height: 200,
    marginTop: 16,
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

### Plan Oluşturma Wizard'ı
```typescript
// src/screens/producer/CreatePlanScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { createPlan } from '@/store/slices/producerSlice';

import { StepIndicator } from '@/components/common/StepIndicator';
import { PlanTypeSelection } from '@/components/producer/PlanTypeSelection';
import { BasicInfoForm } from '@/components/producer/BasicInfoForm';
import { PlanSpecificForm } from '@/components/producer/PlanSpecificForm';
import { PricingForm } from '@/components/producer/PricingForm';
import { ReviewStep } from '@/components/producer/ReviewStep';
import { Button } from '@/components/common/Button';

type PlanType = 'API' | 'N_USAGE' | 'VESTING';

interface CreatePlanData {
  planType: PlanType | null;
  basicInfo: {
    name: string;
    description: string;
    externalLink?: string;
    image?: string;
    backgroundColor?: string;
  };
  planSpecific: any;
  pricing: {
    priceTokenAddress: string;
    totalSupply?: number;
    startDate?: Date;
  };
}

export const CreatePlanScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [planData, setPlanData] = useState<CreatePlanData>({
    planType: null,
    basicInfo: {
      name: '',
      description: '',
    },
    planSpecific: {},
    pricing: {
      priceTokenAddress: '',
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    'Plan Tipi',
    'Temel Bilgiler', 
    'Plan Detayları',
    'Fiyatlandırma',
    'Onay'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(createPlan(planData));
      navigation.goBack();
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePlanData = (section: keyof CreatePlanData, data: any) => {
    setPlanData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return planData.planType !== null;
      case 1:
        return planData.basicInfo.name.length > 0 && planData.basicInfo.description.length > 0;
      case 2:
        return true; // Plan specific validation
      case 3:
        return planData.pricing.priceTokenAddress.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PlanTypeSelection
            selectedType={planData.planType}
            onSelect={(type) => updatePlanData('planType', type)}
          />
        );
      case 1:
        return (
          <BasicInfoForm
            data={planData.basicInfo}
            onChange={(data) => updatePlanData('basicInfo', data)}
          />
        );
      case 2:
        return (
          <PlanSpecificForm
            planType={planData.planType!}
            data={planData.planSpecific}
            onChange={(data) => updatePlanData('planSpecific', data)}
          />
        );
      case 3:
        return (
          <PricingForm
            data={planData.pricing}
            onChange={(data) => updatePlanData('pricing', data)}
          />
        );
      case 4:
        return (
          <ReviewStep
            planData={planData}
            onEdit={(step) => setCurrentStep(step)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          completedColor={colors.success}
          activeColor={colors.primary}
          inactiveColor={colors.gray300}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <View style={styles.footerButtons}>
          {currentStep > 0 && (
            <Button
              title="Geri"
              variant="outline"
              onPress={handleBack}
              style={styles.footerButton}
            />
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button
              title="İleri"
              onPress={handleNext}
              disabled={!isStepValid()}
              style={styles.footerButton}
            />
          ) : (
            <Button
              title="Planı Oluştur"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.footerButton}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
```

Bu Faz 3'ün tamamlanmasıyla marketplace ve üretici yönetim sistemi hazır olacak. Kullanıcılar planları keşfedebilecek, üreticiler de planlarını kolayca yönetebilecekler.
