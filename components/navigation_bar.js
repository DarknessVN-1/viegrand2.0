import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useEffect } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { VoiceControlService } from '../services/VoiceControlService';
import { colors } from '../theme/colors';
import { normalize } from '../utils/responsive';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

const TAB_BAR_HEIGHT = 85;
const HOME_BUTTON_SIZE = 75; // Increased from 65

const CustomTabBar = ({ state = { index: 0, routes: [] }, descriptors = {}, navigation, onTabPress }) => {
  const { user, isPremium, typeUser } = useAuth();
  
  // Sử dụng hook useVoiceCommands thay vì trực tiếp gọi VoiceControlService
  const { 
    isListening, 
    startListening, 
    stopListening, 
    transcription, 
    finalTranscription,
    handleCommand,
    processingState
  } = useVoiceCommands({
    // Custom handlers cho các màn hình đặc biệt
    Medication: () => handleTabPress('Medication'),
    ElderlyHome: () => handleTabPress(typeUser === 'elderly' ? 'ElderlyHome' : 'RelativeHome'),
    Entertainment: () => handleTabPress('Entertainment'),
    Settings: () => handleTabPress('Settings'),
    Features: () => handleTabPress('Features'),
    // Thêm các handlers khác nếu cần
    Video: () => navigation.navigate('Video'),
    Truyện: () => navigation.navigate('Truyện'),
    MiniGame: () => navigation.navigate('MiniGame'),
    RadioScreen: () => navigation.navigate('RadioScreen'),
    ExerciseSelection: () => navigation.navigate('ExerciseSelection'),
    Sudoku: () => navigation.navigate('Sudoku'),
    MemoryCard: () => navigation.navigate('MemoryCard'),
    NumberPuzzle: () => navigation.navigate('NumberPuzzle')
  });

  // Theo dõi khi có transcription cuối cùng để xử lý chuyển màn hình
  useEffect(() => {
    if (finalTranscription) {
      console.log('Received final transcription:', finalTranscription);
      // handleCommand đã được gọi tự động trong hook
    }
  }, [finalTranscription]);

  const handleTabPress = (routeName) => {
    if (routeName === 'Microphone') {
      handleVoiceCommand();
      return;
    }

    // Thay đổi cách xử lý navigation
    if (onTabPress) {
      onTabPress({ route: { name: routeName } });
    } else {
      // Luôn navigate thông qua ElderlyTabs
      navigation.navigate('ElderlyTabs', { screen: routeName });
    }
  };

  const tabs = [
    {
      name: 'Medication', // Thay đổi từ 'Features' thành 'Medication'
      icon: 'pill', // Thay đổi icon thành 'pill'
      label: <Text style={styles.label}>Nhắc thuốc</Text> // Thay đổi label
    },
    { name: typeUser === 'elderly' ? 'ElderlyHome' : 'RelativeHome', icon: 'home', label: <Text style={styles.label}>Trang chủ</Text> },
    { name: 'Microphone', icon: 'microphone', label: <Text style={styles.label}>Micro</Text>, isAction: true }, // Add isAction flag
    { name: 'Entertainment', icon: 'gamepad-variant', label: <Text style={styles.label}>Giải trí</Text> },
    { name: 'Settings', icon: 'cog', label: <Text style={styles.label}>Cài đặt</Text> }
  ];

  // Thêm kiểm tra bảo vệ
  const isTabActive = (tabName) => {
    if (!state.routes || !state.routes[state.index]) return false;
    return state.routes[state.index].name === tabName;
  };

  const showVoiceCommandInput = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Nhập lệnh',
        'Nhập lệnh của bạn (vd: "trang chủ", "cài đặt")',
        [
          {
            text: 'Hủy',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: (text) => {
              if (text) {
                const command = VoiceControlService.parseCommand(text);
                if (command) {
                  handleTabPress(command);
                } else {
                  Alert.alert('Thông báo', 'Không nhận dạng được lệnh');
                }
              }
            },
          },
        ],
        'plain-text'
      );
    } else {
      // For Android, show a regular alert with buttons
      Alert.alert(
        'Chọn lệnh',
        'Chọn lệnh bạn muốn thực hiện',
        [
          { text: 'Trang chủ', onPress: () => handleTabPress('ElderlyHome') },
          { text: 'Cài đặt', onPress: () => handleTabPress('Settings') },
          { text: 'Giải trí', onPress: () => handleTabPress('Entertainment') },
          { text: 'Tính năng', onPress: () => handleTabPress('Features') },
          { text: 'Hủy', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleVoiceCommand = async () => {
    try {
      // Sử dụng hook thay vì trực tiếp gọi VoiceControlService
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (err) {
      console.error('Voice command error:', err);
      Speech.speak('Có lỗi xảy ra, vui lòng thử lại', { language: 'vi-VN' });
    }
  };

  const renderMicroButton = () => (
    <TouchableOpacity
      style={[styles.centerTab, isListening && styles.recordingButton]}
      onPress={handleVoiceCommand}
      activeOpacity={0.9}
    >
      <View style={styles.centerTabOuter}>
        <LinearGradient
          colors={[isListening ? '#ff0000' : colors.primary, isListening ? '#ff4444' : colors.primary]}
          style={styles.centerTabGradient}
        >
          <MaterialCommunityIcons
            name={isListening ? "microphone" : processingState ? "dots-horizontal" : "microphone"}
            size={36}
            color="#fff"
          />
        </LinearGradient>
      </View>
      {transcription ? (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>{transcription}</Text>
        </View>
      ) : processingState === 'analyzing' ? (
        <View style={styles.processingContainer}>
          <Text style={styles.processingText}>Đang phân tích...</Text>
        </View>
      ) : processingState === 'executing' ? (
        <View style={styles.processingContainer}>
          <Text style={styles.processingText}>Đang thực hiện...</Text>
        </View>
      ) : processingState === 'completed' ? (
        <View style={[styles.processingContainer, styles.completedContainer]}>
          <Text style={styles.completedText}>Đã hoàn thành!</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  const renderSettingsTab = () => (
    <View style={styles.settingsTab}>
      {user?.avatar ? (
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
          />
          {isPremium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={12} color="#FFD700" />
            </View>
          )}
        </View>
      ) : (
        <MaterialCommunityIcons
          name="cog"
          size={28}
          color={state.index === 4 ? colors.primary : 'rgba(0,0,0,0.5)'}
        />
      )}
      <Text style={[
        styles.label,
        state.index === 4 && styles.activeLabel
      ]}>
        Cài đặt
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {tabs.map((tab, index) => {
          const isActive = isTabActive(tab.name);

          return (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab,
                isActive && styles.activeTab
              ]}
              onPress={() => handleTabPress(tab.name)}
            >
              {tab.name === 'Settings' ? (
                <View style={styles.settingsTab}>
                  <MaterialCommunityIcons
                    name="cog"
                    size={28}
                    color={isActive ? colors.primary : 'rgba(0,0,0,0.5)'}
                  />
                  <Text style={[
                    styles.label,
                    isActive && styles.activeLabel
                  ]}>
                    {tab.label}
                  </Text>
                </View>
              ) : (
                <View style={styles.tabContent}>
                  {index === 2 ? (
                    renderMicroButton()
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name={tab.icon}
                        size={28}
                        color={isActive ? colors.primary : 'rgba(0,0,0,0.5)'}
                        style={styles.icon}
                      />
                      <Text style={[
                        styles.label,
                        isActive && styles.activeLabel
                      ]}>
                        {tab.label}
                      </Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  background: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    width: HOME_BUTTON_SIZE,
    height: HOME_BUTTON_SIZE,
    marginTop: -45, // Adjusted from -32 to maintain proportions
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTabOuter: {
    width: HOME_BUTTON_SIZE,
    height: HOME_BUTTON_SIZE,
    borderRadius: HOME_BUTTON_SIZE / 2,
    backgroundColor: '#fff',
    padding: 5, // Increased from 4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, // Slightly increased
    shadowRadius: 10, // Increased from 8
    elevation: 10, // Increased from 8
  },
  centerTabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: HOME_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  activeTab: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: 16,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: normalize(12),
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  avatarContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  settingsTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    transform: [{ scale: 1.1 }],
  },
  // Thêm styles mới cho transcription
  transcriptionContainer: {
    position: 'absolute',
    top: -80,
    left: -100,
    right: -100,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  transcriptionText: {
    color: '#fff',
    fontSize: normalize(14),
    textAlign: 'center',
  },
  processingContainer: {
    position: 'absolute',
    top: -60,
    left: -80,
    right: -80,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: normalize(12),
    textAlign: 'center',
  },
  completedContainer: {
    backgroundColor: 'rgba(46,125,50,0.8)',
  },
  completedText: {
    color: '#fff',
    fontSize: normalize(12),
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CustomTabBar;
