import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { normalize } from '../../utils/responsive';

const RoleSwitcher = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentRole } = route.params || { currentRole: 'elderly' };
  
  // Get both verifyPassword and typeUseBottomTab from AuthContext
  const { verifyPassword, typeUseBottomTab } = useAuth() || {
    verifyPassword: async () => true,
    typeUseBottomTab: async () => {} 
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Xác thực chuyển chế độ',
      headerTitleAlign: 'center'
    });
  }, [navigation]);

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        // Determine the new role (opposite of current)
        const newRole = currentRole === 'elderly' ? 'relative' : 'elderly';
        
        // Update the typeUser in AuthContext BEFORE navigation
        await typeUseBottomTab(newRole);
        
        console.log(`🔄 Switching from ${currentRole} to ${newRole}`);
        
        // Short delay to ensure state updates before navigation
        setTimeout(() => {
          if (newRole === 'relative') {
            // Navigate to relative mode
            navigation.reset({
              index: 0,
              routes: [{ name: 'RelativeTabs', params: { screen: 'RelativeHome' } }]
            });
          } else {
            // Navigate to elderly mode
            navigation.reset({
              index: 0,
              routes: [{ name: 'ElderlyTabs', params: { screen: 'ElderlyHome' } }]
            });
          }
          setIsLoading(false);
        }, 300);
      } else {
        setIsLoading(false);
        Alert.alert('Lỗi', 'Mật khẩu không đúng. Vui lòng thử lại.');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Verification error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xác thực. Vui lòng thử lại sau.');
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="account-switch" size={60} color="#2E7D32" />
        </View>
        
        <Text style={styles.title}>Xác thực để chuyển chế độ</Text>
        <Text style={styles.subtitle}>
          {currentRole === 'elderly' 
            ? "Nhập mật khẩu để chuyển sang chế độ người thân" 
            : "Nhập mật khẩu để chuyển sang chế độ người cao tuổi"}
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#999"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity 
              onPress={togglePasswordVisibility}
              style={styles.visibilityToggle}
              disabled={isLoading}
            >
              <MaterialCommunityIcons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={24}
                color="#2E7D32"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Đang xác thực..." : "Xác nhận"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: normalize(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: normalize(16),
    color: '#000',
  },
  visibilityToggle: {
    padding: 10,
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  cancelButtonText: {
    color: '#2E7D32',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#82B485',
  },
});

export default RoleSwitcher;
