import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { normalize, metrics } from '../../utils/responsive';

const AboutCard = ({ icon, title, content }) => (
  <View style={styles.cardContainer}>
    <View style={styles.cardHeader}>
      <View style={styles.iconBox}>
        <LinearGradient
          colors={['#43A047', '#2E7D32']}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name={icon} size={24} color="#fff" />
        </LinearGradient>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={styles.cardContent}>{content}</Text>
  </View>
);

const SocialButton = ({ icon, label, onPress }) => (
  <TouchableOpacity 
    style={styles.socialButton} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.socialIconBox}>
      <MaterialCommunityIcons name={icon} size={22} color="#2E7D32" />
    </View>
    <Text style={styles.socialLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>VieGrand</Text>
          <Text style={styles.version}>Phiên bản 1.0.0</Text>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <AboutCard
          icon="information"
          title="Giới thiệu"
          content="VieGrand là ứng dụng chăm sóc sức khỏe thông minh, kết nối người cao tuổi với người thân và các dịch vụ y tế chất lượng cao."
        />

        <AboutCard
          icon="shield-check"
          title="Bảo mật"
          content="Chúng tôi cam kết bảo vệ thông tin cá nhân của người dùng theo tiêu chuẩn cao nhất."
        />

        <AboutCard
          icon="certificate"
          title="Chứng nhận"
          content="VieGrand đã được cấp phép hoạt động bởi Bộ Y tế và tuân thủ các quy định về y tế điện tử."
        />

        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Kết nối với chúng tôi</Text>
          <View style={styles.socialButtons}>
            <SocialButton icon="facebook" label="Facebook" onPress={() => {}} />
            <SocialButton icon="web" label="Website" onPress={() => {}} />
            <SocialButton icon="email" label="Email" onPress={() => {}} />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.termsButton} activeOpacity={0.7}>
        <LinearGradient
          colors={['#43A047', '#2E7D32']}
          style={styles.termsGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.termsText}>Điều khoản sử dụng</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.copyright}>© 2024 VieGrand. All rights reserved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerSection: {
    marginBottom: 24,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  version: {
    fontSize: normalize(16),
    color: '#2E7D32',
  },
  content: {
    padding: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    padding: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginRight: 12,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#1B5E20',
  },
  cardContent: {
    fontSize: normalize(15),
    color: '#666666',
    lineHeight: normalize(22),
  },
  socialSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  socialTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 16,
    textAlign: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    alignItems: 'center',
  },
  socialIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialLabel: {
    fontSize: normalize(13),
    color: '#2E7D32',
  },
  termsButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  termsGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  termsText: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  copyright: {
    fontSize: normalize(13),
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
});
