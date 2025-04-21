import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { VoiceControlService } from '../services/VoiceControlService';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';

const BUTTON_SIZE = 70;

const MicroButton = ({ style, customCommands }) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [recording, setRecording] = React.useState(null);
  const navigation = useNavigation();

  const handleNavigation = (command) => {
    if (!command) return;

    try {
      console.log('🚀 Handling navigation for:', command);

      // If command is already a screen name (string)
      if (typeof command === 'string') {
        console.log('📱 Navigating to screen:', command);
        navigation.navigate(command);
        Speech.speak(`Đã mở ${command}, chúc bạn vui vẻ!`, { language: 'vi-VN' });
        return;
      }

      // Handle Groq response format
      if (command.type === 'command' && command.command) {
        console.log('📱 Navigating to Groq command:', command.command);
        navigation.navigate(command.command);
        Speech.speak(`Đã mở ${command.command}, chúc bạn vui vẻ!`, { language: 'vi-VN' });
        return;
      }

      // If command has screen property
      if (command.screen) {
        console.log('📱 Navigating with params:', command);
        navigation.navigate(command.screen, command.params || {});
        Speech.speak(`Đã mở ${command.screen}, chúc bạn vui vẻ!`, { language: 'vi-VN' });
        return;
      }

      console.warn('⚠️ Unrecognized command format:', command);
      Speech.speak('Xin lỗi, không thể thực hiện lệnh này', { language: 'vi-VN' });

    } catch (error) {
      console.error('❌ Navigation error:', error);
      Speech.speak('Xin lỗi, không thể thực hiện lệnh này', { language: 'vi-VN' });
    }
  };

  const handleVoiceCommand = async () => {
    try {
      if (isRecording) {
        console.log('📣 ==== START VOICE COMMAND FLOW ====');
        setIsRecording(false);
        setIsProcessing(true);
        Speech.speak('Đang xử lý...', { language: 'vi-VN' });
        
        // Get audio recording
        const audioUri = await VoiceControlService.stopRecording(recording);
        console.log('🎙️ Got audio recording:', audioUri);
        
        // Step 1: Get raw transcription from AssemblyAI
        const rawTranscription = await VoiceControlService.transcribeAudio(audioUri);
        console.log('📝 Raw transcription:', rawTranscription);

        if (rawTranscription) {
          // Step 2: Process through VoiceControlService which will use Groq
          const result = await VoiceControlService.processVoiceInput(rawTranscription);
          console.log('🤖 Processing result:', result);

          if (result) {
            switch (result.type) {
              case 'command':
                console.log('✅ Executing command:', result.value);
                if (customCommands) {
                  customCommands(result.value);
                } else {
                  handleNavigation(result.value);
                }
                break;

              case 'chat':
                console.log('💬 Speaking response:', result.value);
                Speech.speak(result.value, { language: 'vi-VN' });
                break;

              case 'error':
                console.error('❌ Error:', result.value);
                Speech.speak(result.value, { language: 'vi-VN' });
                break;
            }
          }
        }
      } else {
        setIsRecording(true);
        Speech.speak('Đang lắng nghe...', { language: 'vi-VN' });
        const newRecording = await VoiceControlService.startRecording();
        setRecording(newRecording);
      }
    } catch (err) {
      console.error('Voice command error:', err);
      setIsRecording(false);
      Speech.speak('Có lỗi xảy ra, vui lòng thử lại', { language: 'vi-VN' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        isRecording && styles.recording,
        isProcessing && styles.processing,
        style
      ]}
      onPress={handleVoiceCommand}
      disabled={isProcessing}
      activeOpacity={0.9}
    >
      <View style={styles.buttonOuter}>
        <LinearGradient
          colors={[isRecording ? '#ff0000' : colors.primary, isRecording ? '#ff4444' : colors.primary]}
          style={styles.gradient}
        >
          <MaterialCommunityIcons
            name="microphone"
            size={34}
            color="#fff"
          />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonOuter: {
    width: '100%',
    height: '100%',
    borderRadius: BUTTON_SIZE / 2,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    transform: [{ scale: 1.1 }],
  },
  processing: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});

export default MicroButton;
