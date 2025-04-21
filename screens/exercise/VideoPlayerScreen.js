import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Platform,
  StatusBar
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation'; // Add this import
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normalize } from '../../utils/responsive';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabBar from '../../components/navigation_bar';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const TAB_BAR_HEIGHT = 85;

const THEME = {
  primary: '#2F855A',
  error: '#E53E3E',
  success: '#48BB78',
  background: '#F7FAFC',
  text: '#1A202C',
  difficulty: {
    easy: '#48BB78',
    medium: '#ECC94B',
    hard: '#F56565'
  }
};

export default function VideoPlayerScreen({ route, navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { videoUrl, videoId, videoTitle, courseId, courseName, debug } = route.params;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const webViewRef = useRef(null);
  const [courseProgress, setCourseProgress] = useState({
    completed: 0,
    total: 0
  });
  const [videoProgress, setVideoProgress] = useState({
    watched: 0,
    duration: 0
  });
  const [headerHeight, setHeaderHeight] = useState(HEADER_HEIGHT + STATUS_BAR_HEIGHT);

  useEffect(() => {
    console.log('Video Player Params:', {
      videoUrl, videoId, videoTitle, courseId, courseName, debug
    });
  }, []);

  useEffect(() => {
    loadVideoProgress();
    loadAllVideoProgress();
  }, [videoId]);

  const loadAllVideoProgress = async () => {
    try {
      const key = `course_progress_${courseId}`;
      const savedProgress = await AsyncStorage.getItem(key);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setCourseProgress({
          completed: Object.keys(progress).length,
          total: videos.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading course progress:', error);
    }
  };

  const loadVideoProgress = async () => {
    try {
      const key = `video_progress_${videoId}`;
      const savedProgress = await AsyncStorage.getItem(key);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setVideoProgress({
          watched: Math.floor(progress.currentTime || 0),
          duration: Math.floor(progress.duration || 0)
        });
      }
    } catch (error) {
      console.error('Error loading video progress:', error);
    }
  };

  const saveVideoProgress = async (currentTime, duration) => {
    try {
      // Save individual video progress
      const videoKey = `video_progress_${videoId}`;
      const videoProgress = {
        currentTime,
        duration,
        lastUpdated: new Date().getTime()
      };
      await AsyncStorage.setItem(videoKey, JSON.stringify(videoProgress));

      // Update course progress
      const courseKey = `course_progress_${courseId}`;
      let courseProgress = {};
      const savedCourseProgress = await AsyncStorage.getItem(courseKey);
      if (savedCourseProgress) {
        courseProgress = JSON.parse(savedCourseProgress);
      }

      // Mark video as watched if more than 90% complete
      if (currentTime / duration > 0.9) {
        courseProgress[videoId] = true;
        await AsyncStorage.setItem(courseKey, JSON.stringify(courseProgress));
        
        // Update course progress state
        setCourseProgress({
          completed: Object.keys(courseProgress).length,
          total: videos.length || 0
        });
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleVideoProgress = (event) => {
    try {
      // Ensure we have valid data before accessing properties
      if (event?.nativeEvent?.data) {
        const data = JSON.parse(event.nativeEvent.data);
        if (data?.currentTime && data?.duration) {
          setVideoProgress({
            watched: Math.floor(data.currentTime),
            duration: Math.floor(data.duration)
          });
          saveVideoProgress(Math.floor(data.currentTime), Math.floor(data.duration));
        }
      }
    } catch (error) {
      console.error('Error handling video progress:', error);
    }
  };

  const getVideoEmbedUrl = (url) => {
    try {
      if (!url) throw new Error('Video URL is required');

      // Handle YouTube URLs
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop()
          : url.split('v=')[1].split('&')[0];
        // Add more parameters for better control
        return `https://www.youtube.com/embed/${videoId}?playsinline=1&fs=1&enablejsapi=1&rel=0&modestbranding=1&controls=1`;
      }
      return url;
    } catch (err) {
      console.error('Error processing video URL:', err);
      setError('Invalid video URL');
      return null;
    }
  };

  const handleFullscreen = async () => {
    try {
      const newIsFullscreen = !isFullscreen;
      
      if (newIsFullscreen) {
        // Enter fullscreen
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
        );
        setHeaderHeight(0);
        StatusBar.setHidden(true);
        // Hide navigation bar and adjust container padding
        navigation.setOptions({
          tabBarStyle: { display: 'none' }
        });
      } else {
        // Exit fullscreen
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        setHeaderHeight(HEADER_HEIGHT + STATUS_BAR_HEIGHT);
        StatusBar.setHidden(false);
        // Restore navigation bar and container padding
        navigation.setOptions({
          tabBarStyle: { 
            display: 'flex',
            height: TAB_BAR_HEIGHT 
          }
        });
      }
      
      setIsFullscreen(newIsFullscreen);
    } catch (error) {
      console.error('Error handling fullscreen:', error);
    }
  };

  // Update orientation change listener
  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      // Don't do anything here, let the manual controls handle orientation
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, [isFullscreen]);

  // Modify initial useEffect - remove default portrait lock
  useEffect(() => {
    // Only set initial orientation for cleanup purposes
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  // Add StatusBar management
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setHidden(false);
      StatusBar.setBarStyle('default');
    };
  }, []);

  const embedUrl = getVideoEmbedUrl(videoUrl);

  const renderVideoSection = () => {
    const videoSectionStyle = {
      width: isFullscreen ? '100%' : width,
      height: isFullscreen ? '100%' : width * 9/16,
      backgroundColor: '#000',
      position: 'relative',
    };

    return (
      <View style={[videoSectionStyle, isFullscreen && styles.fullscreenVideoSection]}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        )}
        {embedUrl && (
          <WebView
            ref={webViewRef}
            source={{ 
              uri: embedUrl,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/html',
              }
            }}
            style={[
              styles.videoPlayer,
              isFullscreen && { height: '100%', width: '100%' }
            ]}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setError(nativeEvent.description || 'Failed to load video');
            }}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            androidLayerType="hardware"
            scalesPageToFit={true}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'fullscreenChange') {
                  setIsFullscreen(data.isFullscreen);
                } else if (data.type === 'progress') {
                  handleVideoProgress({ 
                    nativeEvent: { 
                      data: JSON.stringify({
                        currentTime: data.currentTime,
                        duration: data.duration
                      })
                    }
                  });
                }
              } catch (error) {
                console.error('Error handling WebView message:', error);
              }
            }}
            injectedJavaScript={`
              (function() {
                const player = document.querySelector('iframe');
                
                // Add all possible fullscreen change events
                const fullscreenEvents = [
                  'fullscreenchange',
                  'webkitfullscreenchange',
                  'mozfullscreenchange',
                  'MSFullscreenChange'
                ];
                
                fullscreenEvents.forEach(eventName => {
                  document.addEventListener(eventName, function() {
                    const isFullscreen = !!(
                      document.fullscreenElement ||
                      document.webkitFullscreenElement ||
                      document.mozFullScreenElement ||
                      document.msFullscreenElement
                    );
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'fullscreenChange',
                      isFullscreen: isFullscreen
                    }));
                  });
                });

                // Existing progress tracking code
                function postProgress() {
                  try {
                    const video = document.querySelector('video');
                    if (video) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'progress',
                        currentTime: video.currentTime,
                        duration: video.duration
                      }));
                    } else if (player && player.contentWindow) {
                      player.contentWindow.postMessage(
                        JSON.stringify({ 
                          event: 'getProgress',
                          listener: 'onStateChange'
                        }), 
                        '*'
                      );
                    }
                  } catch(e) {
                    console.error('Progress tracking error:', e);
                  }
                }

                setInterval(postProgress, 1000);

                window.addEventListener('message', function(e) {
                  if (e.data && typeof e.data === 'object') {
                    const data = e.data;
                    if (data.event === 'onStateChange' && data.info) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'progress',
                        currentTime: data.info.currentTime,
                        duration: data.info.duration
                      }));
                    }
                  }
                });

                true;
              })();
            `}
          />
        )}
      </View>
    );
  };

  const renderVideoInfo = () => (
    <View style={styles.infoSection}>
      <Text style={styles.videoTitle}>{videoTitle}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="eye" size={16} color="#666" />
          <Text style={styles.statText}>2.5K views</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Text style={styles.statText}>15:30</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons 
            name="signal-cellular-2" 
            size={16} 
            color={THEME.difficulty.medium} 
          />
          <Text style={[styles.statText, { color: THEME.difficulty.medium }]}>
            Trung bình
          </Text>
        </View>
      </View>

      <View style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Mô tả</Text>
      <Text style={styles.description}>
        {route.params.description || 'Không có mô tả cho video này.'}
      </Text>

      <View style={styles.divider} />

      <TouchableOpacity 
        style={styles.videoListButton}
        onPress={() => navigation.navigate('CourseListScreen', { 
          courseId, 
          topic: route.params.topic 
        })}
      >
        <MaterialCommunityIcons 
          name="playlist-play" 
          size={24} 
          color={THEME.primary} 
        />
        <View style={styles.videoProgressInfo}>
          <Text style={styles.courseName}>Danh sách video</Text>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={24} 
          color="#666" 
        />
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={THEME.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTabPress = (routeName) => {
    switch (routeName) {
      case 'Features':
        navigation.navigate('ElderlyTabs', { screen: 'Features' });
        break;
      case 'ElderlyHome':
        navigation.navigate('ElderlyTabs', { screen: 'ElderlyHome' });
        break;
      case 'Entertainment':
        navigation.navigate('ElderlyTabs', { screen: 'Entertainment' });
        break;
      case 'Settings':
        navigation.navigate('ElderlyTabs', { screen: 'Settings' });
        break;
      default:
        navigation.navigate(routeName);
    }
  };

  return (
    <View style={[
      styles.container, 
      isFullscreen && styles.fullscreenContainer
    ]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.primary}
        hidden={isFullscreen}
      />
      {!isFullscreen && (
        <LinearGradient
          colors={[THEME.primary, THEME.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{videoTitle}</Text>
        </LinearGradient>
      )}

      <View style={[
        styles.mainContent,
        isFullscreen && styles.fullscreenMainContent
      ]}>
        {renderVideoSection()}

        <ScrollView 
          style={[
            styles.content,
            isFullscreen && { display: 'none' }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {renderVideoInfo()}
        </ScrollView>

        <TouchableOpacity 
          style={[
            styles.floatingFullscreenButton,
            isFullscreen && styles.fullscreenExitButton,
            { zIndex: isFullscreen ? 2000 : 1000 }
          ]}
          onPress={handleFullscreen}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#2F855A', '#276749']}
            style={styles.fullscreenGradient}
          >
            <MaterialCommunityIcons 
              name={isFullscreen ? "fullscreen-exit" : "fullscreen"} 
              size={28} 
              color="#FFF" 
            />
            <Text style={styles.fullscreenText}>
              {isFullscreen ? "Thu nhỏ" : "Phóng to"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {!isFullscreen && (
        <CustomTabBar 
          navigation={navigation} 
          state={{ 
            index: 2,
            routes: [
              { name: 'Features' },
              { name: 'ElderlyHome' },
              { name: 'Entertainment' },
              { name: 'Settings' }
            ] 
          }}
          onTabPress={({ route }) => handleTabPress(route.name)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  fullscreenContainer: {
    paddingBottom: 0, // Remove padding in fullscreen
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  hiddenHeader: {
    height: 0,
    padding: 0,
    margin: 0,
    overflow: 'hidden',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    flex: 1,
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 12,
  },
  moreButton: {
    padding: 8,
  },
  videoSection: {
    width: width,
    height: width * 9/16,
    backgroundColor: '#000',
    position: 'relative',
  },
  fullscreenVideoSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 16,
    paddingBottom: 100, // Thêm padding bottom
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  videoTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 12,
    marginTop: 5, // Thêm margin top
    paddingTop: 5, // Thêm padding top
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: normalize(12),
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
  },
  description: {
    fontSize: normalize(13),
    lineHeight: 20,
    color: '#4A5568',
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: `${THEME.primary}08`,
    borderRadius: 12,
    marginTop: 8,
  },
  courseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  courseName: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: THEME.text,
  },
  courseProgress: {
    fontSize: normalize(12),
    color: '#666',
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  errorText: {
    fontSize: normalize(14),
    color: THEME.error,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: THEME.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#FFF',
  },
  fullscreenVideo: {
    height: height,
  },
  fullscreenContainer: {
    backgroundColor: '#000',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  fullscreenMainContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  floatingFullscreenButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 120,
    height: 48,
    borderRadius: 24,
    elevation: 8,  // Increase elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  fullscreenGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    gap: 8,
  },

  fullscreenText: {
    color: '#FFF',
    fontSize: normalize(14),
    fontWeight: '600',
  },

  videoListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${THEME.primary}08`,
    borderRadius: 12,
    marginTop: 8,
  },
  videoProgressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  progressText: {
    fontSize: normalize(12),
    color: '#666',
    marginTop: 4,
  },
  fullscreenExitButton: {
    position: 'absolute',
    bottom: 20,  // Changed from top to bottom
    right: 20,
    zIndex: 2000,
  },
});
