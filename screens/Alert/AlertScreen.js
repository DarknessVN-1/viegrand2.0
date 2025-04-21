import { AntDesign, FontAwesome5, Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Animated,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { metrics, normalize } from '../../utils/responsive';
import { EmergencyService } from '../../services/EmergencyService';
import { createFormData } from '../../utils/apiHelpers';
import { DebugHelper } from '../../utils/DebugHelper';

// NOTICE: All expo-notifications functionality has been temporarily disabled due to library conflicts.
// The UI elements are still visible but will not trigger actual notifications.

// Get window dimensions for floating button positioning
const windowHeight = Dimensions.get('window').height;

const ContactItem = ({ name, phone, onDelete, onEdit }) => (
  <View style={styles.contactItem}>
    <View style={styles.contactAvatar}>
      <Text style={styles.contactInitial}>{name.charAt(0).toUpperCase()}</Text>
    </View>
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{name}</Text>
      <Text style={styles.contactPhone}>{phone}</Text>
    </View>
    <View style={styles.contactActions}>
      <TouchableOpacity style={styles.contactActionButton} onPress={onEdit}>
        <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.contactActionButton} onPress={onDelete}>
        <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  </View>
);

const SwitchSetting = ({ title, value, onValueChange }) => (
  <View style={styles.switchItem}>
    <Text style={styles.switchTitle}>{title}</Text>
    <Switch
      trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
      thumbColor={value ? colors.primary : '#FFFFFF'}
      ios_backgroundColor="#E0E0E0"
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const AlertSection = ({ title, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const FormInput = ({ label, placeholder, value, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.formGroup}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput
      style={styles.formInput}
      placeholder={placeholder}
      placeholderTextColor="#9E9E9E"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const AlertScreen = ({ navigation }) => {
  const { user, typeUser } = useAuth();
  const isFocused = useIsFocused();
  
  React.useEffect(() => {
    console.log('AlertScreen mounted with user:', user);
  }, []);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updateInProgress, setUpdateInProgress] = useState({
    status: false,
    sound: false,
    message: false
  });

  const [isAlertEnabled, setIsAlertEnabled] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const formAnimation = React.useRef(new Animated.Value(0)).current;
  const listAnimation = React.useRef(new Animated.Value(1)).current;

  function getUserId(user) {
    if (!user) return null;
    if (user.user_id) {
      if (user.user_id.includes('bd')) {
        const numericPart = user.user_id.match(/^(\d+)/);
        console.log(`Extracted numeric ID ${numericPart?.[1]} from full ID ${user.user_id}`);
        return numericPart?.[1] || user.user_id;
      }
      return user.user_id;
    }
    return user.id;
  }

  const fetchEmergencySettings = useCallback(async () => {
    console.log("fetchEmergencySettings called, user:", user);
    
    if (!user) {
      console.log("=== FETCH SETTINGS: No user object found ===");
      setError("User information not available");
      setLoading(false);
      return;
    }
    
    if (!user.user_id) {
      console.log("=== FETCH SETTINGS: User has no user_id ===");
      console.log("Available user fields:", Object.keys(user));
      setError("User ID not available");
      setLoading(false);
      return;
    }
    
    console.log("\n=== FETCH EMERGENCY SETTINGS: STARTED ===");
    console.log(`User ID: ${user.user_id}, Username: ${user.username || 'Unknown'}`);
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await EmergencyService.getEmergencySettings(user.user_id);
      console.log("EmergencyService result:", result);
      
      if (result.success && result.data) {
        console.log("Settings retrieved successfully:", result.data);
        
        const alertEnabled = 
          result.data.status === '1' || 
          result.data.status === 1 || 
          result.data.status === 'on' || 
          result.data.status === true;
        
        const soundEnabled = 
          result.data.sound === '1' || 
          result.data.sound === 1 || 
          result.data.sound === 'on' || 
          result.data.sound === true;
        
        const notificationEnabled = 
          result.data.message === '1' || 
          result.data.message === 1 || 
          result.data.message === 'on' || 
          result.data.message === true;
        
        console.log("Setting UI state values to:", {
          alert: alertEnabled,
          sound: soundEnabled,
          notification: notificationEnabled
        });
        
        if (result.data.original) {
          console.log("Original server values:", result.data.original);
        }
        
        setIsAlertEnabled(alertEnabled);
        setIsSoundEnabled(soundEnabled);
        setIsNotificationEnabled(notificationEnabled); // Just update UI state
      } else {
        console.log("No settings found or error, creating default");
        
        const createResult = await EmergencyService.updateEmergencySettings({
          user_id: user.user_id,
          username: user.username || 'User',
          status: false, 
          sound: false,
          message: false
        });
        
        console.log("Create default settings result:", createResult);
        
        setIsAlertEnabled(false);
        setIsSoundEnabled(false);
        setIsNotificationEnabled(false);
      }
    } catch (err) {
      console.error("Error in fetchEmergencySettings:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const fetchEmergencyContacts = useCallback(async () => {
    console.log("\n=== FETCH EMERGENCY CONTACTS: STARTED ===");
    console.log(`User ID: ${user?.user_id}, Username: ${user?.username || 'Unknown'}`);
    
    if (!user || !user.user_id) {
      console.log("=== FETCH CONTACTS: No user or user_id available ===");
      setError("User information not available");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await EmergencyService.getEmergencyContacts(user.user_id);
      console.log("EmergencyContacts result:", result);
      
      if (result.success && Array.isArray(result.data)) {
        console.log("Contacts retrieved successfully:", result.data.length, "contacts found");
        setContacts(result.data);
      } else {
        console.log("No contacts found or error:", result.error || "Unknown error");
        setContacts([]);
      }
    } catch (err) {
      console.error("Error in fetchEmergencyContacts:", err);
      setError("Đã xảy ra lỗi khi tải danh sách liên hệ.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    console.log("Alert toggle state changed:", { 
      alert: isAlertEnabled, 
      sound: isSoundEnabled, 
      notification: isNotificationEnabled 
    });
  }, [isAlertEnabled, isSoundEnabled, isNotificationEnabled]);

  const updateEmergencySetting = async (settingType, value) => {
    console.log("updateEmergencySetting called, user:", user);
    
    if (!user) {
      console.log("=== UPDATE SETTINGS: No user object found ===");
      Alert.alert("Lỗi", "Thông tin người dùng không khả dụng");
      return;
    }
    
    if (!user.user_id) {
      console.log("=== UPDATE SETTINGS: User has no ID ===");
      console.log("Available user fields:", Object.keys(user));
      Alert.alert("Lỗi", "ID người dùng không khả dụng");
      return;
    }
    
    console.log(`\n=== UPDATING SETTING: ${settingType.toUpperCase()} to ${value ? 'ON' : 'OFF'} ===`);
    console.log(`User ID: ${user.user_id}, Username: ${user.username || 'Unknown'}`);
    
    setUpdateInProgress(prev => ({ ...prev, [settingType]: true }));
    
    const prevAlertState = isAlertEnabled;
    const prevSoundState = isSoundEnabled;
    const prevNotificationState = isNotificationEnabled;
    
    if (settingType === 'status') setIsAlertEnabled(value);
    if (settingType === 'sound') setIsSoundEnabled(value);
    if (settingType === 'message') setIsNotificationEnabled(value);
    
    try {
      // Add notification disable warning when toggling message setting
      if (settingType === 'message' && value) {
        console.log("NOTIFICATION WARNING: Notifications are temporarily disabled");
      }
      
      const updateData = {
        user_id: user.user_id, 
        username: user.username || 'User',
        status: settingType === 'status' ? value : isAlertEnabled,
        sound: settingType === 'sound' ? value : isSoundEnabled, 
        message: settingType === 'message' ? value : isNotificationEnabled
      };
      
      console.log("Updating with data:", updateData);
      
      const result = await EmergencyService.updateEmergencySettings(updateData);
      console.log("Update result:", result);
      
      if (!result.success) {
        throw new Error(result.error || "Update failed");
      }
      
      console.log("\nVerifying update with GET request...");
      const verifyResult = await EmergencyService.getEmergencySettings(user.user_id);
      console.log("Verification result:", verifyResult);
      
    } catch (err) {
      console.error("Error in updateEmergencySetting:", err);
      
      if (settingType === 'status') setIsAlertEnabled(prevAlertState);
      if (settingType === 'sound') setIsSoundEnabled(prevSoundState);
      if (settingType === 'message') setIsNotificationEnabled(prevNotificationState);
      
      Alert.alert("Lỗi", "Không thể cập nhật thiết lập cảnh báo. Vui lòng thử lại sau.");
    } finally {
      setUpdateInProgress(prev => ({ ...prev, [settingType]: false }));
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmergencySettings();
    fetchEmergencyContacts();
  }, [fetchEmergencySettings, fetchEmergencyContacts]);

  useEffect(() => {
    if (isFocused && typeUser === 'relative') {
      fetchEmergencySettings();
      fetchEmergencyContacts();
    }
  }, [isFocused, typeUser, fetchEmergencySettings, fetchEmergencyContacts]);

  useEffect(() => {
    if (isFocused) {
      StatusBar.setBarStyle("light-content");
      StatusBar.setBackgroundColor(colors.primaryDark);
    }
    
    if (typeUser !== 'relative') {
      Alert.alert(
        "Thông báo",
        "Tính năng này chỉ dành cho người thân",
        [{ text: "OK", onPress: () => navigation.replace('ElderlyHome') }]
      );
    }
  }, [typeUser, isFocused, navigation]);

  if (typeUser !== 'relative') return null;

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleForm = () => {
    if (showAddContactForm) {
      Animated.parallel([
        Animated.timing(formAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(listAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setEditingContact(null);
        setFormData({ name: '', phone: '', address: '' });
        setShowAddContactForm(false);
      });
    } else {
      setShowAddContactForm(true);
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(formAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(listAnimation, {
            toValue: 0.95,
            duration: 250,
            useNativeDriver: true,
          })
        ]).start();
      }, 50);
    }
  };

  const handleAddContact = async () => {
    console.log("\n=== ADDING/UPDATING CONTACT: STARTED ===");
    
    if (!formData.name.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên liên hệ");
      return;
    }
    
    if (!formData.phone.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại");
      return;
    }
    
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert("Thông báo", "Số điện thoại không hợp lệ. Vui lòng nhập 10 hoặc 11 số.");
      return;
    }
    
    try {
      const contactData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        user_id: user.user_id
      };
      
      console.log("Contact data to send:", contactData);
      
      let result;
      if (editingContact) {
        console.log("Updating existing contact with ID:", editingContact.id);
        contactData.id = editingContact.id;
        result = await EmergencyService.updateEmergencyContact(contactData);
      } else {
        console.log("Adding new contact");
        result = await EmergencyService.addEmergencyContact(contactData);
      }
      
      console.log("API response:", result);
      
      if (result.success) {
        await fetchEmergencyContacts();
        
        Alert.alert(
          "Thành công", 
          editingContact ? "Cập nhật liên hệ thành công" : "Thêm liên hệ thành công"
        );
        
        handleToggleForm();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error in handleAddContact:", error);
      Alert.alert(
        "Lỗi", 
        editingContact ? 
          "Không thể cập nhật liên hệ. Vui lòng thử lại sau." : 
          "Không thể thêm liên hệ. Vui lòng thử lại sau."
      );
    }
  };

  const handleEditContact = (contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      address: contact.address || ''
    });
    setEditingContact(contact);
    setShowAddContactForm(true);
    
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(formAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(listAnimation, {
          toValue: 0.95,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }, 50);
  };

  const handleDeleteContact = async (contactId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc muốn xóa liên hệ này không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              console.log("\n=== DELETING CONTACT: STARTED ===");
              console.log("Deleting contact with ID:", contactId);
              
              const result = await EmergencyService.deleteEmergencyContact(contactId, user.user_id);
              console.log("Delete result:", result);
              
              if (result.success) {
                setContacts(prev => prev.filter(c => c.id !== contactId));
                Alert.alert("Thành công", "Đã xóa liên hệ thành công");
              } else {
                throw new Error(result.error || "Unknown error");
              }
            } catch (error) {
              console.error("Error deleting contact:", error);
              Alert.alert("Lỗi", "Không thể xóa liên hệ. Vui lòng thử lại sau.");
            }
          }
        }
      ]
    );
  };

  const WeatherBox = () => (
    <View style={styles.weatherCard}>
      <View style={styles.weatherHeader}>
        <View style={styles.dateContainer}>
          <Fontisto name='date' size={14} color={colors.primary} />
          <Text style={styles.dateText}>{moment().format('DD/MM/YYYY')}</Text>
        </View>
        <Text style={styles.weatherTitle}>Thời tiết hôm nay</Text>
      </View>

      <View style={styles.weatherContent}>
        <View style={styles.weatherIconContainer}>
          <Image 
            source={require('../../assets/Sun_cloud_angled_rain.png')} 
            style={styles.weatherIcon} 
          />
          <Text style={styles.temperature}>25°C</Text>
        </View>
        
        <View style={styles.weatherInfo}>
          <Text style={styles.location}>Hồ Chí Minh</Text>
          <Text style={styles.weatherDescription}>Mưa rào</Text>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherDetail}>
              <FontAwesome5 name="water" size={14} color={colors.primary} />
              <Text style={styles.weatherDetailText}>70%</Text>
            </View>
            <View style={styles.weatherDetail}>
              <FontAwesome5 name="wind" size={14} color={colors.primary} />
              <Text style={styles.weatherDetailText}>18 km/h</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const SwitchSettingWithLoading = ({ title, value, onValueChange, isLoading }) => (
    <View style={styles.switchItem}>
      <Text style={styles.switchTitle}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Switch
          trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
          thumbColor={value ? colors.primary : '#FFFFFF'}
          ios_backgroundColor="#E0E0E0"
          onValueChange={onValueChange}
          value={value}
          disabled={isLoading}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        style={styles.header} 
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo-header.png')} style={styles.logo} />
          </View>
          <View style={styles.headerCenter}>
            <FontAwesome5 name="user-circle" size={20} color={colors.background} />
            <Text style={styles.userName}>{user?.username}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => Alert.alert("Thông báo", "Tính năng thông báo tạm thời bị vô hiệu hóa")}
          >
            <Ionicons name='notifications-circle' size={35} color={colors.background} />
            {isNotificationEnabled && (
              <View style={styles.notificationDisabledIndicator}>
                <Text style={styles.notificationDisabledText}>!</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.emergencyButtonContainer}>
          <TouchableOpacity style={styles.emergencyButton}>
            <MaterialCommunityIcons name='phone-alert' color={colors.background} size={25} />
            <Text style={styles.emergencyButtonText}>Khẩn Cấp</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {showAddContactForm && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleToggleForm}
        />
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WeatherBox />
        
        {!showAddContactForm && (
          <>
            <AlertSection title="Thiết lập cảnh báo">
              <SwitchSettingWithLoading
                title="Bật/Tắt cảnh báo"
                value={isAlertEnabled}
                onValueChange={(value) => updateEmergencySetting('status', value)}
                isLoading={updateInProgress.status}
              />
              <SwitchSettingWithLoading
                title="Âm thanh"
                value={isSoundEnabled}
                onValueChange={(value) => updateEmergencySetting('sound', value)}
                isLoading={updateInProgress.sound}
              />
              <SwitchSettingWithLoading
                title="Thông báo"
                value={isNotificationEnabled}
                onValueChange={(value) => {
                  if (value) {
                    Alert.alert(
                      "Thông báo bị vô hiệu hóa", 
                      "Tính năng thông báo hiện đang tạm thời bị vô hiệu hóa do xung đột thư viện.",
                      [{ text: "OK" }]
                    );
                  }
                  updateEmergencySetting('message', value);
                }}
                isLoading={updateInProgress.message}
              />
              {isNotificationEnabled && (
                <View style={styles.disabledNoticeContainer}>
                  <Text style={styles.disabledNoticeText}>
                    Thông báo hiện đang bị vô hiệu hóa tạm thời.
                  </Text>
                </View>
              )}
            </AlertSection>

            <AlertSection title="Danh sách liên hệ khẩn cấp">
              {contacts.length > 0 ? contacts.map(contact => (
                <ContactItem
                  key={contact.id}
                  name={contact.name}
                  phone={contact.phone}
                  onDelete={() => handleDeleteContact(contact.id)}
                  onEdit={() => handleEditContact(contact)}
                />
              )) : (
                <View style={styles.emptyListContainer}>
                  <MaterialCommunityIcons 
                    name="contacts-outline" 
                    size={50} 
                    color="#E0E0E0" 
                  />
                  <Text style={styles.emptyListText}>
                    Chưa có liên hệ khẩn cấp nào
                  </Text>
                  <Text style={styles.emptyListSubText}>
                    Nhấn nút "+" để thêm liên hệ mới
                  </Text>
                </View>
              )}
            </AlertSection>
          </>
        )}
      </ScrollView>

      {showAddContactForm && (
        <Animated.View 
          style={[
            styles.formCardContainer,
            { 
              opacity: formAnimation,
              transform: [
                { 
                  translateY: formAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingContact ? "Chỉnh sửa liên hệ" : "Thêm liên hệ khẩn cấp"}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleToggleForm}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AntDesign name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            <FormInput
              label="Họ và tên"
              placeholder="Nhập họ tên người liên hệ"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
            />
            <FormInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              keyboardType="phone-pad"
            />
            <FormInput
              label="Địa chỉ"
              placeholder="Nhập địa chỉ (không bắt buộc)"
              value={formData.address}
              onChangeText={(text) => updateFormData('address', text)}
            />
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleToggleForm}
              >
                <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddContact}
              >
                <Text style={styles.submitButtonText}>
                  {editingContact ? "Cập nhật" : "Thêm liên hệ"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleToggleForm}
      >
        <AntDesign 
          size={25} 
          name={showAddContactForm ? 'close' : 'plus'} 
          color={colors.primaryDark} 
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  logoContainer: {
    position: 'absolute',
    left: 15,
  },
  logo: {
    width: normalize(50),
    height: normalize(50),
    resizeMode: 'contain',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: colors.background,
    fontSize: metrics.subtitle,
    fontWeight: '600',
    marginLeft: 10,
  },
  notificationButton: {
    position: 'absolute',
    right: 15,
  },
  emergencyButtonContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  emergencyButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  emergencyButtonText: {
    color: colors.background,
    fontWeight: '700',
    marginLeft: 10,
    fontSize: metrics.subtitle,
  },
  weatherCard: {
    backgroundColor: colors.background,
    width: '100%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dateText: {
    fontSize: metrics.caption,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  weatherTitle: {
    fontSize: metrics.body,
    fontWeight: '600',
    color: colors.primary,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIconContainer: {
    alignItems: 'center',
    width: '35%',
  },
  weatherIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  temperature: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 5,
  },
  weatherInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  location: {
    fontSize: metrics.title,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  weatherDescription: {
    fontSize: metrics.body,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  weatherDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  weatherDetailText: {
    fontSize: metrics.caption,
    color: colors.primary,
    marginLeft: 5,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    padding: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: metrics.subtitle,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  sectionContent: {
    padding: 10,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  switchTitle: {
    fontSize: metrics.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  contactAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInitial: {
    fontSize: metrics.subtitle,
    color: colors.primary,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: metrics.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  contactPhone: {
    fontSize: metrics.caption,
    color: colors.textSecondary,
  },
  contactActions: {
    flexDirection: 'row',
  },
  contactActionButton: {
    padding: 5,
    marginLeft: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: windowHeight * 0.15,
    right: normalize(20),
    width: normalize(50),
    height: normalize(50),
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  formCardContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      }
    }),
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  formTitle: {
    fontSize: metrics.title,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  closeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: metrics.body,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    fontSize: metrics.body,
    color: colors.textPrimary,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cancelButtonText: {
    fontSize: metrics.body,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: metrics.body,
    fontWeight: '500',
    color: colors.background,
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: metrics.body,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 10,
  },
  emptyListSubText: {
    fontSize: metrics.caption,
    color: colors.textTertiary,
    marginTop: 5,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: metrics.caption,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    color: colors.error,
    fontSize: metrics.body,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: metrics.caption,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  notificationDisabledIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDisabledText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  disabledNoticeContainer: {
    marginTop: 5,
    padding: 10,
    backgroundColor: 'rgba(255, 87, 51, 0.1)', // Light red
    borderRadius: 8,
    marginHorizontal: 15,
  },
  disabledNoticeText: {
    color: colors.error,
    fontSize: metrics.caption,
    textAlign: 'center',
  },
});

export default AlertScreen;