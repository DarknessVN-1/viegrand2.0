import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize } from '../../utils/responsive';

const PremiumFeature = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons name={icon} size={24} color="#2E7D32" />
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const PlanOption = ({ title, price, duration, isPopular, onSelect }) => (
  <TouchableOpacity 
    style={[styles.planCard, isPopular && styles.popularPlan]} 
    onPress={onSelect}
  >
    {isPopular && (
      <View style={styles.popularBadge}>
        <Text style={styles.popularText}>Phổ biến</Text>
      </View>
    )}
    <Text style={styles.planTitle}>{title}</Text>
    <View style={styles.priceContainer}>
      <Text style={styles.currency}>VND</Text>
      <Text style={styles.price}>{price.toLocaleString()}</Text>
      <Text style={styles.duration}>/{duration}</Text>
    </View>
  </TouchableOpacity>
);

export default function PremiumScreen({ navigation }) {
  const handleSelectPlan = (plan) => {
    // Validate plan type before navigation
    const validPlans = ['monthly', 'quarterly', 'yearly'];
    if (validPlans.includes(plan)) {
      navigation.navigate('PlanDetail', { plan });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9']}
        style={styles.header}
      >
        <MaterialCommunityIcons name="crown" size={40} color="#2E7D32" />
        <Text style={styles.headerTitle}>Viegrand Premium</Text>
        <Text style={styles.headerSubtitle}>
          Mở khóa tất cả tính năng cao cấp
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
          <PremiumFeature
            icon="shield-check"
            title="Bảo vệ nâng cao"
            description="Giám sát sức khỏe 24/7 với cảnh báo khẩn cấp"
          />
          <PremiumFeature
            icon="account-group"
            title="Không giới hạn người thân"
            description="Kết nối với tất cả người thân trong gia đình"
          />
          <PremiumFeature
            icon="chart-bar"
            title="Báo cáo chi tiết"
            description="Phân tích dữ liệu sức khỏe chuyên sâu"
          />
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Chọn gói Premium</Text>
          <PlanOption
            title="3 tháng"
            price={299000}
            duration="quý"
            onSelect={() => handleSelectPlan('quarterly')}
          />
          <PlanOption
            title="12 tháng"
            price={999000}
            duration="năm"
            isPopular
            onSelect={() => handleSelectPlan('yearly')}
          />
          <PlanOption
            title="1 tháng"
            price={119000}
            duration="tháng"
            onSelect={() => handleSelectPlan('monthly')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: normalize(16),
    color: '#2E7D32',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: normalize(16),
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: normalize(14),
    color: '#666666',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  popularPlan: {
    borderColor: '#2E7D32',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: normalize(12),
    fontWeight: '600',
  },
  planTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: normalize(14),
    color: '#666666',
    marginRight: 4,
  },
  price: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: '#2E7D32',
  },
  duration: {
    fontSize: normalize(14),
    color: '#666666',
    marginLeft: 4,
  },
});
