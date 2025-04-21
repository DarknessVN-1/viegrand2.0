import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { normalize, metrics } from '../../utils/responsive';
import { colors } from '../../theme/colors';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('AuthStack', { screen: 'Signin' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Đổi nền thành gradient pastel */}
      <LinearGradient
        colors={['#ECE9E6', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons 
            name="logout" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <MaterialCommunityIcons 
            name="account-circle" 
            size={80} 
            color={colors.primary}
          />
          <Text style={styles.welcomeText}>
            Xin chào, {user?.username || 'Người dùng'}
          </Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* Thêm các thành phần khác của trang Home ở đây */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.background, // Xóa nếu cần
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.padding,
    paddingTop: metrics.padding,
    height: metrics.headerHeight,
  },
  logo: {
    width: normalize(40),
    height: normalize(40),
  },
  logoutButton: {
    padding: metrics.smallSpace,
  },
  content: {
    flex: 1,
    paddingHorizontal: metrics.padding,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: metrics.borderRadius,
    padding: metrics.largeSpace,
    alignItems: 'center',
    marginTop: metrics.largeSpace,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  welcomeText: {
    fontSize: normalize(24),
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: metrics.mediumSpace,
    marginBottom: metrics.smallSpace,
  },
  emailText: {
    fontSize: normalize(16),
    color: colors.textSecondary,
  },
});
