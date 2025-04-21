import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Alert, Image, Animated,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { normalize, metrics } from '../../utils/responsive';
import { useAuth } from '../../context/AuthContext';

// Fallback settings context implementation
const defaultSettings = {
  fontSize: 'medium',
  language: 'vi',
  notifications: true,
  emergencyAlerts: true,
  darkMode: false
};

// Create a fallback hook that won't crash if context is missing
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
  
  const updateSetting = (key, value) => {
    if (contextSettings?.updateSetting) {
      contextSettings.updateSetting(key, value);
    } else {
      setLocalSettings(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };
  
  return { settings, updateSetting };
};

const PremiumBanner = ({ onPress }) => (
  <TouchableOpacity
    style={styles.premiumBanner}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <LinearGradient
      colors={['#43A047', '#2E7D32']}
      style={styles.premiumGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.premiumContent}>
        <View style={styles.premiumLeft}>
          <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>Nâng cấp Premium</Text>
            <Text style={styles.premiumSubtitle}>Mở khóa tất cả tính năng cao cấp</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const SettingItem = ({ icon, title, subtitle, value, onPress, type = 'arrow', isLast }) => {
  // Fix subtitle reference in styles by moving it to a prop
  const titleStyle = [
    styles.settingTitle,
    subtitle ? { marginBottom: 4 } : null
  ];

  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        !isLast && styles.settingItemBorder
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: type === 'switch' ? '#34C759' : '#E8F5E9' }
        ]}>
          <MaterialCommunityIcons
            name={typeof icon === 'string' ? icon : icon.name}
            size={16}
            color={type === 'switch' ? '#FFFFFF' : '#2E7D32'}
            style={styles.iconStyle}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={titleStyle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onPress}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#E5E5EA"
            style={styles.switch}
          />
        ) : type === 'value' ? (
          <View style={styles.valueWrapper}>
            <Text style={styles.settingValue}>{value}</Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={22} 
              color="#C7C7CC"
              style={styles.chevron}
            />
          </View>
        ) : type === 'action' ? (
          <Text style={styles.actionText}>Đăng xuất</Text>
        ) : (
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={22} 
            color="#C7C7CC"
            style={styles.chevron}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const SettingsScreen = ({ navigation }) => {
  // Thêm useLayoutEffect để cấu hình header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Cài đặt'
    });
  }, [navigation]);

  // Use the safe version of the hook
  const { settings, updateSetting } = useSettingsSafe();
  // Add typeUseBottomTab to the destructuring
  const { user, logout, isPremium, typeUser, typeUseBottomTab } = useAuth() || {
    user: null,
    logout: () => console.log('Logout not available'),
    isPremium: false,
    typeUser: 'elderly',
    typeUseBottomTab: async () => console.log('typeUseBottomTab not available')
  };

  // Add a function to handle role switching
  const handleRoleSwitch = () => {
    if (typeUser === 'elderly') {
      // Elderly to relative needs password verification
      navigation.navigate('RoleSwitcher', { currentRole: typeUser });
    } else {
      // Relative to elderly is direct
      Alert.alert(
        'Chuyển chế độ',
        'Bạn có chắc muốn chuyển sang chế độ người cao tuổi?',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Chuyển', 
            onPress: async () => {
              try {
                // Update the typeUser in AuthContext BEFORE navigation
                await typeUseBottomTab('elderly');
                
                console.log('🔄 Role switched to elderly');
                
                // Short delay to ensure state updates before navigation
                setTimeout(() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'ElderlyTabs', params: { screen: 'ElderlyHome' } }]
                  });
                }, 300);
              } catch (error) {
                console.error('Error switching role:', error);
                Alert.alert('Lỗi', 'Không thể chuyển chế độ. Vui lòng thử lại.');
              }
            }
          },
        ]
      );
    }
  };

  const handleFontSize = () => {
    Alert.alert(
      'Kích thước chữ',
      'Chọn kích thước chữ phù hợp',
      [
        { 
          text: 'Nhỏ',
          onPress: () => updateSetting('fontSize', 'small'),
        },
        { 
          text: 'Vừa',
          onPress: () => updateSetting('fontSize', 'medium'),
        },
        { 
          text: 'Lớn',
          onPress: () => updateSetting('fontSize', 'large'),
        },
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      'Ngôn ngữ',
      'Chọn ngôn ngữ hiển thị',
      [
        { 
          text: 'Tiếng Việt',
          onPress: () => updateSetting('language', 'vi'),
        },
        { 
          text: 'English',
          onPress: () => updateSetting('language', 'en'),
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Signin' }]
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userInfo = React.useMemo(() => ({
    name: user?.username || 'Không có tên',
    email: user?.email || 'Không có email'
  }), [user]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileBackground}>
            <View style={styles.avatarContainer}>
              {/* Replace the problematic large icon with a smaller one or Image component */}
              <MaterialCommunityIcons 
                name="account-circle" 
                size={50} 
                color="#fff" 
              />
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text style={styles.userEmail}>{userInfo.email}</Text>
            </View>
          </View>
          {isPremium && (
            <View style={styles.premiumTag}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {!isPremium && (
          <PremiumBanner onPress={() => navigation.navigate('Premium')} />
        )}

        <View style={styles.settingsContainer}>
          <SectionHeader title="Cài đặt chung" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="bell-outline"
              title="Thông báo"
              subtitle="Quản lý thông báo ứng dụng"
              value={settings.notifications}
              onPress={() => updateSetting('notifications', !settings.notifications)}
              type="switch"
            />
            <SettingItem
              icon="bell-ring-outline"
              title="Cảnh báo khẩn cấp"
              subtitle="Thông báo cho người thân khi cần"
              value={settings.emergencyAlerts}
              onPress={() => updateSetting('emergencyAlerts', !settings.emergencyAlerts)}
              type="switch"
              isLast
            />
          </View>

          {/* Removed Voice settings section */}

          <SectionHeader title="Tùy chỉnh" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="format-size"
              title="Cỡ chữ"
              value={settings.fontSize}
              onPress={handleFontSize}
              type="value"
            />
            <SettingItem
              icon="translate"
              title="Ngôn ngữ"
              value={settings.language}
              onPress={handleLanguage}
              type="value"
              isLast
            />
          </View>

          <SectionHeader title="Bảo mật" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="shield-lock-outline"
              title="Đổi mật khẩu"
              subtitle="Cập nhật mật khẩu định kỳ"
              onPress={() => navigation.navigate('ChangePassword')}
            />
            <SettingItem
              icon="fingerprint"
              title="Sinh trắc học"
              subtitle="Vân tay & Face ID"
              onPress={() => navigation.navigate('Biometrics')}
              isLast
            />
          </View>

          <SectionHeader title="Thông tin khác" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="information-outline"
              title="Về ứng dụng"
              subtitle="Phiên bản 1.0.0"
              onPress={() => navigation.navigate('About')}
            />
            <SettingItem
              icon="help-circle-outline"
              title="Trợ giúp"
              subtitle="Hướng dẫn sử dụng & FAQ"
              onPress={() => navigation.navigate('Support')}
              isLast
            />
          </View>

          <SectionHeader title="Chế độ ứng dụng" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="account-switch"
              title="Chuyển chế độ người dùng"
              subtitle={typeUser === 'elderly' ? "Chuyển sang chế độ người thân" : "Chuyển sang chế độ người cao tuổi"}
              onPress={handleRoleSwitch}
              isLast
            />
          </View>

          <SectionHeader title="Kiểm tra hệ thống" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="cellphone-check"
              title="Kiểm tra thiết bị"
              subtitle="Thông tin hệ thống"
              onPress={() => Alert.alert('Thông tin thiết bị', 'Thiết bị đang hoạt động bình thường')}
              isLast
            />
          </View>

          <SectionHeader title="Tài khoản" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="logout"
              title="Đăng xuất"
              onPress={handleLogout}
              type="action"
              isLast
            />
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 100, // Increased from 20 to 100 to provide more space below the tab bar
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16, // Replace metrics.padding * 2 with fixed value
    paddingHorizontal: 16, // Replace metrics.padding with fixed value
    marginTop: 10, // Add this line for top spacing
    marginBottom: 35,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  profileBackground: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, // Replace metrics.padding * 1.5 with fixed value
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: normalize(15),
    color: '#666666',
  },
  settingsContainer: {
    paddingHorizontal: 16, // Replace metrics.padding with fixed value
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: normalize(13),
    fontWeight: '400',
    color: '#6E6E73',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    paddingVertical: 8, // Thêm padding trên dưới
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    marginHorizontal: 12, // Thêm margin trái phải
    borderRadius: 12, // Bo góc cho từng item
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconStyle: {
    alignSelf: 'center',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 60,
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  settingValue: {
    fontSize: normalize(15),
    color: '#2E7D32',
    fontWeight: '500',
    marginRight: 4,
  },
  chevron: {
    marginLeft: 2,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  actionText: {
    fontSize: normalize(17),
    color: '#2E7D32',
    fontWeight: '400',
  },
  settingTitle: {
    fontSize: normalize(17),
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.4,
  },
  settingSubtitle: {
    fontSize: normalize(13),
    color: '#8E8E93',
    lineHeight: normalize(17),
  },
  settingItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.1)',
    marginHorizontal: 16, // Margin cho đường phân cách
  },
  premiumBanner: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 16,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    marginLeft: 12,
  },
  premiumTitle: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: 4,
  },
  premiumSubtitle: {
    color: '#fff',
    fontSize: normalize(13),
    opacity: 0.9,
  },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  premiumTagText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '600',
    marginLeft: 4,
  }
});

// Make sure to properly export the component
export default SettingsScreen;
