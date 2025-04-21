import { Entypo } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Animated, Dimensions, Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import GradientButton from '../../components/btn';
import { colors } from '../../theme/colors';
import { metrics, normalize } from '../../utils/responsive';

const { width, height } = Dimensions.get('window');

const STEPS = {
  BASIC: 0,
  CONTACT: 1,
  PASSWORD: 2
};

const WaveBackground = () => (
  <View style={styles.waveContainer}>
    <Svg height="180" width={width} viewBox="0 0 1440 320">
      <Path
        fill={colors.primary}
        fillOpacity="0.4"
        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      />
    </Svg>
  </View>
);

export default function SignupScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [focusedInput, setFocusedInput] = useState(null);
  const inputAnimation = useState(new Animated.Value(0))[0];

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [sercurityPassword, setSercurityPassword] = useState(true)
  const [sercurityCFPassword, setSercurityCFPassword] = useState(true)

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
    Animated.spring(inputAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setFocusedInput(null);
    Animated.spring(inputAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderInputField = (name, icon, placeholder, type = 'default', secure = false, password, onClick) => (
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

        {password && <TouchableOpacity onPress={onClick} style={styles.iconSeeInput}>
          <Entypo name={sercurityPassword ? 'eye' : 'eye-with-line'} size={20} color={colors.black} />
        </TouchableOpacity>}
      </Animated.View>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[0, 1, 2].map(step => (
        <View key={step} style={[
          styles.stepDot,
          currentStep === step && styles.stepDotActive
        ]} />
      ))}
    </View>
  );

  const validateCurrentStep = () => {
    switch (currentStep) {
      case STEPS.BASIC:
        if (!formData.name || !formData.email) {
          setError('Please fill in all fields');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email');
          return false;
        }
        break;
      case STEPS.CONTACT:
        if (!formData.phone || formData.phone.length < 10) {
          setError('Please enter a valid phone number');
          return false;
        }
        break;
      case STEPS.PASSWORD:
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      setError('');

      const userData = {
        username: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };


      const response = await fetch('https://viegrand.site/api/signup.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const text = await response.text();

      try {
        const data = JSON.parse(text);
        console.log('Parsed response:', data);

        if (data.success) {
          Alert.alert(
            'Success',
            'Registration successful! Please login.',
            [{ text: 'OK', onPress: () => navigation.navigate('Signin') }]
          );
        } else {
          setError(data.message || 'Registration failed');
        }
      } catch (e) {
        console.error('JSON parse error:', e);
        setError('Invalid server response');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSignup();
    }
  };

  const renderCurrentStep = () => {
    return (
      <>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {(() => {
          switch (currentStep) {
            case STEPS.BASIC:
              return (
                <>
                  {renderInputField('name', 'account', 'Họ và tên', 'default', false, formData.name)}
                  {renderInputField('email', 'email', 'Địa chỉ Email', 'email-address', false, formData.email)}
                </>
              );
            case STEPS.CONTACT:
              return renderInputField('phone', 'phone', 'Số điện thoại', 'phone-pad', false, formData.phone);
            case STEPS.PASSWORD:
              return (
                <>
                  {renderInputField('password', 'lock', 'Mật khẩu', 'default', true, formData.password)}
                  {renderInputField('confirmPassword', 'lock-check', 'Xác nhận mật khẩu', 'default', true, formData.confirmPassword)}
                </>
              );
          }
        })()}
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    // keyboardVerticalOffset={Platform}
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
            <Text style={styles.welcomeText}>Đăng ký</Text>
            <Text style={styles.subtitleText}>Đăng ký để tiếp tục</Text>
          </View>

          <View style={styles.formCard}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {renderInputField('name', 'name', 'Tên người dùng', 'text')}
            {renderInputField('phone', 'phone', 'Số điện thoại', 'phone-pad')}
            {renderInputField('email', 'email', 'Email', 'email-address')}
            {renderInputField('password', 'lock', 'Mật khẩu', 'default', sercurityPassword, true, () => setSercurityPassword(!sercurityPassword))}
            {renderInputField('confirmPassword', 'lock-check', 'Nhập lại mật Khẩu', 'default', sercurityCFPassword, true, () => setSercurityCFPassword(!sercurityCFPassword))}

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <GradientButton
              title="Đăng ký"
              colors={colors.gradients.primary}
              onPress={handleSignup}
              loading={isLoading}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
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
