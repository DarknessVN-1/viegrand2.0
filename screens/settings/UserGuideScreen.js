import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normalize } from '../../utils/responsive';
import Animated, { FadeInUp } from 'react-native-reanimated';

const GuideSection = ({ title, steps, index }) => (
  <Animated.View 
    entering={FadeInUp.delay(index * 200)}
    style={styles.section}
  >
    <Text style={styles.sectionTitle}>{title}</Text>
    {steps.map((step, idx) => (
      <View key={idx} style={styles.stepContainer}>
        <View style={styles.stepLeft}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{idx + 1}</Text>
          </View>
          <View style={styles.stepLine} />
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
          <MaterialCommunityIcons 
            name={step.icon || 'check-circle-outline'} 
            size={24} 
            color="#2E7D32"
            style={styles.stepIcon}
          />
        </View>
      </View>
    ))}
  </Animated.View>
);

export default function UserGuideScreen() {
  const guides = [
    {
      title: "Bắt đầu sử dụng",
      steps: [
        {
          title: "Đăng ký tài khoản",
          description: "Nhập thông tin cá nhân và xác thực email để tạo tài khoản mới.",
          icon: "account-plus"
        },
        {
          title: "Chọn vai trò",
          description: "Chọn vai trò của bạn là người cao tuổi hoặc người thân.",
          icon: "account-switch"
        },
        {
          title: "Thiết lập hồ sơ",
          description: "Cập nhật thông tin cá nhân và ảnh đại diện của bạn.",
          icon: "account-edit"
        }
      ]
    },
    {
      title: "Tính năng chính",
      steps: [
        {
          title: "Theo dõi sức khỏe",
          description: "Cập nhật và theo dõi các chỉ số sức khỏe hàng ngày.",
          icon: "heart-pulse"
        },
        {
          title: "Nhắc nhở thuốc",
          description: "Thiết lập lịch uống thuốc và nhận thông báo nhắc nhở.",
          icon: "pill"
        },
        {
          title: "Kết nối người thân",
          description: "Thêm và quản lý danh sách người thân được kết nối.",
          icon: "account-group"
        }
      ]
    },
    {
      title: "Quản lý sức khỏe",
      steps: [
        {
          title: "Nhập chỉ số sức khỏe",
          description: "Cập nhật các chỉ số như huyết áp, nhịp tim, đường huyết hàng ngày.",
          icon: "chart-line"
        },
        {
          title: "Theo dõi thuốc",
          description: "Quản lý danh sách thuốc và lịch uống thuốc chi tiết.",
          icon: "pill"
        }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#2E7D32" />
        <Text style={styles.headerTitle}>Hướng dẫn sử dụng</Text>
        <Text style={styles.headerSubtitle}>Tìm hiểu cách sử dụng các tính năng chính</Text>
      </View>
      <View style={styles.content}>
        {guides.map((guide, index) => (
          <GuideSection
            key={index}
            index={index}
            title={guide.title}
            steps={guide.steps}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#2E7D32',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: normalize(16),
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: normalize(14),
    color: '#666666',
    lineHeight: normalize(20),
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  headerTitle: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: normalize(15),
    color: '#2E7D32',
    textAlign: 'center',
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E8F5E9',
    marginVertical: 8,
  },
  stepIcon: {
    marginTop: 8,
    alignSelf: 'flex-end'
  }
});
