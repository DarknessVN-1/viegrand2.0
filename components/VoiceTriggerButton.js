import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Animated, Easing, Text, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVoiceCommand } from '../context/VoiceCommandContext';
import { VoiceControlService } from '../services/VoiceControlService';
import { colors } from '../theme/colors';
import { normalize } from '../utils/responsive';
import VoiceAssistantTips from './VoiceAssistantTips';

const VoiceTriggerButton = ({ style, size = 'medium', useFloating = false }) => {
  const { 
    isListening, 
    startListening, 
    stopListening, 
    processingState, 
    transcription,
    commandResult 
  } = useVoiceCommand();
  
  const [showTips, setShowTips] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Kích thước nút dựa trên tham số size
  const buttonSizes = {
    small: normalize(50),
    medium: normalize(60),
    large: normalize(70),
  };
  
  const buttonSize = buttonSizes[size] || buttonSizes.medium;
  const iconSize = buttonSize * 0.6;

  // Animation khi đang lắng nghe
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  useEffect(() => {
    // Show a brief tip about long press the first time
    const hasShownHint = global.hasShownVoiceHint || false;
    if (!hasShownHint) {
      setTimeout(() => {
        VoiceControlService.speak('Nhấn giữ nút microphone để xem trợ giúp về các lệnh giọng nói', { 
          rate: 0.8 
        });
        global.hasShownVoiceHint = true;
      }, 5000);
    }
  }, []);

  const handlePress = async () => {
    try {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      console.error('Error in voice trigger button:', error);
      // Sử dụng VoiceControlService thay vì Speech trực tiếp
      VoiceControlService.speak('Có lỗi xảy ra, vui lòng thử lại', { language: 'vi-VN' });
    }
  };

  // Handle long press to show voice command tips
  const handleLongPress = () => {
    // Provide haptic feedback if available
    try {
      if (Platform.OS === 'ios' && Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e) {
      // Ignore if Haptics is not available
    }
    
    // Show tooltip that tips are opening
    VoiceControlService.speak('Đang mở danh sách các lệnh giọng nói', { rate: 0.9 });
    setShowTips(true);
  };

  // Chọn icon dựa vào trạng thái
  const getIcon = () => {
    if (isListening) {
      return "microphone";
    } else if (processingState === 'analyzing' || processingState === 'executing') {
      return "cog";
    } else if (processingState === 'completed') {
      return "check";
    } else {
      return "microphone";
    }
  };

  return (
    <View style={[
      styles.container,
      useFloating && styles.floatingContainer,
      style
    ]}>
      <Animated.View style={[
        { transform: [{ scale: isListening ? pulseAnim : 1 }] }
      ]}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
            isListening && styles.activeButton,
            processingState === 'analyzing' && styles.processingButton,
            processingState === 'completed' && styles.completedButton,
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500} // Reduce long press time for better usability
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={getIcon()}
            size={iconSize}
            color="#fff"
            style={[
              isListening && styles.rotateIcon,
              processingState === 'analyzing' && styles.analyzeIcon
            ]}
          />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Add press & hold hint */}
      {!isListening && !processingState && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Nhấn giữ để xem trợ giúp</Text>
        </View>
      )}
      
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
      ) : processingState === 'completed' && commandResult ? (
        <View style={[styles.processingContainer, styles.completedContainer]}>
          <Text style={styles.completedText}>{commandResult}</Text>
        </View>
      ) : null}
      
      {/* Voice Assistant Tips Modal */}
      <VoiceAssistantTips 
        visible={showTips} 
        onClose={() => setShowTips(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: normalize(30),
    right: normalize(30),
    zIndex: 100,
  },
  button: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#F44336', // Đỏ khi đang lắng nghe
  },
  processingButton: {
    backgroundColor: '#2196F3', // Xanh dương khi đang xử lý
  },
  completedButton: {
    backgroundColor: '#4CAF50', // Xanh lá khi hoàn thành
  },
  rotateIcon: {
    // Có thể thêm animation quay nếu muốn
  },
  analyzeIcon: {
    opacity: 0.8,
  },
  hintContainer: {
    position: 'absolute',
    bottom: -30, // Move down a bit for better visibility 
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: 'auto',
    minWidth: normalize(140)
  },
  hintText: {
    color: '#fff',
    fontSize: normalize(12),
    textAlign: 'center',
    fontWeight: '500'
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

export default VoiceTriggerButton;
