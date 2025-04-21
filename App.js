import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox, StyleSheet, View } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceCommandProvider } from './context/VoiceCommandContext';
import AppNavigator from './navigation/AppNavigator';
import VoiceCommandOverlay from './components/VoiceCommandOverlay';
import { useVoiceCommand } from './context/VoiceCommandContext';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { SettingsProvider } from './context/SettingsContext';

// Import the mock notifications service
import { notificationService } from './services/notificationService';

// Bỏ qua các cảnh báo không cần thiết
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Warning: Cannot update a component (`NativeStackNavigator`) while rendering a different component',
]);

// Component để hiển thị overlay giọng nói
const VoiceOverlayWrapper = () => {
  const { 
    isListening, 
    transcription, 
    processingState, 
    commandResult 
  } = useVoiceCommand();

  return (
    <VoiceCommandOverlay 
      isVisible={true}
      isListening={isListening}
      transcription={transcription}
      processingState={processingState}
      commandResult={commandResult}
    />
  );
};

// Cải tiến hàm kiểm tra phát âm - disable all speech
const checkSpeechCapability = async () => {
  try {
    console.log('Testing speech synthesis silently...');
    
    // Kiểm tra các voices có sẵn
    const availableVoices = await Speech.getAvailableVoicesAsync();
    console.log('Available voices:', availableVoices.length);
    
    // Tìm giọng tiếng Việt
    const vietnameseVoices = availableVoices.filter(voice => 
      voice.language && voice.language.includes('vi')
    );
    console.log('Vietnamese voices:', vietnameseVoices.length);
    
    // DO NOT speak anything on app start
    // All commented code remains commented
    
  } catch (error) {
    console.error('Speech synthesis test error:', error);
  }
};

export default function App() {
  const navigationRef = useRef();

  // Gọi kiểm tra phát âm khi app khởi động với độ trễ
  useEffect(() => {
    const timer = setTimeout(checkSpeechCapability, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <NavigationContainer ref={navigationRef}>
              <VoiceCommandProvider>
                <StatusBar style="dark" />
                <View style={styles.container}>
                  <AppNavigator />
                  <VoiceOverlayWrapper />
                </View>
              </VoiceCommandProvider>
            </NavigationContainer>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
