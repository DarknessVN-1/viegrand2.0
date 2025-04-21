import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { VoiceControlService } from '../services/VoiceControlService';
import { ExpoSpeechRecognitionService } from '../services/ExpoSpeechRecognitionService';
import { VideoService } from '../services/VideoService';
import { Audio } from 'expo-av'; 

const VoiceCommandContext = createContext();

export const VoiceCommandProvider = ({ children }) => {
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [finalTranscription, setFinalTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState(null); // 'analyzing', 'executing', 'completed'
  const [commandResult, setCommandResult] = useState(null);
  const [mediaControls, setMediaControls] = useState({
    isPlaying: false,
    isMuted: false,
    volume: 1,
  });
  const [isAudioWorking, setIsAudioWorking] = useState(true);
  
  // UseRef để lưu trữ giá trị giữa các lần render
  const commandProcessedRef = useRef(false);
  const commandHistoryRef = useRef([]);
  const transcriptionTimeoutRef = useRef(null);
  const lastResultRef = useRef(null);
  
  // Danh sách custom handlers cho các màn hình quan trọng
  const customHandlers = {
    // Màn hình chính
    ElderlyHome: () => navigation.navigate('ElderlyTabs', { screen: 'ElderlyHome' }),
    RelativeHome: () => navigation.navigate('RelativeTabs', { screen: 'RelativeHome' }),
    
    // Màn hình giải trí
    Entertainment: () => navigation.navigate('Entertainment'),
    Video: () => navigation.navigate('Video'),
    Truyện: () => navigation.navigate('Truyện'),
    MiniGame: () => navigation.navigate('MiniGame'),
    RadioScreen: () => navigation.navigate('RadioScreen'),
    ExerciseSelection: () => navigation.navigate('ExerciseSelection'),
    
    // Games
    Sudoku: () => navigation.navigate('Sudoku'),
    MemoryCard: () => navigation.navigate('MemoryCard'),
    NumberPuzzle: () => navigation.navigate('NumberPuzzle'),
    
    // Tính năng khác
    Settings: () => navigation.navigate('Settings'),
    Medication: () => navigation.navigate('Medication'),
  };

  // Removed welcome message
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Set up audio system silently without speaking
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false
        });
        console.log('App started - Voice system initialized silently');
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };
    
    setupAudio();
    
    return () => {
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
            setCommandResult(null);
          }, 3000);
        }
      }
    };

    processFinalTranscription();
  }, [finalTranscription, isProcessing]);

  // Xử lý tìm kiếm video
  const handleVideoSearch = useCallback(async (query) => {
    setProcessingState('executing');
    setCommandResult(`Đang tìm kiếm video "${query}"...`);
    
    try {
      const results = await VideoService.searchVideos(query);
      if (results && results.length > 0) {
        const responseText = `Đã tìm thấy ${results.length} video về "${query}"`;
        setCommandResult(responseText);
        // Phát âm kết quả tìm kiếm
        VoiceControlService.speak(responseText);
        // Điều hướng đến màn hình kết quả tìm kiếm
        navigation.navigate('Video', { searchResults: results, searchQuery: query });
      } else {
        const responseText = `Không tìm thấy video nào về "${query}"`;
        setCommandResult(responseText);
        // Phát âm khi không tìm thấy kết quả
        VoiceControlService.speak(responseText);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      const errorMessage = 'Có lỗi xảy ra khi tìm kiếm video';
      setCommandResult(errorMessage);
      // Phát âm thông báo lỗi
      VoiceControlService.speak(errorMessage);
    } finally {
      setProcessingState('completed');
    }
  }, [navigation]);

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
      
      // Kiểm tra các lệnh tìm kiếm video
      if (command.includes('tìm video') || command.includes('tìm kiếm video')) {
        const query = command.replace(/tìm (kiếm)?\s*video\s*/i, '').trim();
        if (query) {
          await handleVideoSearch(query);
          setIsProcessing(false);
          return;
        }
      }

      // Xử lý lệnh chính
      const result = await VoiceControlService.handleAssistantResponse(command);
      lastResultRef.current = result;
      
      if (result) {
        console.log('🧩 Kết quả xử lý:', result);
        
        setProcessingState('executing');
        
        if (result.type === 'command') {
          // FIX: Ensure we have a properly formatted navigation object
          let navCommand;
          
          if (typeof result.value === 'string') {
            // If value is a string, convert it to an object with screen property
            navCommand = { screen: result.value };
          } else if (typeof result.value === 'object' && result.value !== null) {
            // If value is already an object, use it directly
            navCommand = result.value;
          } else {
            // Fallback if value is unexpected
            throw new Error('Invalid navigation command format');
          }
          
          console.log('🔄 Formatted navigation command:', navCommand);
          
          if (customHandlers[navCommand.screen]) {
            console.log('🔄 Chuyển hướng tùy chỉnh:', navCommand.screen);
            customHandlers[navCommand.screen](navCommand.params);
            
            // Phát âm nếu chưa phát
            if (!result.spoken) {
              VoiceControlService.speak(`Đang mở ${navCommand.screen}`);
            }
          } else {
            try {
              console.log('🔄 Chuyển hướng:', navCommand.screen);
              // Use proper navigation format
              navigation.navigate(navCommand.screen, navCommand.params);
              
              // Phát âm nếu chưa phát
              if (!result.spoken) {
                VoiceControlService.speak(`Đang mở ${navCommand.screen}`);
              }
            } catch (navError) {
              console.error('❌ Navigation error:', navError);
              setCommandResult('Không thể mở màn hình này. Vui lòng thử lại.');
              VoiceControlService.speak('Không thể mở màn hình này. Vui lòng thử lại.');
            }
          }
        } else if (result.response) {
          // Hiển thị kết quả phản hồi
          setCommandResult(result.response);
          
          // Đảm bảo phản hồi được phát âm nếu chưa được phát
          if (!result.spoken) {
            VoiceControlService.speak(result.response);
          }
        }
        
        setProcessingState('completed');
      } else {
        // Add a fallback response when no result is returned
        const fallbackResponse = 'Xin lỗi, tôi không hiểu yêu cầu đó. Hãy thử cách khác.';
        setCommandResult(fallbackResponse);
        VoiceControlService.speak(fallbackResponse);
        setProcessingState('completed');
      }

      return true;
    } catch (error) {
      console.error('❌ Error handling voice command:', error);
      const errorMessage = 'Xin lỗi, tôi không hiểu. Hãy thử diễn đạt khác.';
      VoiceControlService.speak(errorMessage);
      setCommandResult(errorMessage);
      setProcessingState('completed');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [navigation, customHandlers, isProcessing]);

  // Bắt đầu lắng nghe giọng nói
  const startListening = useCallback(async () => {
    try {
      clearTimeout(transcriptionTimeoutRef.current);
      setIsListening(true);
      setTranscription('');
      // Phát âm thông báo bắt đầu lắng nghe
      VoiceControlService.speak('Đang lắng nghe...', { rate: 0.9 });
      
      // Đăng ký các listener để nhận kết quả
      ExpoSpeechRecognitionService.registerListeners({
        onStart: () => {
          console.log('Speech recognition started');
        },
        onEnd: () => {
          console.log('Speech recognition ended');
          // Đảm bảo trạng thái được cập nhật sau một khoảng thời gian
          transcriptionTimeoutRef.current = setTimeout(() => {
            setIsListening(false);
            setTranscription('');
          }, 1000);
        },
        onResult: (transcript, isFinal) => {
          console.log(`Transcript: ${transcript}, isFinal: ${isFinal}`);
          // Lọc các text không mong muốn
          const cleanedTranscript = transcript
            .replace(/đang lắng nghe|vui lòng/gi, '')
            .trim();
          
          if (cleanedTranscript) {
            setTranscription(cleanedTranscript);
            
            if (isFinal) {
              setFinalTranscription(cleanedTranscript);
              setTranscription('');
            }
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          setTranscription('');
        }
      });

      // Bắt đầu nhận dạng giọng nói
      const started = await ExpoSpeechRecognitionService.startListening({
        lang: "vi-VN",
        interimResults: true,
        continuous: false
      });
      
      if (!started) {
        setIsListening(false);
      }
    } catch (error) {
      console.error('Voice command error:', error);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionService.stopListening();
    clearTimeout(transcriptionTimeoutRef.current);
    setIsListening(false);
    setTranscription('');
  }, []);

  // Thêm phương thức để thử lại phát âm nếu có vấn đề - loại bỏ hoặc làm nó không làm gì cả
  const retrySpeech = useCallback(async (text) => {
    console.log('🔇 TTS disabled, text not spoken:', text);
    return false;
  }, []);

  // Thay đổi phương thức speak để sử dụng VoiceControlService
  const speak = useCallback((text, options = {}) => {
    return VoiceControlService.speak(text, options);
  }, []);

  const updateMediaControls = useCallback((updates) => {
    setMediaControls(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Thêm isAudioWorking và retrySpeech vào value context
  const value = {
    isListening,
    transcription,
    processingState,
    commandResult,
    mediaControls,
    startListening,
    stopListening,
    handleCommand,
    speak,
    retrySpeech,
    isAudioWorking,
    updateMediaControls,
    commandHistory: commandHistoryRef.current
  };

  return (
    <VoiceCommandContext.Provider value={value}>
      {children}
    </VoiceCommandContext.Provider>
  );
};

export const useVoiceCommand = () => useContext(VoiceCommandContext);
