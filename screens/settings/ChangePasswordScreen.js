import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { normalize, metrics } from '../../utils/responsive';
import { useAuth } from '../../context/AuthContext';
import GradientButton from '../../components/btn';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  // Log thông tin user khi component mount
  React.useEffect(() => {
    // Lấy thông tin user từ AsyncStorage để debug
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        console.log('Stored user data:', JSON.parse(userData));
      } catch (error) {
        console.error('Error getting stored user data:', error);
      }
    };
    getUserData();
  }, []);

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      console.log('Starting password change for user:', user.email);
      
      // Validate input
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
        return;
      }

      if (formData.newPassword.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }

      // Lấy user_id từ AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      const { user_id } = JSON.parse(userData);

      // Call API
      const response = await fetch('https://viegrand.site/api/change_password.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user_id, // Sử dụng user_id thay vì email
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      console.log('Password change response:', data);

      if (data.success) {
        // Cập nhật password trong AsyncStorage
        const currentUserData = JSON.parse(await AsyncStorage.getItem('userData'));
        await AsyncStorage.setItem('userData', JSON.stringify({
          ...currentUserData,
          passwordLastChanged: new Date().toISOString()
        }));

        Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (field, placeholder, isLast = false) => (
    <View style={[styles.inputContainer, !isLast && styles.inputSpacing]}>
      <View style={styles.inputInner}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons
            name={field === 'currentPassword' ? 'key' : 'lock'}
            size={22}
            color="#2E7D32"
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          secureTextEntry={!showPasswords[field]}
          value={formData[field]}
          onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))}
        >
          <MaterialCommunityIcons
            name={showPasswords[field] ? 'eye-off' : 'eye'}
            size={22}
            color="#8E8E93"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Section with Illustration */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconBox}>
                <LinearGradient
                  colors={['#43A047', '#2E7D32']}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name="shield-key-outline"
                    size={32}
                    color="#fff"
                  />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>Bảo mật tài khoản</Text>
              <Text style={styles.headerSubtitle}>
                Cập nhật mật khẩu mới để bảo vệ tài khoản của bạn
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Form Section */}
        <View style={styles.formCard}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Mật khẩu hiện tại</Text>
            {renderPasswordInput('currentPassword', 'Nhập mật khẩu hiện tại')}
          </View>

          <View style={styles.formDivider} />

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Mật khẩu mới</Text>
            {renderPasswordInput('newPassword', 'Nhập mật khẩu mới')}
            {renderPasswordInput('confirmPassword', 'Xác nhận mật khẩu mới', true)}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: '#FFF3E0' }]}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline" // Thay đổi tên icon
            size={24}
            color="#FB8C00"
          />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: '#F57C00' }]}>
              Mẹo tạo mật khẩu mạnh
            </Text>
            <Text style={[styles.infoText, { color: '#F57C00' }]}>
              • Sử dụng ít nhất 8 ký tự{'\n'}
              • Kết hợp chữ hoa, chữ thường{'\n'}
              • Thêm số và ký tự đặc biệt
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#43A047', '#2E7D32']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="lock-reset"
              size={24}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.submitButtonText}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
  contentContainer: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
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
  formSection: {
    padding: 20,
  },
  formDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.1)',
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: normalize(13),
    fontWeight: '500',
    color: '#6E6E73',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderRadius: 14,
    height: 58,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.1)',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(60,60,67,0.1)',
  },
  input: {
    flex: 1,
    fontSize: normalize(17),
    color: '#000000',
    paddingHorizontal: 16,
    height: '100%',
  },
  eyeButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,125,50,0.1)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: normalize(14),
    color: '#2E7D32',
    lineHeight: normalize(20),
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(17),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerSection: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconBox: {
    padding: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: normalize(15),
    fontWeight: '600',
    marginBottom: 4,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default ChangePasswordScreen;
