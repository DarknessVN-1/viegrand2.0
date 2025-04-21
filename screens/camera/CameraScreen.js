import { FontAwesome5, Fontisto, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './CameraScreenStyles';
import moment from 'moment';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView, 
  StatusBar,
  StyleSheet, 
  Text,
  TouchableOpacity,
  View,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
  AppState
} from "react-native";
import { WebView } from 'react-native-webview'; // Import WebView
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { metrics, normalize } from '../../utils/responsive';
import React, { useEffect, useState, useRef } from 'react';

const { width } = Dimensions.get('window');

// Stream configuration
const STREAM_URL = ""; // Đã xóa URL server

const CameraScreen = ({ navigation, route }) => {
  const { user, typeUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeCamera, setActiveCamera] = useState('living-room');
  const [showControls, setShowControls] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [streamQuality, setStreamQuality] = useState(60); // Default medium quality
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const isFocused = useIsFocused();
  const webViewRef = useRef(null);
  const [apiLoading, setApiLoading] = useState(false);
  
  // Theo dõi trạng thái kết nối của từng camera
  const [cameraStatuses, setCameraStatuses] = useState({});
  
  // State to manage user-added cameras
  const [userCameras, setUserCameras] = useState([]);

  // Function to fetch cameras from API
  const fetchCamerasFromAPI = async () => {
    try {
      console.log('⚠️⚠️⚠️ FETCH CAMERAS STARTED ⚠️⚠️⚠️');
      setApiLoading(true);
      console.log('========================');
      console.log('BƯỚC 1: BẮT ĐẦU LẤY CAMERA');
      
      // If we have a user object, get the user ID from it
      if (!user || !user.user_id) { // Changed from user.id to user.user_id
        console.log('❌ KHÔNG CÓ USER ID');
        console.log('User object:', user);
        setApiLoading(false);
        return;
      }
      
      const userId = user.user_id; // Changed from user.id to user.user_id
      console.log('👤 User ID:', userId);
      
      // Thay đổi URL API để trỏ đến API thực tế của bạn
      const apiUrl = `https://viegrand.site/api/get_cameras.php?user_id=${userId}`;
      console.log('🔗 API URL:', apiUrl);
      
      console.log('BƯỚC 2: GỬI REQUEST ĐẾN SERVER');
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('📡 API Status code:', response.status);
      const responseText = await response.text();
      console.log('📦 Raw response text:', responseText);
      
      if (!responseText) {
        console.log('❌ Empty response received');
        setApiLoading(false);
        return;
      }
      
      // Parse JSON after logging the raw text (safer approach)
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('BƯỚC 3: NHẬN KẾT QUẢ TỪ SERVER');
        console.log('📊 Parsed result:', result);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError);
        console.log('Invalid JSON:', responseText);
        setApiLoading(false);
        return;
      }
      
      if (result.status === 'success' && result.data) {
        console.log('✅ SUCCESS: Cameras found:', result.data.length);
        
        // Map API data to the expected format for cameras
        const apiCameras = result.data.map(camera => {
          console.log('📷 Processing camera:', camera);
          return {
            id: camera.id,
            name: camera.name_room, // Display name for camera
            name_room: camera.name_room, // ID for camera
            url: camera.camera_url,
            status: 'online',
            text: 'Đang hoạt động'
          };
        });
        
        console.log('BƯỚC 4: XỬ LÝ DỮ LIỆU CAMERA');
        console.log('🎬 Processed cameras:', apiCameras);
        
        // Update camera statuses for the new cameras
        const newStatuses = {};
        apiCameras.forEach(camera => {
          newStatuses[camera.name_room] = { status: 'online', text: 'Đang hoạt động' };
        });
        
        setCameraStatuses(newStatuses);
        
        // Add the fetched cameras to our list
        setUserCameras(apiCameras);
        console.log('💾 Updated userCameras state with:', apiCameras);
        
        // Nếu có camera và chưa có camera đang active, set camera đầu tiên làm active
        if (apiCameras.length > 0 && !apiCameras.find(c => c.name_room === activeCamera)) {
          console.log('🔄 Setting active camera to:', apiCameras[0].name_room);
          setActiveCamera(apiCameras[0].name_room);
        }
        
        console.log(`BƯỚC 5: HOÀN THÀNH - Loaded ${apiCameras.length} cameras`);
      } else {
        console.log('❌ API error or no cameras:', result);
        if (result.message) {
          console.log('API message:', result.message);
        }
      }
    } catch (error) {
      console.log('❌❌❌ ERROR fetching cameras:', error.message);
      console.error('Stack trace:', error.stack);
    } finally {
      console.log('BƯỚC CUỐI: KẾT THÚC PROCESS');
      console.log('========================');
      setApiLoading(false);
    }
  };
  
  // Fetch cameras khi màn hình được focus và khi user thay đổi
  useEffect(() => {
    console.log('🔍 CHECK: Screen focused state:', isFocused);
    console.log('🔍 CHECK: User state:', user);
    
    if (isFocused && user && user.user_id) { // Changed from user.id to user.user_id
      console.log('✅ TRIGGERING API FETCH - All conditions met');
      fetchCamerasFromAPI();
    } else {
      console.log('❌ API FETCH NOT TRIGGERED - Conditions not met:');
      console.log('   - isFocused:', isFocused);
      console.log('   - user exists:', !!user);
      console.log('   - user.user_id exists:', user ? !!user.user_id : false);
    }
  }, [isFocused, user]);

  // Check for new camera when screen is focused
  useEffect(() => {
    if (isFocused && route.params?.newCamera) {
      // Add new camera to the list
      const camera = route.params.newCamera;
      
      // Create a copy of user cameras and add the new one
      setUserCameras(prevCameras => {
        // Check if camera already exists to avoid duplicates
        const exists = prevCameras.some(c => c.id === camera.id);
        if (exists) return prevCameras;
        return [...prevCameras, camera];
      });
      
      // Update camera statuses
      setCameraStatuses(prevStatuses => ({
        ...prevStatuses,
        [camera.name_room]: { status: 'online', text: 'Đang hoạt động' }
      }));
      
      // Reset the params to avoid duplicates on re-render
      navigation.setParams({ newCamera: null });
    }
  }, [isFocused, route.params]);
  
  // Set status bar style when focused
  useEffect(() => {
    if (isFocused) {
      StatusBar.setBarStyle("light-content");
      StatusBar.setBackgroundColor(colors.primaryDark);
    }
  }, [isFocused]);
  
  // Animation when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Kiểm tra quyền truy cập khi vào màn hình
  useEffect(() => {
    if (typeUser !== 'relative') {
      Alert.alert(
        "Thông báo",
        "Tính năng này chỉ dành cho người thân",
        [{ text: "OK", onPress: () => navigation.replace('ElderlyHome') }]
      );
    }
    
    // Set a timeout to simulate loading and then show camera feed
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [typeUser, navigation]);
  
  // Cập nhật trạng thái camera khi khởi động
  useEffect(() => {
    if (!loading) {
      // Giả lập kiểm tra kết nối camera
      checkCameraConnections();
    }
  }, [loading]);

  // Loại bỏ hàm checkCameraConnections cũ và thay thế bằng hàm mới 
  // chỉ kiểm tra các camera từ API
  const checkCameraConnections = () => {
    // Update status for all cameras
    const newStatuses = { ...cameraStatuses };
    
    // For API cameras, check connection status
    userCameras.forEach(camera => {
      // Giả lập kiểm tra kết nối - trong thực tế có thể kiểm tra thực sự
      const rand = Math.random();
      if (rand < 0.7) {
        newStatuses[camera.name_room] = { status: 'online', text: 'Đang hoạt động' };
      } else if (rand < 0.9) {
        newStatuses[camera.name_room] = { status: 'weak', text: 'Tín hiệu yếu' };
      } else {
        newStatuses[camera.name_room] = { status: 'offline', text: 'Ngoại tuyến' };
      }
    });
    
    setCameraStatuses(newStatuses);
  };
  
  // Nếu không phải người thân thì không hiện gì
  if (typeUser !== 'relative') {
    return null;
  }
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    Alert.alert("Thông báo", isRecording ? "Đã dừng ghi hình" : "Đã bắt đầu ghi hình");
  };
  
  const switchCamera = (cameraId) => {
    setLoading(true);
    setActiveCamera(cameraId);
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  const changeStreamQuality = (quality) => {
    setStreamQuality(quality);
    // Reload WebView with new quality parameter
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };
  
  // Sửa lại hàm getStreamUrl để lấy URL thực từ camera
  const getStreamUrl = () => {
    // Nếu không có camera đang active hoặc không tìm thấy URL, trả về rỗng
    if (!activeCamera) return '';
    
    // Tìm camera hiện tại trong danh sách userCameras
    const currentCamera = userCameras.find(cam => cam.name_room === activeCamera);
    
    if (currentCamera && currentCamera.url && cameraStatuses[activeCamera]?.status !== 'offline') {
      console.log(`🎥 Loading camera stream: ${currentCamera.url}`);
      return currentCamera.url;
    }
    
    console.log('❌ No valid camera URL found for:', activeCamera);
    return '';
  };
  
  // Enhanced Camera component with simplified WebView implementation
  const CameraView = () => {
    const [webViewError, setWebViewError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    
    // Reset when camera changes
    useEffect(() => {
      setWebViewError(false);
      setErrorMessage('');
    }, [activeCamera]);
    
    // Get current camera URL
    const streamUrl = (() => {
      // If no active camera or camera is offline, return empty
      if (!activeCamera) return '';
      
      // Find current camera in userCameras list
      const currentCamera = userCameras.find(cam => cam.name_room === activeCamera);
      
      if (currentCamera && currentCamera.url && cameraStatuses[activeCamera]?.status !== 'offline') {
        let url = currentCamera.url;
        
        // Add quality parameter if needed
        if (url.includes('?')) {
          url += `&quality=${streamQuality}`;
        } else {
          url += `?quality=${streamQuality}`;
        }
        
        console.log(`🎥 Direct camera URL: ${url}`);
        return url;
      }
      
      return '';
    })();
    
    // Check if camera is offline
    const isOffline = cameraStatuses[activeCamera]?.status === 'offline';
    
    // WebView error handler
    const handleWebViewError = (syntheticEvent) => {
      const { nativeEvent } = syntheticEvent;
      console.warn('🚫 WebView error:', nativeEvent);
      setWebViewError(true);
      setErrorMessage(nativeEvent.description || 'Không thể kết nối tới camera');
    };
    
    // App state management for pausing stream
    useEffect(() => {
      const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
          setIsPaused(false);
        } else {
          setIsPaused(true);
        }
      };
      
      // Use the subscription model for event listeners
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        subscription.remove();
      };
    }, []);
    
    // Error view when camera is offline or has errors
    const renderErrorView = () => {
      return (
        <View style={styles.streamWebView}>
          <View style={styles.cameraErrorContainer}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons 
                name={isOffline ? "access-point-network-off" : "video-off"} 
                size={50} 
                color="#ff6b6b" 
              />
            </View>
            
            <Text style={styles.cameraErrorTitle}>
              {isOffline ? "Camera ngoại tuyến" : "Không thể phát video"}
            </Text>
            
            <Text style={styles.cameraErrorMessage}>
              {isOffline 
                ? "Không thể kết nối tới camera. Vui lòng kiểm tra lại kết nối mạng hoặc thiết bị camera." 
                : errorMessage || "Không thể phát video từ camera này. URL không hợp lệ hoặc server không phản hồi."
              }
            </Text>
          </View>
        </View>
      );
    };
    
    // Simple timestamp display
    const renderTimeStamp = () => {
      return (
        <View style={styles.cameraFooterInfo}>
          <Text style={styles.cameraFooterText}>
            {moment().format('HH:mm:ss')} • {
              userCameras.find(cam => cam.name_room === activeCamera)?.name || 'Camera'
            }
          </Text>
        </View>
      );
    };
    
    return (
      <View style={[
        styles.cameraContainer, 
        isFullScreen && styles.fullScreenContainer
      ]}>
        <View style={styles.cameraContent}>
          {isOffline || webViewError ? (
            renderErrorView()
          ) : streamUrl ? (
            <>
              {!isPaused && (
                <WebView
                  ref={webViewRef}
                  source={{ uri: streamUrl }}
                  style={styles.streamWebView}
                  scrollEnabled={false}
                  javaScriptEnabled={true}
                  allowsInlineMediaPlayback={true}
                  mediaPlaybackRequiresUserAction={false}
                  onError={handleWebViewError}
                  cacheEnabled={false}
                  incognito={true}
                />
              )}
              
              {/* Simple timestamp display */}
              {renderTimeStamp()}
              
              {/* Fullscreen button */}
              <TouchableOpacity 
                style={styles.fullscreenButton} 
                onPress={toggleFullScreen}
              >
                <MaterialIcons 
                  name={isFullScreen ? "fullscreen-exit" : "fullscreen"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </>
          ) : (
            renderErrorView()
          )}
        </View>
      </View>
    );
  };

  const refreshCameras = () => {
    console.log('🔄 Manual refresh cameras triggered');
    fetchCamerasFromAPI();
  };

  // Thêm nút trong CameraList
  const CameraList = () => (
    <View style={styles.cameraList}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Camera Giám Sát</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity 
            style={[styles.addCameraButton, {marginRight: 10}]}
            onPress={refreshCameras}
          >
            <MaterialIcons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addCameraButton, {marginRight: 10}]}
            onPress={() => navigation.navigate('TestWebView')}
          >
            <MaterialIcons name="bug-report" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addCameraButton}
            onPress={() => navigation.navigate('AddCamera')}
          >
            <MaterialIcons name="add" size={20} color={colors.primary} />
            <Text style={styles.addCameraText}>Thêm camera</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Debug info */}
      <View style={{padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10}}>
        <Text style={{fontSize: 12}}>Debug: UserID={user?.user_id}, Cameras: {userCameras.length}</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.cameraCardList}
        contentContainerStyle={styles.cameraCardContent}
      >
        {/* Bỏ các camera mặc định (phòng khách, phòng ngủ, nhà bếp) */}
        
        {/* Hiển thị các camera từ API */}
        {userCameras.map(camera => (
          <TouchableOpacity 
            key={camera.id}
            style={[
              styles.cameraCard, 
              activeCamera === camera.name_room && styles.cameraCardActive
            ]} 
            onPress={() => switchCamera(camera.name_room)}
          >
            <View style={styles.cameraCardImageContainer}>
              <View style={styles.cameraCardImage}>
                <MaterialCommunityIcons name="cctv" size={28} color={colors.primary} />
              </View>
              <View style={[
                styles.cameraStatusIndicator,
                cameraStatuses[camera.name_room]?.status === 'offline' && styles.cameraStatusOffline
              ]}>
                <MaterialIcons 
                  name="circle" 
                  size={10} 
                  color={
                    cameraStatuses[camera.name_room]?.status === 'online' 
                      ? colors.success 
                      : cameraStatuses[camera.name_room]?.status === 'weak'
                        ? colors.warning
                        : colors.textTertiary
                  } 
                />
              </View>
            </View>
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <Text style={styles.cameraCardTitle} numberOfLines={1} ellipsizeMode="tail">
                {camera.name}
              </Text>
              <Text style={styles.cameraCardSubtitle}>
                {cameraStatuses[camera.name_room]?.text || 'Đang hoạt động'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Add camera button */}
        <TouchableOpacity 
          style={styles.cameraCardEmpty}
          onPress={() => navigation.navigate('AddCamera')}
        >
          <View style={styles.cameraCardEmptyIcon}>
            <MaterialIcons name="add-circle-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.cameraCardEmptyText}>Thêm camera mới</Text>
        </TouchableOpacity>
        
        {/* Loading indicator while fetching API cameras */}
        {apiLoading && (
          <View style={styles.cameraCard}>
            <View style={styles.cameraCardImageContainer}>
              <View style={[styles.cameraCardImage, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            </View>
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <Text style={styles.cameraCardTitle}>Đang tải...</Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Hiển thị thông báo khi không có camera nào */}
      {!apiLoading && userCameras.length === 0 && (
        <View style={styles.noCameraContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="camera-off" size={50} color={colors.textTertiary} />
          </View>
          <Text style={styles.noCameraText}>Chưa có camera nào được thêm</Text>
          <Text style={styles.noCameraSubText}>Nhấn vào nút "Thêm camera" để bắt đầu</Text>
        </View>
      )}
      
      <View style={styles.recentEvents}>
        <Text style={styles.recentEventsTitle}>Sự kiện gần đây</Text>
        
        <View style={styles.eventCard}>
          <View style={styles.eventIconContainer}>
            <MaterialCommunityIcons name="motion-sensor" size={24} color="#fff" />
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>Phát hiện chuyển động</Text>
            <Text style={styles.eventDescription}>Phòng khách - 10 phút trước</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </View>
        
        <View style={styles.eventCard}>
          <View style={[styles.eventIconContainer, styles.eventIconInfo]}>
            <MaterialCommunityIcons name="face-recognition" size={24} color="#fff" />
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>Nhận diện khuôn mặt</Text>
            <Text style={styles.eventDescription}>Phòng ngủ - 35 phút trước</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!isFullScreen && (
        <LinearGradient 
          style={styles.compactHeaderView} 
          colors={[colors.primaryDark, colors.primary]}
        >
          <View style={styles.topHeaderView}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={22} color={colors.background} />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Hệ thống Camera</Text>
            <View style={styles.headerRightContainer}>
              <TouchableOpacity 
                style={styles.emergencyButton}
                onPress={() => Alert.alert("Thông báo", "Đang gọi khẩn cấp...")}
              >
                <MaterialCommunityIcons name='phone-alert' color={colors.background} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name='notifications' size={22} color={colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}
      
      <View style={[styles.viewBody, isFullScreen && styles.fullScreenBody]}>
        <ScrollView 
          contentInsetAdjustmentBehavior="automatic" 
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isFullScreen}
        >
          {isFullScreen ? (
            <CameraView />
          ) : (
            <>
              <CameraView />
              <CameraList />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CameraScreen;