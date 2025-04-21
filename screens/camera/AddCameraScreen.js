import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Animated,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { styles } from './AddCameraScreenStyles';
import { useAuth } from '../../context/AuthContext';

// Function to remove accents and spaces
const removeAccentsAndSpaces = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
};

// Add an API endpoint to save a new camera
const saveCamera = async (cameraData) => {
  try {
    console.log('========================');
    console.log('BƯỚC 1: BẮT ĐẦU LƯU CAMERA');
    console.log('📄 Camera data to save:', cameraData);
    
    const apiUrl = 'https://viegrand.site/api/add_camera.php';
    console.log('🔗 API URL:', apiUrl);
    
    console.log('BƯỚC 2: GỬI REQUEST ĐẾN SERVER');
    const requestBody = JSON.stringify(cameraData);
    console.log('📦 Request body:', requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: requestBody
    });
    
    console.log('📡 API Status code:', response.status);
    const responseText = await response.text();
    console.log('📦 Raw response text:', responseText);
    
    // Parse JSON after logging the raw text
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('BƯỚC 3: NHẬN KẾT QUẢ TỪ SERVER');
      console.log('📊 Parsed result:', result);
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError);
      throw new Error('Invalid JSON response');
    }
    
    console.log('BƯỚC 4: KẾT THÚC LƯU CAMERA');
    return result;
  } catch (error) {
    console.log('❌❌❌ ERROR saving camera:', error.message);
    console.error(error);
    throw error;
  }
};

const AddCameraScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [cameraName, setCameraName] = useState('');
  const [name_room, setNameRoom] = useState(''); // This will be the ID and display name
  const [camera_url, setCameraUrl] = useState('');
  const [cameraLocation, setCameraLocation] = useState('');
  const [cameraType, setCameraType] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Animate components when they mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Update name_room whenever cameraName changes
  const handleCameraNameChange = (text) => {
    setCameraName(text);
    const formattedName = removeAccentsAndSpaces(text);
    setNameRoom(formattedName);
  };

  const handleAddCamera = async () => {
    // Validate inputs
    if (!cameraName.trim()) {
      console.log('❌ Validation error: Missing camera name');
      Alert.alert('Lỗi', 'Vui lòng nhập tên camera');
      return;
    }

    if (!cameraLocation.trim()) {
      console.log('❌ Validation error: Missing camera location');
      Alert.alert('Lỗi', 'Vui lòng nhập vị trí camera');
      return;
    }

    if (cameraLocation.length > 20) {
      console.log('❌ Validation error: Camera location too long');
      Alert.alert('Lỗi', 'Vị trí camera không được quá 20 kí tự');
      return;
    }

    if (!cameraType) {
      console.log('❌ Validation error: Missing camera type');
      Alert.alert('Lỗi', 'Vui lòng chọn loại camera');
      return;
    }

    // Show loading
    console.log('BƯỚC 1: BẮT ĐẦU THÊM CAMERA');
    setLoading(true);

    // Kiểm tra user_id
    if (!user || !user.user_id) {
      console.log('❌ No user ID available');
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      setLoading(false);
      return;
    }

    console.log('👤 User ID for new camera:', user.user_id);
    console.log('👤 Full user object:', user);
    
    // Xử lý URL camera - tạo URL theo định dạng của server
    let finalCameraUrl = `https://servers.works/video.${name_room}.${user.user_id}/video`;
    
    // Nếu người dùng đã nhập URL, ưu tiên URL của họ
    if (camera_url && camera_url.trim()) {
      finalCameraUrl = camera_url.trim();
      if (!finalCameraUrl.startsWith('http') && !finalCameraUrl.startsWith('rtsp')) {
        finalCameraUrl = `https://servers.works/video.${camera_url}.${user.user_id}/video`;
      }
    }
    
    console.log('📡 Final camera URL:', finalCameraUrl);
    
    // Create camera object
    const newCamera = {
      user_id: user.user_id,
      camera_url: finalCameraUrl,
      name_room: name_room,
    };
    
    console.log('📷 New camera data:', newCamera);
    
    try {
      // Save to API first
      console.log('BƯỚC 2: GỬI CAMERA LÊN API');
      const apiResponse = await saveCamera(newCamera);
      
      if (apiResponse.status === 'success') {
        console.log('✅ Camera saved successfully:', apiResponse.data);
        
        // If API save was successful, add the camera with the ID from API
        const savedCamera = {
          id: apiResponse.data.id || Date.now().toString(),
          name: cameraName, // Save original name for display
          name_room: name_room, // Use formatted name as ID
          url: camera_url,
          status: 'online',
          text: 'Đang hoạt động'
        };
        
        console.log('BƯỚC 3: ĐIỀU HƯỚNG TRỞ LẠI VỚI CAMERA MỚI');
        console.log('📷 Saved camera object:', savedCamera);
        
        // Navigate back with the new camera data
        navigation.navigate('RelativeTabs', { 
          screen: 'Camera',
          params: { newCamera: savedCamera }
        });
        
        Alert.alert(
          'Thành công',
          'Đã thêm camera mới thành công',
        );
      } else {
        console.log('❌ API error:', apiResponse);
        // Handle API error
        Alert.alert('Lỗi', apiResponse.message || 'Không thể thêm camera. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.log('❌❌❌ ERROR adding camera:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm camera. Vui lòng thử lại sau.');
    } finally {
      console.log('BƯỚC CUỐI: KẾT THÚC QUÁ TRÌNH THÊM CAMERA');
      console.log('========================');
      setLoading(false);
    }
  };

  const selectCameraType = () => {
    Alert.alert(
      'Chọn loại camera',
      'Vui lòng chọn loại camera của bạn',
      [
        { text: 'Camera IP', onPress: () => setCameraType('IP Camera') },
        { text: 'Camera RTSP', onPress: () => setCameraType('RTSP Camera') },
        { text: 'Camera USB', onPress: () => setCameraType('USB Camera') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      
      {/* Header */}
      <LinearGradient
        style={styles.headerView}
        colors={[colors.primaryDark, colors.primary]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm Camera Mới</Text>
          <View style={styles.rightPlaceholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          {/* Info Box */}
          <View style={styles.formInfoBox}>
            <Text style={styles.formInfoText}>
              Camera sẽ giúp bạn theo dõi người thân từ xa. Nhập đầy đủ thông tin để thiết lập camera mới.
            </Text>
          </View>

          {/* Camera Information Section */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cctv" size={20} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Thông tin camera</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Tên Camera</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nhập tên camera (VD: Camera phòng khách)"
              value={cameraName}
              onChangeText={handleCameraNameChange}
            />
            {cameraName ? (
              <Text style={styles.formHelper}>
                ID: {name_room}
              </Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Loại Camera</Text>
            <TouchableOpacity 
              style={styles.formSelect}
              onPress={selectCameraType}
            >
              <Text style={[
                styles.formSelectText, 
                !cameraType && styles.formSelectPlaceholder
              ]}>
                {cameraType || "Chọn loại camera"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formDivider} />
          
          {/* Location Section */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="location-on" size={20} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Vị trí lắp đặt</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Vị trí Camera (tối đa 20 ký tự)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nhập vị trí camera (VD: Góc phòng khách)"
              value={cameraLocation}
              onChangeText={setCameraLocation}
              maxLength={20}
            />
            {cameraLocation ? (
              <Text style={styles.formHelper}>
                {cameraLocation.length}/20 ký tự
              </Text>
            ) : null}
          </View>

          <View style={styles.formDivider} />
          
          {/* Stream Settings Section */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="settings" size={20} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Cấu hình stream</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>URL Stream (tùy chọn)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nhập URL stream (rtsp://, http://)"
              value={camera_url}
              onChangeText={setCameraUrl}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formButton, styles.formButtonSecondary]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.formButtonSecondaryText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.formButton, styles.formButtonPrimary]}
              onPress={handleAddCamera}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" style={{marginRight: 8}} />
              ) : (
                <MaterialIcons name="add" size={24} color="#fff" style={styles.formButtonIcon} />
              )}
              <Text style={styles.formButtonPrimaryText}>
                {loading ? 'Đang xử lý...' : 'Thêm Camera'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddCameraScreen;
