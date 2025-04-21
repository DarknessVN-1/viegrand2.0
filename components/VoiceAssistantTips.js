import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { normalize } from '../utils/responsive';

const { width } = Dimensions.get('window');

const VoiceAssistantTips = ({ onClose, visible = false }) => {
  const [showTips, setShowTips] = useState(visible);
  const slideAnim = React.useRef(new Animated.Value(width)).current;
  
  useEffect(() => {
    if (visible) {
      setShowTips(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowTips(false));
    }
  }, [visible]);
  
  if (!showTips) return null;
  
  const voiceCommands = [
    {
      category: '🧭 Điều Hướng',
      commands: [
        { phrase: 'Trang chủ', description: 'Quay về màn hình chính' },
        { phrase: 'Mở video', description: 'Mở danh sách video' },
        { phrase: 'Mở truyện', description: 'Mở danh sách truyện' },
        { phrase: 'Quay lại', description: 'Quay lại màn hình trước' },
        { phrase: 'Mở game', description: 'Mở danh sách game' },
        { phrase: 'Cài đặt', description: 'Mở màn hình cài đặt' },
      ]
    },
    {
      category: '🎬 Xem Video',
      commands: [
        { phrase: 'Tìm video về...[chủ đề]', description: 'Tìm video theo chủ đề' },
        { phrase: 'Phát / Tạm dừng', description: 'Điều khiển phát video' },
        { phrase: 'To lên / Nhỏ xuống', description: 'Điều chỉnh âm lượng' },
        { phrase: 'Tắt tiếng / Bật tiếng', description: 'Bật/tắt âm thanh' },
      ]
    },
    {
      category: '📚 Đọc Truyện',
      commands: [
        { phrase: 'Chương tiếp / Chương trước', description: 'Di chuyển giữa các chương' },
        { phrase: 'Tăng cỡ chữ / Giảm cỡ chữ', description: 'Điều chỉnh kích thước chữ' },
        { phrase: 'Chế độ tối / Chế độ sáng', description: 'Thay đổi màu nền' },
      ]
    },
    {
      category: '🎮 Chơi Game',
      commands: [
        { phrase: 'Chơi sudoku', description: 'Mở game Sudoku' },
        { phrase: 'Chơi xếp số', description: 'Mở game Xếp số' },
        { phrase: 'Trò chơi trí nhớ', description: 'Mở game trí nhớ' },
      ]
    },
    {
      category: '💊 Thuốc',
      commands: [
        { phrase: 'Mở thuốc men', description: 'Xem lịch uống thuốc' },
        { phrase: 'Lịch uống thuốc', description: 'Xem lịch uống thuốc' },
      ]
    },
    {
      category: '📷 Camera',
      commands: [
        { phrase: 'Mở camera', description: 'Xem camera giám sát' },
        { phrase: 'Thêm camera', description: 'Thêm camera mới' },
      ]
    }
  ];
  
  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Các Lệnh Giọng Nói</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <Text style={styles.description}>
            Bạn có thể sử dụng các lệnh giọng nói sau để điều khiển ứng dụng:
          </Text>
          
          {voiceCommands.map((category, index) => (
            <View key={index} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category.category}</Text>
              
              {category.commands.map((command, cmdIndex) => (
                <View key={cmdIndex} style={styles.commandItem}>
                  <MaterialCommunityIcons 
                    name="microphone" 
                    size={16} 
                    color={colors.primary}
                    style={styles.commandIcon} 
                  />
                  <View style={styles.commandTextContainer}>
                    <Text style={styles.commandPhrase}>"{command.phrase}"</Text>
                    <Text style={styles.commandDescription}>{command.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
          
          <View style={styles.tipContainer}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color="#F9A825" />
            <Text style={styles.tipText}>
              Mẹo: Nhấn nút microphone và nói rõ ràng để có kết quả tốt nhất.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: normalize(14),
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: normalize(20),
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight + '40',
    paddingBottom: 5,
  },
  commandItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 5,
  },
  commandIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  commandTextContainer: {
    flex: 1,
  },
  commandPhrase: {
    fontSize: normalize(15),
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  commandDescription: {
    fontSize: normalize(13),
    color: colors.textSecondary,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  tipText: {
    fontSize: normalize(13),
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
});

export default VoiceAssistantTips;
