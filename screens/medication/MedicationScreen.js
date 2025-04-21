import { AntDesign, FontAwesome5, Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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
  Dimensions,
  Alert,
  Linking
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { metrics, normalize } from '../../utils/responsive';
import DialogAddMedicine from './Components/DialogAddMedicine';
import MedicineComponent from './Components/MedicineComponent';
import PopPassWord from './Components/PopPassWord';
import CustomTabBar from '../../components/navigation_bar'; // Add this import
import { notificationService } from '../../services/notificationService'; // Fix import

const windowHeight = Dimensions.get('window').height;

const WeatherBox = () => {
  return (
    <LinearGradient
      colors={[colors.primaryLight + '40', colors.background]}
      style={styles.viewWeather}
    >
      <View style={styles.weatherHeader}>
        <View style={styles.viewDate}>
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
              {/* Fix: Replace 'humidity' with 'water' which exists in FontAwesome5 */}
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
    </LinearGradient>
  );
};

export default function MedicationScreen({ navigation }) {
  const { user, typeUser } = useAuth();
  // Thêm ref cho MedicineComponent
  const medicineComponentRef = React.useRef(null);
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false); // Add this
  const [error, setError] = React.useState(null); // Add this

  const isFocus = useIsFocused()

  const [useMedicine, setUseMedicine] = React.useState(false)

  const [popAddMedicine, setPopAddMedicine] = React.useState(false)

  const [popPass, setPopPass] = useState(false)


  useEffect(() => {
    // Đảm bảo rằng quyền thông báo được cấp phép khi vào trang thuốc
    const checkNotificationPermission = async () => {
      const permissionGranted = await notificationService.requestPermissions();
      if (!permissionGranted) {
        // Hiển thị thông báo cho người dùng rằng họ cần bật quyền thông báo
        Alert.alert(
          "Cần quyền thông báo",
          "Để nhận nhắc nhở uống thuốc, bạn cần cấp quyền thông báo cho ứng dụng.",
          [
            { 
              text: "Đóng", 
              style: "cancel" 
            },
            { 
              text: "Cài đặt", 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
      }
    };
    
    if (isFocus) {
      StatusBar.setBarStyle("light-content");
      StatusBar.setBackgroundColor(colors.primaryDark);
      checkNotificationPermission();
    }
  }, [isFocus]);

  const onRefresh = React.useCallback(() => {

    setRefreshing(true);
    // Thêm logic refresh data ở đây
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const ViewButtonFunction = (images, title, onPress) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.viewButtonFunction}>
        <Image source={images} style={{ width: normalize(80), height: normalize(80), resizeMode: 'contain' }} />
        <Text>{title}</Text>
      </TouchableOpacity>
    )
  }

  const handleCheckOpenPass = () => {
    if (typeUser === 'relative') {
      setPopAddMedicine(true);
      return;
    }
    
    setPopPass(true);
  };

  const handleTabPress = (routeName) => {
    switch (routeName) {
      case 'Features':
      case 'ElderlyHome':
      case 'Entertainment':
      case 'Settings':
        navigation.navigate('ElderlyTabs', { screen: routeName });
        break;
      default:
        navigation.navigate(routeName);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient style={styles.headerView} colors={[colors.primaryDark, colors.primary, colors.primaryLight]}>
        <View style={styles.topHeaderView}>
          <View style={styles.viewTopLogo}>
            <Image source={require('../../assets/logo-header.png')} style={styles.sizeTopLogo} />
          </View>
          <FontAwesome5 name="user-circle" size={20} color={colors.background} />
          <Text style={styles.userName}>{user?.username}</Text>
        </View>

        <View style={styles.viewUrgentTop}>
          <TouchableOpacity style={styles.buttonUrgentTop}>
            <MaterialCommunityIcons name='phone-alert' color={colors.background} size={25} />
            <Text style={styles.textUrgenTop}>Khẩn Cấp</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.viewBody}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <WeatherBox />
          <MedicineComponent ref={medicineComponentRef} />
        </ScrollView>
      </View>

      <TouchableOpacity 
        onPress={handleCheckOpenPass} 
        style={styles.floatingButton}
      >
        <AntDesign size={25} name='plus' color={colors.primaryDark} />
      </TouchableOpacity>

      {popAddMedicine && <DialogAddMedicine 
        user={user} 
        closed={() => setPopAddMedicine(false)}
        onSuccess={() => {
          setPopAddMedicine(false)
          // Trigger refresh của MedicineComponent
          if (medicineComponentRef.current) {
            medicineComponentRef.current.refresh()
          }
        }} 
      />}

      {popPass && <PopPassWord user={user} closed={() => setPopPass(false)} handleSubmit={() => {
        setPopPass(false)
        setPopAddMedicine(true)
      }} />}

      {!loading && !error && !typeUser === 'relative' && (
        <CustomTabBar 
          navigation={navigation} 
          state={{ 
            index: 0, // Update index to 0 for Medication tab
            routes: [
              { name: 'Medication' },
              { name: 'ElderlyHome' },
              { name: 'Entertainment' },
              { name: 'Settings' }
            ] 
          }}
          onTabPress={({ route }) => handleTabPress(route.name)}
        />
      )}

    </SafeAreaView>
  );
}

// Component styles
const styles = StyleSheet.create({
  // Core layout adjustments
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF', // Lighter background color
    paddingBottom: 0, // Xóa paddingBottom
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: metrics.padding * 3, // Giảm paddingBottom
  },
  mainContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  headerView: {
    height: Platform.OS === 'android' ? normalize(100) + StatusBar.currentHeight : normalize(100), // Reduced height
    width: '100%',
    borderBottomLeftRadius: normalize(20),
    borderBottomRightRadius: normalize(20),
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  topHeaderView: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: normalize(15),
  },
  // Enhanced header
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: normalize(14),
    letterSpacing: 0.5,
    marginBottom: 6,
    opacity: 0.75,
    color: colors.primaryDark,
  },
  userName: {
    fontWeight: '600',
    color: colors.background,
    fontSize: metrics.subtitle,
    marginLeft: 10
  },
  viewTopLogo: {
    position: 'absolute',
    left: normalize(15),
  },
  sizeTopLogo: {
    width: normalize(50), height: normalize(50),
    resizeMode: 'contain'
  },
  viewIconNotificationTop: {
    position: 'absolute',
    right: normalize(15),
  },
  viewUrgentTop: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonUrgentTop: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    paddingVertical: normalize(5),
    paddingHorizontal: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(20)
  },
  textUrgenTop: {
    fontSize: metrics.caption,
    fontWeight: 'bold',
    color: colors.background,
    marginLeft: 10,
  },
  viewBody: {
    flex: 1,
    zIndex: 0,
  },
  viewWeather: {
    marginTop: normalize(20),
    marginHorizontal: normalize(20),
    padding: normalize(15),
    borderRadius: normalize(15),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { 
          width: 0, 
          height: 4 
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(15),
  },
  weatherTitle: {
    fontSize: metrics.body,
    fontWeight: '600',
    color: colors.primary,
  },
  viewDate: {
    backgroundColor: colors.primary + '10',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  dateText: {
    fontSize: metrics.caption,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherIconContainer: {
    alignItems: 'center',
    width: '40%',
  },
  weatherIcon: {
    width: normalize(80),
    height: normalize(80),
    resizeMode: 'contain',
  },
  temperature: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: normalize(5),
  },
  weatherInfo: {
    flex: 1,
    paddingLeft: normalize(15),
  },
  location: {
    fontSize: metrics.title,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: normalize(5),
  },
  weatherDescription: {
    fontSize: metrics.body,
    color: colors.textSecondary,
    marginBottom: normalize(10),
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: normalize(15),
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  weatherDetailText: {
    fontSize: metrics.caption,
    color: colors.primary,
    marginLeft: normalize(5),
  },
  floatingButton: {
    position: 'absolute',
    bottom: windowHeight * 0.15, // 30% từ bottom
    right: normalize(20),
    width: normalize(50),
    height: normalize(50),
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 999, // Đảm bảo nút luôn hiển thị trên cùng
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Refined sections
  section: {
    marginVertical: 12,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#2F3542',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.primaryDark,
  },

  // Enhanced cards
  elderlyCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#2F3542',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  elderlyCardWarning: {
    backgroundColor: colors.warning + '03',
    borderColor: colors.warning + '15',
  },
  elderlyAvatarContainer: {
    marginRight: 16,
  },
  elderlyAvatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick actions refinements
  quickActionButton: {
    flex: 1,
    maxWidth: '48%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    minHeight: 130,
  },
  quickActionIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Typography refinements
  quickActionText: {
    fontSize: normalize(14),
    fontWeight: '600',
    textAlign: 'center',
    color: colors.primaryDark,
    letterSpacing: 0.3,
  },
  elderlyName: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
    color: colors.primaryDark,
  },
  statusText: {
    fontSize: normalize(13),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  lastUpdate: {
    fontSize: normalize(12),
    color: colors.textTertiary,
    letterSpacing: 0.1,
    marginTop: 4,
  },

  // Alert card refinements
  alertCard: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  alertTitle: {
    fontSize: normalize(15),
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
    color: colors.primaryDark,
  },
  alertMessage: {
    fontSize: normalize(14),
    color: colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  viewButtonFunction: {
    width: '48%', alignItems: 'center',
    marginBottom: normalize(20),
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.input.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonPlusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  buttonPlus: {
    width: normalize(35),
    height: normalize(35),
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight
  },
  scrollContent: {
    paddingBottom: normalize(150), // Tăng padding bottom để có thêm khoảng scroll
  },
});
