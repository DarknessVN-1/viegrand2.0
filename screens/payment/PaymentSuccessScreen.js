import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { normalize } from '../../utils/responsive';
import { TouchableOpacity } from 'react-native-gesture-handler';

const PaymentSuccessScreen = ({ navigation }) => {
  const { typeUser } = useAuth();

  useEffect(() => {
    // Set a timer to automatically navigate after a few seconds
    const timer = setTimeout(() => {
      navigateToHome();
    }, 5000); // Navigate after 5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  const navigateToHome = () => {
    // Navigate to the appropriate home screen based on user type
    if (typeUser === 'elderly') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ElderlyTabs', screen: 'ElderlyHome' }]
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'RelativeTabs', screen: 'RelativeHome' }]
      });
    }
  };

  return (
    <LinearGradient
      colors={['#E8F5E9', '#C8E6C9']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons name="check-circle" size={80} color="#2E7D32" />
        </View>
        
        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.message}>
          Cảm ơn bạn đã nâng cấp lên Premium. Bạn đã mở khóa tất cả tính năng cao cấp.
        </Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Tài khoản của bạn đã được nâng cấp</Text>
          <View style={styles.infoDivider} />
          <Text style={styles.infoText}>
            Bạn sẽ tự động chuyển về màn hình chính sau vài giây
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={navigateToHome}
        >
          <Text style={styles.buttonText}>Về trang chính ngay</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  successIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: normalize(16),
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginBottom: 12,
  },
  infoText: {
    fontSize: normalize(14),
    color: '#666666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: normalize(16),
    fontWeight: '600',
  },
});

export default PaymentSuccessScreen;
