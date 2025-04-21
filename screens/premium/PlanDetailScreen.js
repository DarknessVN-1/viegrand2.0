import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize } from '../../utils/responsive';

const Feature = ({ title, description, included }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons 
      name={included ? "check-circle" : "minus-circle"} 
      size={24} 
      color={included ? "#2E7D32" : "#666666"} 
    />
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      {description && (
        <Text style={styles.featureDescription}>{description}</Text>
      )}
    </View>
  </View>
);

const PlanDetailScreen = ({ route, navigation }) => {
  const { plan } = route.params;

  const planDetails = {
    monthly: {
      title: "Gói Tháng",
      price: "119.000",
      period: "tháng",
      description: "Linh hoạt, phù hợp trải nghiệm",
      features: [
        {
          title: "Giám sát sức khỏe nâng cao",
          description: "Theo dõi chi tiết chỉ số sức khỏe",
          included: true
        },
        {
          title: "Báo cáo định kỳ",
          description: "Báo cáo hàng tuần về tình trạng sức khỏe",
          included: true
        },
        {
          title: "Kết nối không giới hạn",
          description: "Kết nối với nhiều người thân",
          included: false
        },
        {
          title: "Tư vấn y tế từ xa",
          description: "Chat với bác sĩ chuyên môn",
          included: false
        }
      ]
    },
    quarterly: {  // Add quarterly plan
      title: "Gói Quý",
      price: "299.000",
      period: "quý",
      description: "Tiết kiệm 15% so với gói tháng",
      features: [
        {
          title: "Giám sát sức khỏe nâng cao",
          description: "Theo dõi chi tiết chỉ số sức khỏe",
          included: true
        },
        {
          title: "Báo cáo định kỳ",
          description: "Báo cáo hàng tuần về tình trạng sức khỏe",
          included: true
        },
        {
          title: "Kết nối không giới hạn",
          description: "Kết nối với nhiều người thân",
          included: true
        },
        {
          title: "Tư vấn y tế từ xa",
          description: "Chat với bác sĩ chuyên môn",
          included: false
        }
      ]
    },
    yearly: {
      title: "Gói Năm",
      price: "999.000",
      period: "năm",
      description: "Tiết kiệm, đầy đủ tính năng",
      features: [
        {
          title: "Giám sát sức khỏe nâng cao",
          description: "Theo dõi chi tiết chỉ số sức khỏe",
          included: true
        },
        {
          title: "Báo cáo định kỳ",
          description: "Báo cáo hàng tuần về tình trạng sức khỏe",
          included: true
        },
        {
          title: "Kết nối không giới hạn",
          description: "Kết nối với nhiều người thân",
          included: true
        },
        {
          title: "Tư vấn y tế từ xa",
          description: "Chat với bác sĩ chuyên môn",
          included: true
        }
      ]
    }
  };

  // Add error handling for invalid plan
  if (!planDetails[plan]) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert" size={48} color="#666666" />
        <Text style={styles.errorText}>Không tìm thấy thông tin gói này</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentPlan = planDetails[plan];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9']}
          style={styles.header}
        >
          <Text style={styles.planTitle}>{currentPlan.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>VND</Text>
            <Text style={styles.price}>{currentPlan.price}</Text>
            <Text style={styles.period}>/{currentPlan.period}</Text>
          </View>
          <Text style={styles.description}>{currentPlan.description}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Tính năng bao gồm</Text>
            {currentPlan.features.map((feature, index) => (
              <Feature
                key={index}
                title={feature.title}
                description={feature.description}
                included={feature.included}
              />
            ))}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Thông tin thêm</Text>
            <Text style={styles.infoText}>
              • Tự động gia hạn khi hết hạn{'\n'}
              • Hủy bất kỳ lúc nào{'\n'}
              • Hoàn tiền trong 7 ngày nếu không hài lòng
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.subscribeButton}
          onPress={() => navigation.navigate('Payment', { plan })}
        >
          <Text style={styles.buttonText}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  planTitle: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: '#1B5E20',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 16,
  },
  currency: {
    fontSize: normalize(16),
    color: '#2E7D32',
    marginRight: 4,
  },
  price: {
    fontSize: normalize(32),
    fontWeight: '700',
    color: '#2E7D32',
  },
  period: {
    fontSize: normalize(16),
    color: '#2E7D32',
    marginLeft: 4,
  },
  description: {
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
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    marginLeft: 12,
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
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  infoText: {
    fontSize: normalize(14),
    color: '#666666',
    lineHeight: normalize(20),
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subscribeButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: normalize(17),
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: normalize(16),
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '600',
  },
});

export default PlanDetailScreen;
