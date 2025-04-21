import {
  ExpoSpeechRecognitionModule, // Đây là tên module chính xác
  useSpeechRecognitionEvent,
  addSpeechRecognitionListener
} from "@jamsch/expo-speech-recognition";
import * as Speech from 'expo-speech';

export class ExpoSpeechRecognitionService {
  static listeners = [];

  static async requestPermissions() {
    try {
      const permissionResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      return permissionResult.granted;
    } catch (error) {
      console.error('Speech recognition permission error:', error);
      return false;
    }
  }

  static async startListening(options = {}) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn("Không có quyền sử dụng nhận dạng giọng nói");
        Speech.speak('Không có quyền truy cập microphone. Vui lòng cấp quyền và thử lại.', { language: 'vi-VN' });
        return false;
      }

      await ExpoSpeechRecognitionModule.start({
        lang: "vi-VN",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        ...options
      });
      return true;
    } catch (error) {
      console.error('Start listening error:', error);
      return false;
    }
  }

  static async stopListening() {
    try {
      await ExpoSpeechRecognitionModule.stop();
      return true;
    } catch (error) {
      console.error('Stop listening error:', error);
      return false;
    }
  }

  static registerListeners(handlers = {}) {
    // Remove any existing listeners
    this.removeAllListeners();

    // Add new listeners
    if (handlers.onStart) {
      this.listeners.push(addSpeechRecognitionListener("start", handlers.onStart));
    }

    if (handlers.onEnd) {
      this.listeners.push(addSpeechRecognitionListener("end", handlers.onEnd));
    }

    if (handlers.onResult) {
      this.listeners.push(addSpeechRecognitionListener("result", (event) => {
        if (event.results && event.results.length > 0) {
          handlers.onResult(event.results[0].transcript, event.isFinal);
        }
      }));
    }

    if (handlers.onError) {
      this.listeners.push(addSpeechRecognitionListener("error", handlers.onError));
    }
  }

  static removeAllListeners() {
    this.listeners.forEach(listener => listener.remove());
    this.listeners = [];
  }
}
