import { FontAwesome5, Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { metrics, normalize } from '../../utils/responsive';

const ElderlyCard = ({ name, status, lastUpdate, onPress }) => (
  <TouchableOpacity
    style={[styles.elderlyCard, status === 'warning' && styles.elderlyCardWarning]}
    onPress={onPress}
  >
    <View style={styles.elderlyAvatarContainer}>
      <LinearGradient
        colors={[colors.primary + '20', colors.primary + '10']}
        style={styles.elderlyAvatarGradient}
      >
        <MaterialCommunityIcons name="account-circle" size={60} color={colors.primary} />
      </LinearGradient>
      <View style={[styles.statusIndicator, {
        backgroundColor: status === 'normal' ? colors.success : colors.warning,
        borderColor: status === 'normal' ? colors.success + '30' : colors.warning + '30',
      }]} />
    </View>
    <View style={styles.elderlyInfo}>
      <Text style={styles.elderlyName}>{name}</Text>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, {
          backgroundColor: status === 'normal' ? colors.success + '15' : colors.warning + '15'
        }]}>
          <Text style={[styles.statusText, {
            color: status === 'normal' ? colors.success : colors.warning
          }]}>
            {status === 'normal' ? 'Bình thường' : 'Cần chú ý'}
          </Text>
        </View>
        <Text style={styles.lastUpdate}>{lastUpdate}</Text>
      </View>
    </View>
    <MaterialCommunityIcons
      name="chevron-right"
      size={24}
      color={colors.textTertiary}
      style={styles.elderlyCardArrow}
    />
  </TouchableOpacity>
);

const QuickActionButton = ({ icon, title, gradient, onPress }) => (
  <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
    <LinearGradient
      colors={gradient}
      style={styles.quickActionGradient}
    >
      <View style={styles.quickActionContent}>
        <View style={styles.quickActionIcon}>
          <MaterialCommunityIcons name={icon} size={32} color={colors.primary} />
        </View>
        <Text style={styles.quickActionText}>{title}</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const AlertCard = ({ type, title, message, time, onPress }) => (
  <TouchableOpacity style={styles.alertCard} onPress={onPress}>
    <MaterialCommunityIcons
      name={type === 'warning' ? 'alert' : 'information'}
      size={24}
      color={type === 'warning' ? colors.warning : colors.info}
    />
    <View style={styles.alertContent}>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertMessage}>{message}</Text>
      <Text style={styles.alertTime}>{time}</Text>
    </View>
  </TouchableOpacity>
);

export default function ElderlyHomeScreen({ navigation }) {
  const { user, typeUser } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const isFocus = useIsFocused()


  useEffect(() => {
    if (isFocus) {
      StatusBar.setBarStyle("light-content")
      StatusBar.setBackgroundColor(colors.primaryDark)
    }
  }, [])

  const onRefresh = React.useCallback(() => {

    setRefreshing(true);
    // Thêm logic refresh data ở đây
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const mockElders = [
    { id: 1, name: 'Nguyễn Văn A', status: 'normal', lastUpdate: '5 phút trước' },
    { id: 2, name: 'Trần Thị B', status: 'warning', lastUpdate: '15 phút trước' },
  ];

  const mockAlerts = [
    {
      type: 'warning',
      title: 'Cảnh báo huyết áp',
      message: 'Huyết áp của người thân cao hơn bình thường',
      time: '10:30 AM'
    },
    {
      type: 'info',
      title: 'Nhắc nhở thuốc',
      message: 'Đã đến giờ uống thuốc của người thân',
      time: '9:45 AM'
    },
  ];

  const ViewButtonFunction = (images, title, onPress) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.viewButtonFunction}>
        <Image source={images} style={{ width: normalize(80), height: normalize(80), resizeMode: 'contain' }} />
        <Text>{title}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient style={styles.headerView} colors={[colors.primaryDark, colors.primary, colors.primaryLight]}>
          <View style={styles.topHeaderView}>
            <View style={styles.viewTopLogo}>
              <Image source={require('../../assets/logo-header.png')} style={styles.sizeTopLogo} />
            </View>
            <FontAwesome5 name="user-circle" size={20} color={colors.background} />
            <Text style={styles.userName}>{user?.username}</Text>
            <TouchableOpacity style={styles.viewIconNotificationTop}>
              <Ionicons name='notifications-circle' size={35} color={colors.background} />
            </TouchableOpacity>
          </View>

          <View style={styles.viewUrgentTop}>
            <TouchableOpacity style={styles.buttonUrgentTop}>
              <MaterialCommunityIcons name='phone-alert' color={colors.background} size={25} />
              <Text style={styles.textUrgenTop}>Khẩn Cấp</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.viewTitleWeather}>
          <View style={styles.viewWeather}>
            <View style={styles.viewDate}>
              <Fontisto name='date' size={14} color={colors.black} />
              <Text style={styles.dateText}>{moment().format('DD/MM/YYYY')}</Text>
            </View>

            <View style={styles.viewFoterWeather}>
              <View style={styles.rowViewFoterWeather}>
                <Image source={require('../../assets/Sun_cloud_angled_rain.png')} style={styles.sizeTopLogo} />
              </View>
              <View style={styles.rowViewFoterWeather}>
                <Text
                  style={styles.textAddressFoterWeather}>Hồ Chí Minh</Text>
                <Text style={styles.textSubAddressFoterWeather}>
                  25°C
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.viewBody}>
          <View style={{ flexDirection: 'row', marginHorizontal: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {ViewButtonFunction(require('../../assets/thuoc.png'), 'Uống thuốc', () => navigation.navigate('Medication'))}

            {ViewButtonFunction(require('../../assets/the-duc.png'), 'Tập thể dục', () => navigation.navigate('ExerciseSelection'))}

            {ViewButtonFunction(require('../../assets/game.png'), 'Giải trí', () => navigation.navigate('Entertainment'))}

            {ViewButtonFunction(require('../../assets/book.png'), 'Đọc truyện', () => navigation.navigate('Truyện'))}

            {ViewButtonFunction(require('../../assets/youtube.png'), 'Xem Video', () => navigation.navigate('Video'))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Component styles
const styles = StyleSheet.create({
  // Core layout adjustments
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF', // Lighter background color,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: metrics.padding * 7,
  },
  mainContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  headerView: {
    height: Platform.OS === 'android' ? normalize(140) + StatusBar.currentHeight : normalize(140),
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
  viewTitleWeather: {
    alignItems: 'center', justifyContent: 'center', height: normalize(80)
  },
  viewWeather: {
    position: 'absolute',
    zIndex: 2,
    top: normalize(-40),
    backgroundColor: colors.background,
    height: normalize(110),
    width: '75%',
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
    borderRadius: normalize(15),
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewFoterWeather: { flexDirection: 'row', justifyContent: 'center', marginTop: normalize(10) },
  rowViewFoterWeather: { width: '49%', alignItems: 'center', justifyContent: 'center' },
  textAddressFoterWeather: {
    fontSize: metrics.body, fontWeight: 'bold', fontStyle: 'italic'
  },
  textSubAddressFoterWeather: {
    fontSize: metrics.title, fontWeight: 'bold'
  },

  viewDate: {
    backgroundColor: colors.surfaceBackground, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: normalize(10), paddingVertical: normalize(5), borderRadius: normalize(10)
  },
  dateText: {
    fontSize: metrics.caption,
    color: colors.black,
    marginLeft: 10,
    fontWeight: '600'
  },
  viewBody: {
    zIndex: 1,
    paddingBottom: 120
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
  buttonPlus: {
    width: normalize(35), height: normalize(35), borderRadius: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight
  }
});
