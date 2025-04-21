import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { normalize, metrics } from '../../utils/responsive';
import { colors } from '../../theme/colors';

const RoleSwitcherScreen = ({ navigation, route }) => {
  const { currentRole } = route.params;
  const { user, verifyPassword, setTypeUser } = useAuth();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleRoleSwitch = async () => {
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      // Verify password through auth context
      const isValid = await verifyPassword(user.email, password);
      
      if (isValid) {
        // If password is correct, switch the role
        const newRole = currentRole === 'elderly' ? 'relative' : 'elderly';
        await setTypeUser(newRole); // This will call updateUserType internally
        
        // Navigate to the appropriate home screen
        if (newRole === 'elderly') {
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
      } else {
        Alert.alert('Lỗi', 'Mật khẩu không chính xác');
      }
    } catch (error) {
      console.error('Error during role switch:', error);
      Alert.alert('Lỗi', 'Không thể chuyển chế độ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="account-switch" 
          size={80} 
          color={colors.primary}
          style={styles.icon}
        />
        
        <Text style={styles.title}>Xác nhận chuyển chế độ</Text>
        <Text style={styles.subtitle}>
          Để chuyển sang chế độ người thân, vui lòng nhập mật khẩu để xác nhận
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.visibilityIcon}
            onPress={togglePasswordVisibility}
          >
            <MaterialCommunityIcons 
              name={passwordVisible ? "eye-off" : "eye"} 
              size={24} 
              color="#666666"
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRoleSwitch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Chuyển chế độ</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: normalize(16),
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: normalize(16),
    backgroundColor: '#F9F9F9',
  },
  visibilityIcon: {
    position: 'absolute',
    right: 16,
    top: 13,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: normalize(16),
  },
});

export default RoleSwitcherScreen;
