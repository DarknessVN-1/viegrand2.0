import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  Alert, 
  Platform 
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { normalize } from '../../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

// Fallback settings
const defaultSettings = {
  fontSize: 'medium',
  language: 'vi',
  notifications: true,
  emergencyAlerts: true,
  useBiometrics: false,
  theme: 'light',
};

// Create a fallback hook for settings similar to SettingsScreen
const useSettingsSafe = () => {
  const [localSettings, setLocalSettings] = useState(defaultSettings);
  
  let contextSettings;
  try {
    // Try to import the real settings context
    const { useSettings } = require('../../context/SettingsContext');
    contextSettings = useSettings();
  } catch (error) {
    console.log('Settings context not available, using local fallback');
    contextSettings = null;
  }
  
  // Use context if available, otherwise use local state
  const settings = contextSettings?.settings || localSettings;
  
  const updateSetting = async (key, value) => {
    if (contextSettings?.updateSetting) {
      return await contextSettings.updateSetting(key, value);
    } else {
      setLocalSettings(prev => ({
        ...prev,
        [key]: value
      }));
      return true;
    }
  };
  
  return { settings, updateSetting };
};

export default function BiometricsScreen() {
  // Use the safe version of the settings hook
  const { settings, updateSetting } = useSettingsSafe();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState([]);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
    
    if (compatible) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setBiometricType(types);
    }
  };

  const handleToggleBiometrics = async (value) => {
    if (value && isBiometricSupported) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Xác thực sinh trắc học',
          cancelLabel: 'Hủy',
        });

        if (result.success) {
          await updateSetting('useBiometrics', true);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể bật xác thực sinh trắc học');
      }
    } else {
      await updateSetting('useBiometrics', false);
    }
  };

  const renderBiometricType = () => {
    if (biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return (
        <MaterialCommunityIcons
          name="face-recognition"
          size={80}
          color={colors.primary}
        />
      );
    }
    return (
      <MaterialCommunityIcons
        name="fingerprint"
        size={80}
        color={colors.primary}
      />
    );
  };

  if (!isBiometricSupported) {
    return (
      <View style={styles.unsupportedContainer}>
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.errorCard}>
            <MaterialCommunityIcons
              name="shield-alert-outline"
              size={60}
              color="#FF3B30"
            />
            <Text style={styles.errorTitle}>
              Không hỗ trợ sinh trắc học
            </Text>
            <Text style={styles.errorText}>
              Thiết bị của bạn không hỗ trợ tính năng xác thực sinh trắc học.
            </Text>
            <Text style={styles.errorText}>
              Vui lòng sử dụng phương thức xác thực khác.
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#fff', '#f8f9fa']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#43A047', '#2E7D32']}
            style={styles.iconCircle}
          >
            {renderBiometricType()}
          </LinearGradient>
          <Text style={styles.title}>Xác thực sinh trắc học</Text>
          <Text style={styles.subtitle}>
            Sử dụng sinh trắc học để đăng nhập nhanh chóng và bảo mật
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Đăng nhập bằng sinh trắc học</Text>
              <Text style={styles.settingSubtitle}>
                Sử dụng {biometricType.includes(1) ? 'vân tay' : 'Face ID'} để đăng nhập
              </Text>
            </View>
            <Switch
              value={Boolean(settings.useBiometrics)}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#E5E5EA', true: '#43A047' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5EA"
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="shield-check"
            size={24}
            color="#28A745"
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>An toàn & Bảo mật</Text>
            <Text style={styles.infoText}>
              Dữ liệu sinh trắc học được mã hóa và lưu trữ an toàn trên thiết bị của bạn
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32, // Use fixed values instead of metrics.padding * 2
  },
  header: {
    alignItems: 'center',
    marginVertical: 24, // Use fixed values instead of metrics.largeSpace * 1.5
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // Fixed value
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8, // Fixed value
  },
  subtitle: {
    fontSize: normalize(14),
    color: '#666666',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: normalize(20),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24, // Fixed value
    marginBottom: 24, // Fixed value
    marginHorizontal: 16, // Fixed value
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16, // Fixed value
  },
  settingTitle: {
    fontSize: normalize(16),
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: normalize(14),
    color: '#666666',
  },
  unsupportedContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 4, // Fixed value
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24, // Fixed value
    marginTop: 24, // Fixed value
    marginHorizontal: 16, // Fixed value
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoContent: {
    flex: 1,
    marginLeft: 16, // Fixed value
  },
  infoTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#000000',
  },
  infoText: {
    fontSize: normalize(14),
    color: '#666666',
    marginTop: 8, // Fixed value
  },
});
