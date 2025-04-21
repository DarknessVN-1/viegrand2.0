import { Entypo } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Animated, Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import GradientButton from '../../components/btn';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { metrics, normalize } from '../../utils/responsive';
const { width } = Dimensions.get('window');

export default function SigninScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [focusedInput, setFocusedInput] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);

  const [sercurityPassword, setSercurityPassword] = useState(true)

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const handleSignin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate input
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }


      const response = await fetch('https://viegrand.site/api/signin.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Thêm password vào userData trước khi lưu
        const userData = {
          ...data.user,
          password: formData.password // Thêm password vào userData
        };

        await login(userData);
        navigation.replace('TypeUser');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error or server unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (name, icon, placeholder, type = 'default', secure = false, password) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={[styles.titleInput]}>{placeholder}</Text>
      <Animated.View style={[
        styles.inputWrapper,
        focusedInput === name && styles.inputWrapperFocused,
      ]}>
        <TextInput
          style={styles.input}
          placeholder={`Nhập ${placeholder} ...`}
          placeholderTextColor={colors.black}
          keyboardType={type}
          secureTextEntry={secure}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          value={formData[name]}
          onChangeText={(text) => updateFormData(name, text)}
        />

        {password && <TouchableOpacity onPress={() => setSercurityPassword(!sercurityPassword)} style={styles.iconSeeInput}>
          <Entypo name={sercurityPassword ? 'eye' : 'eye-with-line'} size={20} color={colors.black} />
        </TouchableOpacity>}
      </Animated.View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="always"
      >
        <Image
          source={require('../../assets/header-group.png')}
          style={styles.header_logo}
          resizeMode="stretch"
        />
        <View style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Đăng Nhập</Text>
            <Text style={styles.subtitleText}>Chào mừng trở lại!</Text>
          </View>

          <View style={styles.formCard}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {renderInputField('email', 'email', 'Số điện thoại/Email', 'email-address')}
            {renderInputField('password', 'lock', 'Mật Khẩu', 'default', sercurityPassword, true)}

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <GradientButton
              title="Đăng nhập"
              colors={colors.gradients.primary}
              onPress={handleSignin}
              loading={isLoading}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.footerLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: metrics.padding,
  },
  mainContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? metrics.xxlargeSpace : metrics.xlargeSpace,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: metrics.xlargeSpace,
  },
  logo: {
    width: normalize(120),
    height: normalize(120),
    marginBottom: metrics.largeSpace,
  },
  header_logo: {
    width: Dimensions.get('screen').width * 1,
    height: normalize(200),
    marginBottom: metrics.largeSpace,
  },
  welcomeText: {
    fontSize: metrics.largeTitle,
    fontWeight: '700',
    color: colors.black,
    marginBottom: metrics.baseSpace,
  },
  subtitleText: {
    fontSize: metrics.caption,
    color: colors.black,
    marginBottom: metrics.mediumSpace,
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: metrics.borderRadius * 2,
    padding: metrics.largeSpace,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: metrics.inputRadius,
    marginBottom: metrics.mediumSpace,
    paddingHorizontal: metrics.mediumSpace,
    height: metrics.inputHeightMinium,
    ...metrics.shadowBase,
  },
  inputWrapperFocused: {
    borderWidth: 2,
    borderColor: colors.surfaceBackground,
    ...metrics.shadowStrong,
  },
  input: {
    flex: 1,
    marginLeft: metrics.baseSpace,
    fontSize: metrics.caption,
    color: colors.black,
  },
  titleInput: {
    color: colors.black,
    fontSize: metrics.body,
    fontWeight: '700',
    marginBottom: 5
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: metrics.largeSpace,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: metrics.caption,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: metrics.largeSpace,
    alignItems: 'center'
  },
  footerText: {
    color: colors.input.label,
    fontSize: metrics.caption,
  },
  footerLink: {
    color: colors.black,
    fontSize: metrics.caption,
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  errorText: {
    color: 'red',
    marginBottom: metrics.smallSpace,
    textAlign: 'center',
  },
  iconSeeInput: {
    position: 'absolute',
    right: 10
  }
});
