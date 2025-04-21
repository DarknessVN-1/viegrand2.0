import { Platform } from 'react-native';
import { Audio } from 'expo-av';

// Simple placeholder service until dependencies are installed
class HotwordDetectionService {
  constructor() {
    this.isInitialized = false;
    this.isListening = false;
    this.onHotwordDetected = null;
    this.onError = null;
  }
  
  async init(options = {}) {
    // Store callbacks
    this.onHotwordDetected = options.onHotwordDetected;
    this.onError = options.onError;
    
    console.log('⚠️ Hotword detection requires additional dependencies');
    console.log('📦 Required packages:');
    console.log('   - @picovoice/porcupine-react-native');
    console.log('   - @picovoice/react-native-voice-processor');
    
    // Don't trigger error callback, just log the warning
    // Instead of throwing an error, just return false
    
    return false;
  }
  
  async start() {
    console.log('⚠️ Hotword detection not available - missing dependencies');
    return false;
  }
  
  async stop() {
    this.isListening = false;
    return true;
  }
  
  pauseDetection() {
    // Placeholder
  }
  
  resumeDetection() {
    // Placeholder
  }
  
  async release() {
    this.isInitialized = false;
    this.isListening = false;
    return true;
  }
}

export default new HotwordDetectionService();
