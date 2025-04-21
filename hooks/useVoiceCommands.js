import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { VoiceControlService } from '../services/VoiceControlService';
import { ExpoSpeechRecognitionService } from '../services/ExpoSpeechRecognitionService';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av'; // Add this import

export const useVoiceCommands = (customHandlers = {}) => {
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [finalTranscription, setFinalTranscription] = useState('');
  const [processingState, setProcessingState] = useState(null); // 'analyzing', 'executing', 'completed'
  const [speechIssueDetected, setSpeechIssueDetected] = useState(false);
  
  // UseRef để lưu trữ giá trị giữa các lần render
  const commandProcessedRef = useRef(false);
  const commandHistoryRef = useRef([]);
  const transcriptionTimeoutRef = useRef(null);
  const lastResultRef = useRef(null);

  useEffect(() => {
    // Remove automatic greeting when app opens
    // Just initialize audio system silently
    return () => {
      Speech.stop();
      // Đảm bảo dọn dẹp listeners khi component unmount
      ExpoSpeechRecognitionService.removeAllListeners();
      clearTimeout(transcriptionTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Kiểm tra hệ thống âm thanh khi khởi tạo hook
    const testAudio = async () => {
      try {
        console.log('Kiểm tra hệ thống âm thanh câm lặng...');
        
        // Đặt audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false
        });
        
        // Kiểm tra Speech API có sẵn không mà không phát âm
        const voices = await Speech.getAvailableVoicesAsync();
        console.log(`Tìm thấy ${voices.length} giọng nói, hệ thống âm thanh hoạt động tốt`);
        
        // Kiểm tra xem có giọng tiếng Việt không
        const vietnameseVoices = voices.filter(voice => 
          voice.language && (voice.language.includes('vi') || voice.language === 'vi-VN')
        );
        
        if (vietnameseVoices.length === 0) {
          console.warn('Không tìm thấy giọng đọc tiếng Việt');
          setSpeechIssueDetected(true);
        } else {
          console.log(`Tìm thấy ${vietnameseVoices.length} giọng tiếng Việt`);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra hệ thống âm thanh:', error);
        setSpeechIssueDetected(true);
      }
    };
    
    testAudio();
    
    return () => {
      Speech.stop();
      // Đảm bảo dọn dẹp listeners khi component unmount
      ExpoSpeechRecognitionService.removeAllListeners();
      clearTimeout(transcriptionTimeoutRef.current);
    };
  }, []);

  // Xử lý khi có transcription mới và final
  useEffect(() => {
    const processFinalTranscription = async () => {
      if (finalTranscription && !commandProcessedRef.current && !isProcessing) {
        commandProcessedRef.current = true;
        try {
          setProcessingState('analyzing');
          await handleCommand(finalTranscription);
        } finally {
          // Reset sau khi xử lý xong
          setFinalTranscription('');
          commandProcessedRef.current = false;
          // Sau khoảng thời gian, ẩn trạng thái xử lý
          setTimeout(() => {
            setProcessingState(null);
          }, 3000);
        }
      }
    };

    processFinalTranscription();
  }, [finalTranscription, isProcessing]);

  // Xử lý các yêu cầu từ người dùng
  const handleCommand = useCallback(async (command) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setProcessingState('analyzing');
      
      console.log('🎯 Xử lý lệnh giọng nói:', command);
      
      // Thêm vào lịch sử
      commandHistoryRef.current = [
        ...commandHistoryRef.current.slice(-9),
        { command, timestamp: Date.now() }
      ];

      // Advanced command pattern detection
      let commandPatterns = {
        videoSearch: /tìm (kiếm)?\s*(video|phim)\s*(về|cho|liên quan đến)?\s*(.*)/i,
        openScreen: /(mở|vào|đi đến|xem|hiển thị)\s+(.*)/i,
        askWeather: /(thời tiết|nhiệt độ|có mưa|có nắng)/i,
        askTime: /(mấy giờ|ngày mấy|thứ mấy|ngày tháng)/i,
        generalQuestion: /(thế nào|là gì|tại sao|như thế nào|bao giờ|tôi nên|có nên)/i
      };

      // Check for video search patterns first
      let videoSearchMatch = command.match(commandPatterns.videoSearch);
      if (videoSearchMatch && videoSearchMatch[4]) {
        const searchQuery = videoSearchMatch[4].trim();
        if (searchQuery) {
          console.log('🔍 Tìm kiếm video:', searchQuery);
          
          // Call to VideoService would go here
          VoiceControlService.speak(`Đang tìm kiếm video về ${searchQuery}`);
          
          // Simulate video search result
          setTimeout(() => {
            setProcessingState('completed');
            setIsProcessing(false);
          }, 2000);
          
          return;
        }
      }

      // Check for time/date questions
      if (commandPatterns.askTime.test(command)) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN');
        const dateString = now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const response = `Bây giờ là ${timeString}, ${dateString}`;
        VoiceControlService.speak(response);
        
        setTimeout(() => {
          setProcessingState('completed');
          setIsProcessing(false);
        }, 1000);
        
        return;
      }

      // Xử lý lệnh
      const result = await VoiceControlService.handleAssistantResponse(command);
      lastResultRef.current = result;
      
      if (result) {
        console.log('🧩 Kết quả xử lý:', result);
        
        setProcessingState('executing');
        
        if (result.type === 'command') {
          const navCommand = result.value;
          if (customHandlers[navCommand.screen]) {
            console.log('🔄 Chuyển hướng tùy chỉnh:', navCommand.screen);
            customHandlers[navCommand.screen](navCommand.params);
            
            // Phát âm nếu chưa phát
            if (!result.spoken) {
              VoiceControlService.speak(`Đã mở ${navCommand.screen}, chúc bạn vui vẻ!`);
            }
          } else {
            console.log('🔄 Chuyển hướng:', navCommand.screen);
            navigation.navigate(navCommand.screen, navCommand.params);
            
            // Phát âm nếu chưa phát
            if (!result.spoken) {
              VoiceControlService.speak(`Đã mở ${navCommand.screen}, chúc bạn vui vẻ!`);
            }
          }
        } else if (result.response && !result.spoken) {
          // Generate more contextual responses based on command history
          let contextualResponse = result.response;
          
          // Check if we've had similar commands recently
          const recentCommands = commandHistoryRef.current
            .slice(-3)
            .filter(item => item.command !== command);
            
          if (recentCommands.length > 0) {
            // If user is asking something similar to recent commands, add context
            const similarityThreshold = 0.6;
            const mostSimilarCommand = recentCommands.find(item => {
              // Simple similarity check based on common words
              const words1 = item.command.toLowerCase().split(' ');
              const words2 = command.toLowerCase().split(' ');
              const commonWords = words1.filter(word => words2.includes(word));
              return commonWords.length / Math.max(words1.length, words2.length) > similarityThreshold;
            });
            
            if (mostSimilarCommand) {
              contextualResponse = `Như tôi đã đề cập, ${result.response.toLowerCase()}`;
            }
          }
          
          // Phát âm phản hồi nếu chưa phát
          VoiceControlService.speak(contextualResponse);
        }
        
        setProcessingState('completed');
      }

      return true;
    } catch (error) {
      console.error('❌ Error handling voice command:', error);
      VoiceControlService.speak('Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.');
      setProcessingState(null);
      return false;
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProcessingState(null);
      }, 3000);
    }
  }, [navigation, customHandlers, isProcessing]);

  // Enhanced speech recognition with better error handling
  const startListening = useCallback(async () => {
    try {
      clearTimeout(transcriptionTimeoutRef.current);
      setIsListening(true);
      setTranscription('');
      
      // Use shorter listening prompt for better UX
      Speech.speak('Đang lắng nghe...', { 
        language: 'vi-VN',
        rate: 0.9,
        pitch: 1.0
      });
      
      // Improved listener registration with better error handling
      ExpoSpeechRecognitionService.registerListeners({
        onStart: () => {
          console.log('🎤 Speech recognition started');
        },
        onEnd: () => {
          console.log('🎤 Speech recognition ended');
          // Keep listening state active briefly for visual feedback
          transcriptionTimeoutRef.current = setTimeout(() => {
            setIsListening(false);
            setTranscription('');
          }, 1000);
        },
        onResult: (transcript, isFinal) => {
          // Console.log but only when final result or significant intermediate
          if (isFinal || transcript.length > 5) {
            console.log(`📝 Transcript: ${transcript}, isFinal: ${isFinal}`);
          }
          
          // Enhanced text filtering
          const filterPatterns = [
            /đang lắng nghe|vui lòng/gi, // Common prefixes  
            /xin chào trợ lý|hey siri|hey google/gi, // Other assistant triggers
            /^(à|ừm|ờ|ơ|ê)\s*/gi, // Vietnamese filler words at start
            /\s+(à|ừm|ờ|ơ|ê)$/gi // Vietnamese filler words at end
          ];
          
          let cleanedTranscript = transcript;
          filterPatterns.forEach(pattern => {
            cleanedTranscript = cleanedTranscript.replace(pattern, '');
          });
          cleanedTranscript = cleanedTranscript.trim();
          
          if (cleanedTranscript) {
            setTranscription(cleanedTranscript);
            
            if (isFinal) {
              // Apply additional analysis for better command recognition
              // Vietnamese accents can be lost in speech recognition
              const normalizedTranscript = normalizeVietnameseText(cleanedTranscript);
              setFinalTranscription(normalizedTranscript);
              setTranscription('');
            }
          }
        },
        onError: (error) => {
          console.error('🎤 Speech recognition error:', error);
          Speech.speak('Không thể nhận diện giọng nói. Vui lòng thử lại.', { 
            language: 'vi-VN'
          });
          setIsListening(false);
          setTranscription('');
        }
      });

      // Start speech recognition with improved settings
      const started = await ExpoSpeechRecognitionService.startListening({
        lang: "vi-VN",
        interimResults: true,
        continuous: false,
        maxAlternatives: 3 // Get multiple alternatives for better recognition
      });
      
      if (!started) {
        setIsListening(false);
        Speech.speak('Không thể bắt đầu nhận diện giọng nói.', { language: 'vi-VN' });
      }
    } catch (error) {
      console.error('❌ Voice command error:', error);
      setIsListening(false);
      Speech.speak('Có lỗi xảy ra, vui lòng thử lại', { language: 'vi-VN' });
    }
  }, []);

  // Helper function to normalize Vietnamese text with missing accents
  const normalizeVietnameseText = (text) => {
    // Common recognition errors in Vietnamese
    const vietnameseCorrections = {
      'truyen': 'truyện',
      'video': 'video',
      'bai tap': 'bài tập',
      'the duc': 'thể dục',
      'mo': 'mở',
      'tim kiem': 'tìm kiếm',
      'game': 'game',
      'tro choi': 'trò chơi'
    };
    
    let result = text.toLowerCase();
    Object.entries(vietnameseCorrections).forEach(([incorrect, correct]) => {
      const pattern = new RegExp(`\\b${incorrect}\\b`, 'gi');
      result = result.replace(pattern, correct);
    });
    
    return result;
  };

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionService.stopListening();
    clearTimeout(transcriptionTimeoutRef.current);
    setIsListening(false);
    setTranscription('');
  }, []);

  // Phương thức kiểm tra xem yêu cầu cuối cùng có thuộc loại nhất định không
  const wasLastCommandType = useCallback((type) => {
    return lastResultRef.current?.type === type;
  }, []);

  // Phương thức speak cải tiến
  const speakWithRetry = useCallback(async (text, options = {}) => {
    // Sử dụng VoiceControlService để đảm bảo nhất quán
    return VoiceControlService.speak(text, options);
  }, []);

  return { 
    handleCommand,
    isProcessing,
    speak: speakWithRetry,
    isListening,
    startListening,
    stopListening,
    transcription,
    finalTranscription,
    processingState,
    commandHistory: commandHistoryRef.current,
    wasLastCommandType,
    speechIssueDetected
  };
};
