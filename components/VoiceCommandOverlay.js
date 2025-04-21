import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { normalize } from '../utils/responsive';
import * as Speech from 'expo-speech';

const VoiceCommandOverlay = ({ 
  isVisible, 
  isListening, 
  transcription, 
  processingState,
  commandResult
}) => {
  const [dots, setDots] = React.useState('');
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const lastResultRef = React.useRef(null);
  
  // Phát âm khi có kết quả mới
  useEffect(() => {
    if (commandResult && commandResult !== lastResultRef.current) {
      lastResultRef.current = commandResult;
      
      // Chỉ phát âm nếu không phải trạng thái đang phân tích
      if (processingState === 'completed') {
        console.log('🔊 Phát âm từ overlay:', commandResult);
        Speech.speak(commandResult, {
          language: 'vi-VN',
          pitch: 1,
          rate: 0.8,
        });
      }
    }
  }, [commandResult, processingState]);

  React.useEffect(() => {
    let interval;
    if (isListening || processingState === 'analyzing') {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);

      // Cài đặt animation pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      if (interval) clearInterval(interval);
      pulseAnim.setValue(1);
    };
  }, [isListening, processingState]);

  if (!isVisible && !isListening && !processingState) {
    return null;
  }

  return (
    <View style={styles.overlayContainer}>
      {isListening && (
        <View style={styles.listeningContainer}>
          <Animated.View 
            style={[
              styles.micIconContainer, 
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <MaterialCommunityIcons 
              name="microphone" 
              size={normalize(24)} 
              color="#fff"
            />
          </Animated.View>
          
          <Text style={styles.listeningText}>
            Đang lắng nghe{dots}
          </Text>
          
          {transcription ? (
            <View style={styles.transcriptionBox}>
              <Text style={styles.transcriptionText}>
                {transcription}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {processingState === 'analyzing' && (
        <View style={styles.processingContainer}>
          <MaterialCommunityIcons 
            name="brain" 
            size={normalize(30)} 
            color="#fff" 
          />
          <Text style={styles.processingText}>
            Đang phân tích{dots}
          </Text>
          <Text style={styles.processingSubText}>
            Đang xử lý yêu cầu của bạn
          </Text>
        </View>
      )}

      {processingState === 'executing' && (
        <View style={styles.processingContainer}>
          <MaterialCommunityIcons 
            name="cog" 
            size={normalize(30)} 
            color="#fff" 
          />
          <Text style={styles.processingText}>
            Đang thực hiện...
          </Text>
        </View>
      )}

      {processingState === 'completed' && (
        <View style={styles.completedContainer}>
          <MaterialCommunityIcons 
            name="check-circle" 
            size={normalize(30)} 
            color="#4CAF50" 
          />
          <Text style={styles.completedText}>
            Đã hoàn thành!
          </Text>
          {commandResult && (
            <Text style={styles.commandResultText}>
              {commandResult}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: normalize(100),
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  listeningContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: normalize(16),
    padding: normalize(16),
    alignItems: 'center',
    minWidth: normalize(200),
  },
  micIconContainer: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  listeningText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '500',
  },
  transcriptionBox: {
    marginTop: normalize(12),
    padding: normalize(10),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: normalize(8),
    width: '100%',
  },
  transcriptionText: {
    color: '#fff',
    fontSize: normalize(14),
    textAlign: 'center',
  },
  processingContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: normalize(16),
    padding: normalize(16),
    alignItems: 'center',
    minWidth: normalize(200),
  },
  processingText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '500',
    marginTop: normalize(8),
  },
  processingSubText: {
    color: '#ddd',
    fontSize: normalize(12),
    marginTop: normalize(4),
  },
  completedContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: normalize(16),
    padding: normalize(16),
    alignItems: 'center',
    minWidth: normalize(200),
  },
  completedText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '500',
    marginTop: normalize(8),
  },
  commandResultText: {
    color: '#4CAF50',
    fontSize: normalize(14),
    marginTop: normalize(8),
    textAlign: 'center',
  },
});

export default VoiceCommandOverlay;
