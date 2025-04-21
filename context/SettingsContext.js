import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/constants';

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  notifications: true,
  emergencyAlerts: true,
  fontSize: 'medium', // small, medium, large
  language: 'vi', // vi, en
  useBiometrics: false,
  theme: 'light',
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user_id) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const cachedSettings = await AsyncStorage.getItem('userSettings');
      if (cachedSettings) {
        setSettings(JSON.parse(cachedSettings));
      }

      const response = await fetch(`https://viegrand.site/api/settings.php?user_id=${user.user_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const text = await response.text();
      console.log('Raw response:', text); // For debugging

      try {
        const data = JSON.parse(text);
        console.log('Parsed data:', data); // For debugging
        
        if (data.success && data.data) {
          const apiSettings = {
            notifications: data.data.notifications === '1',
            emergencyAlerts: data.data.emergency_alerts === '1',
            fontSize: data.data.font_size || 'medium',
            language: data.data.language || 'vi',
            useBiometrics: data.data.use_biometrics === '1',
            theme: data.data.theme || 'light',
          };
          setSettings(apiSettings);
          await AsyncStorage.setItem('userSettings', JSON.stringify(apiSettings));
        } else {
          console.error('API Error:', data.message);
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        console.error('Response text:', text);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      
      const response = await fetch('https://viegrand.site/api/settings.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.user_id,
          settings: {
            notifications: newSettings.notifications ? '1' : '0',
            emergency_alerts: newSettings.emergencyAlerts ? '1' : '0',
            font_size: newSettings.fontSize,
            language: newSettings.language,
            use_biometrics: newSettings.useBiometrics ? '1' : '0',
            theme: newSettings.theme,
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSettings(newSettings);
        await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
        return true;
      } else {
        throw new Error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật cài đặt. Vui lòng thử lại sau.');
      return false;
    }
  };

  const resetSettings = async () => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(DEFAULT_SETTINGS));
      setSettings(DEFAULT_SETTINGS);
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      loading,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
