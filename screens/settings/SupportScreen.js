import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { normalize, metrics } from '../../utils/responsive';

const SupportItem = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity 
    style={styles.supportItem} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.itemContent}>
      <View style={styles.iconBox}>
        <LinearGradient
          colors={['#43A047', '#2E7D32']}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name={icon} size={22} color="#fff" />
        </LinearGradient>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={22} color="#C7C7CC" />
  </TouchableOpacity>
);

export default function SupportScreen({ navigation }) {
  const handleEmail = () => {
    Linking.openURL('mailto:support@viegrand.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+84123456789');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconBox}>
              <LinearGradient
                colors={['#43A047', '#2E7D32']}
                style={styles.headerIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name="headphones-settings"
                  size={32}
                  color="#fff"
                />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Chúng tôi có thể giúp gì cho bạn?</Text>
            <Text style={styles.headerSubtitle}>
              Liên hệ với chúng tôi qua các kênh hỗ trợ dưới đây
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <View style={styles.supportGroup}>
            <Text style={styles.groupTitle}>Trợ giúp nhanh</Text>
            <SupportItem
              icon="frequently-asked-questions"
              title="Câu hỏi thường gặp"
              subtitle="Tìm câu trả lời nhanh cho các vấn đề phổ biến"
              onPress={() => navigation.navigate('FAQ')}
            />
            <SupportItem
              icon="book-open-variant"
              title="Hướng dẫn sử dụng"
              subtitle="Xem hướng dẫn chi tiết về các tính năng"
              onPress={() => navigation.navigate('UserGuide')}
            />
          </View>

          <View style={styles.supportGroup}>
            <Text style={styles.groupTitle}>Liên hệ hỗ trợ</Text>
            <SupportItem
              icon="email-outline"
              title="Email hỗ trợ"
              subtitle="support@viegrand.com"
              onPress={handleEmail}
            />
            <SupportItem
              icon="phone-outline"
              title="Hotline 24/7"
              subtitle="0123 456 789"
              onPress={handlePhone}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  headerIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    padding: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: normalize(15),
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  content: {
    paddingHorizontal: 16,
  },
  supportGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: normalize(13),
    fontWeight: '500',
    color: '#6E6E73',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  itemTitle: {
    fontSize: normalize(17),
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: normalize(14),
    color: '#666666',
    lineHeight: normalize(19),
  },
});
