import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVoiceCommand } from '../../context/VoiceCommandContext';
import { colors } from '../../theme/colors';
import { normalize } from '../../utils/responsive';

const VoiceSettings = ({ navigation }) => {
  const { 
    hotwordEnabled, 
    isHotwordListening, 
    toggleHotwordDetection 
  } = useVoiceCommand();
  
  const [isLoading, setIsLoading] = useState(false);
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Cài đặt giọng nói',
    });
  }, [navigation]);
  
  // Handle toggle for hotword detection
  const handleHotwordToggle = async (value) => {
    setIsLoading(true);
    try {
      if (value) {
        // Show info dialog before enabling
        Alert.alert(
          'Kích hoạt bằng giọng nói',
          'Khi bật tính năng này, ứng dụng sẽ liên tục lắng nghe từ khóa "Vi bot ơi". Điều này có thể tiêu tốn pin thiết bị của bạn.',
          [
            { text: 'Hủy', style: 'cancel', onPress: () => setIsLoading(false) },
            { 
              text: 'Bật', 
              onPress: async () => {
                const success = await toggleHotwordDetection(true);
                if (!success) {
                  Alert.alert('Lỗi', 'Không thể kích hoạt tính năng này. Vui lòng thử lại.');
                }
                setIsLoading(false);
              }
            }
          ]
        );
      } else {
        await toggleHotwordDetection(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error toggling hotword detection:', error);
      setIsLoading(false);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi thay đổi cài đặt.');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TỪ KHÓA KÍCH HOẠT</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="microphone-outline" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Kích hoạt bằng giọng nói</Text>
              <Text style={styles.settingDescription}>
                Cho phép kích hoạt trợ lý bằng cách nói "Vi bot ơi"
              </Text>
            </View>
          </View>
          
          <Switch
            value={hotwordEnabled}
            onValueChange={handleHotwordToggle}
            disabled={isLoading}
            trackColor={{ false: '#767577', true: colors.primary + '80' }}
            thumbColor={hotwordEnabled ? colors.primary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
        
        {/* Add dependency notice */}
        <View style={styles.warningContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#F57C00" />
          <Text style={styles.warningText}>
            Tính năng này yêu cầu cài đặt thêm thư viện. Vui lòng liên hệ nhà phát triển để kích hoạt.
          </Text>
        </View>
        
        {hotwordEnabled && (
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, isHotwordListening ? styles.statusActive : styles.statusInactive]} />
            <Text style={styles.statusText}>
              {isHotwordListening ? 'Đang lắng nghe từ khóa "Vi bot ơi"' : 'Không hoạt động'}
            </Text>
          </View>
        )}
        
        <Text style={styles.infoText}>
          Khi bật tính năng này, trợ lý sẽ liên tục lắng nghe và phản hồi khi bạn nói "Vi bot ơi".
          {'\n\n'}
          Lưu ý: Tính năng này sẽ tiếp tục lắng nghe ngay cả khi ứng dụng đang chạy nền, và có thể làm giảm thời lượng pin.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CÀI ĐẶT GIỌNG NÓI</Text>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
        >
          <Text style={styles.buttonText}>Kiểm tra khả năng nhận diện giọng nói</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
        >
          <Text style={styles.buttonText}>Hiệu chỉnh giọng nói</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 15,
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
  sectionTitle: {
    fontSize: normalize(13),
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 15,
    letterSpacing: 0.8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingTitle: {
    fontSize: normalize(16),
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: normalize(13),
    color: colors.textSecondary,
    lineHeight: normalize(18),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: normalize(13),
    color: colors.textSecondary,
  },
  infoText: {
    fontSize: normalize(13),
    color: colors.textTertiary,
    lineHeight: normalize(18),
    marginTop: 15,
    fontStyle: 'italic',
  },
  settingButton: {
    backgroundColor: colors.primaryLight + '10',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    fontSize: normalize(15),
    fontWeight: '500',
    color: colors.primary,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  warningText: {
    fontSize: normalize(13),
    color: '#D84315',
    marginLeft: 10,
    flex: 1,
  },
});

export default VoiceSettings;
