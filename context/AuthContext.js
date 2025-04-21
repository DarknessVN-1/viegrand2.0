import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { premiumService } from '../services/premiumService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [typeUser, setTypeUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadStoredUser();
  }, []);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    }
  }, [user]);

  // Add debug logs
  useEffect(() => {
    console.log('🔐 AuthContext - Current user state:', user);
    console.log('🔐 AuthContext - User type:', typeUser);
  }, [user, typeUser]);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      const typeUser = await AsyncStorage.getItem('typeUser');
      console.log("Dô đây kh", typeUser);

      if (typeUser) {
        setTypeUser(typeUser)
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      // Lưu thông tin user
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Lưu mật khẩu vào AsyncStorage
      if (userData.password) {
        await AsyncStorage.setItem('userPassword', userData.password);
      }

      setUser(userData);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  };

  const typeUseBottomTab = async (type) => {
    try {
      // Lưu thông tin user
      await AsyncStorage.setItem('typeUser', type);
      setTypeUser(type);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('typeUser')
      setUser(null);
      setTypeUser(null)
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  };

  const updateUserRole = async (role) => {
    try {
      const updatedUser = { ...user, role };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await fetch(`https://viegrand.site/api/user.php?user_id=${user.user_id}`);
      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...data.user };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const updateUserPassword = async (newPassword) => {
    try {
      setUser(prev => ({
        ...prev,
        passwordLastChanged: new Date().toISOString()
      }));

      await AsyncStorage.setItem('userPassword', newPassword);

      console.log('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const upgradeToPremium = async (plan, paymentMethod) => {
    try {
      // Tính ngày hết hạn dựa trên loại gói
      const expiryDays = {
        monthly: 30,
        quarterly: 90,
        yearly: 365
      };

      const expiryDate = new Date(
        Date.now() + expiryDays[plan] * 24 * 60 * 60 * 1000
      ).toISOString();

      // Giá tiền theo gói
      const prices = {
        monthly: 119000,
        quarterly: 299000,
        yearly: 999000
      };

      // Gọi API để cập nhật trạng thái premium
      const result = await premiumService.upgradePremium(user.user_id, {
        plan,
        amount: prices[plan],
        paymentMethod,
        expiryDate
      });

      if (result.success) {
        const updatedUser = {
          ...user,
          isPremium: true,
          premiumPlan: plan,
          premiumExpiry: expiryDate,
          // Add any additional data from result if needed
          ...result.data
        };

        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsPremium(true);
        return true;
      }

      // Thêm logging chi tiết hơn
      console.error('Premium upgrade failed:', {
        message: result.message,
        error: result.error,
        userData: user.user_id,
        plan
      });
      return false;
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      return false;
    }
  };

  const checkPremiumStatus = async () => {
    try {
      if (user?.user_id) {  // Changed from user?.id to user?.user_id
        // Kiểm tra trạng thái premium từ server
        const result = await premiumService.checkPremiumStatus(user.user_id);  // Changed from user.id

        if (result.success) {
          const isValid = new Date(result.expiryDate) > new Date();
          setIsPremium(isValid);

          // Cập nhật thông tin premium trong user data
          if (isValid !== user.isPremium) {
            const updatedUser = {
              ...user,
              isPremium: isValid,
              premiumPlan: result.planType,
              premiumExpiry: result.expiryDate
            };
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }

          return isValid;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  };

  const validatePassword = async (password) => {
    try {
      // Lấy mật khẩu đã lưu
      const storedPassword = await AsyncStorage.getItem('userPassword');

      if (!storedPassword) {
        // Nếu chưa có mật khẩu được lưu, so sánh với mật khẩu trong user data
        return password === user.password;
      }

      // So sánh với mật khẩu đã lưu
      return password === storedPassword;
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  };

  const updatePremiumStatus = async (status) => {
    try {
      await AsyncStorage.setItem('isPremium', JSON.stringify(status));
      setIsPremium(status);
      return true;
    } catch (error) {
      console.error('Error updating premium status:', error);
      return false;
    }
  };

  // Unified verifyPassword function that can handle both email+password and password-only verification
  const verifyPassword = async (password, email = null) => {
    try {
      // If email is provided, verify both email and password
      if (email) {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          return parsedData.password === password && parsedData.email === email;
        }
        return false;
      }
      
      // Password-only verification for role switching
      // For demonstration, we're using a simple check
      if (user && user.password === password) {
        return true;
      }
      
      // For development testing - allow a master password
      if (password === '123456' || password === 'admin') {
        return true;
      }
      
      // Try to check against stored password
      const storedPassword = await AsyncStorage.getItem('userPassword');
      if (storedPassword && storedPassword === password) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  };

  // Rename this function to avoid conflict with the React state setter
  const updateUserType = async (type) => {
    try {
      await AsyncStorage.setItem('userType', type);
      setTypeUser(type); // Use the React state setter
      return true;
    } catch (error) {
      console.error('Error setting user type:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      typeUser,
      isPremium,
      login,
      logout,
      updateUserRole,
      updateUserProfile,
      refreshUserData,
      updateUserPassword,
      upgradeToPremium,
      checkPremiumStatus,
      typeUseBottomTab,
      validatePassword,
      updatePremiumStatus,
      verifyPassword,
      setTypeUser: updateUserType, // Export with the original name for compatibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
