import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize } from '../../utils/responsive';
import CustomTabBar from '../../components/navigation_bar'; // Add this import
import { colors } from '../../theme/colors'; // Add this import

const THEME = {
  primary: '#2F855A',
  primaryDark: colors.primaryDark, // Add this
  primaryLight: colors.primaryLight, // Add this
  difficulty: {
    easy: '#48BB78',
    medium: '#ECC94B',
    hard: '#F56565'
  },
  headerGradient: [colors.primaryDark, colors.primary, colors.primaryLight], // Update gradient colors
  success: '#48BB78',
  shadow: {
    light: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    medium: '0px 6px 16px rgba(0, 0, 0, 0.15)'
  }
};

const VideoItem = ({ video, onPress }) => {
  const thumbnailUrl = video.thumbnail_url || 
    (video.video_url?.includes('youtube.com') 
      ? `https://img.youtube.com/vi/${video.video_url.split('v=')[1]}/maxresdefault.jpg`
      : 'https://via.placeholder.com/320x180/1a1a1a/ffffff?text=No+Preview');

  return (
    <TouchableOpacity 
      style={styles.videoItem} 
      onPress={() => onPress(video)}
      activeOpacity={0.95}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.thumbnailOverlay}
        />
        <View style={styles.durationBadge}>
          <MaterialCommunityIcons name="clock-outline" size={12} color="#FFF" />
          <Text style={styles.durationText}>{video.duration || '00:00'}</Text>
        </View>
        <View style={styles.playButtonWrapper}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
            style={styles.playButtonGradient}
          >
            <MaterialCommunityIcons name="play" size={20} color="#FFF" />
          </LinearGradient>
        </View>
      </View>

      <View style={styles.videoContent}>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        
        <View style={styles.videoMetrics}>
          <View style={styles.metricGroup}>
            <MaterialCommunityIcons name="eye-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>{video.views || 0} lượt xem</Text>
            <View style={styles.metricDot} />
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>{video.duration}</Text>
          </View>
          
          {video.completed && (
            <View style={styles.completedBadge}>
              <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
              <Text style={styles.completedText}>Đã xem</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TAB_BAR_HEIGHT = 85;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;
const VIDEO_ITEM_HEIGHT = 320; // Giảm từ 600
const THUMBNAIL_HEIGHT = 180; // Giảm từ 280
const INFO_MIN_HEIGHT = 200; // Giữ nguyên
const CONTENT_SPACING = 24; // New constant for consistent spacing
const CONTENT_PADDING = 20;

export default function CourseListScreen({ route, navigation }) {
  const { courseId, topicTitle } = route.params;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);

  useEffect(() => {
    console.log('CourseListScreen mounted with courseId:', courseId); // Debug log
    if (!courseId) {
      setError('Invalid course ID');
      return;
    }
    fetchCourseVideos(courseId);
  }, [courseId]);

  async function fetchCourseVideos(id) {
    const startTime = Date.now(); // Thêm để track thời gian
    const TIMEOUT_DURATION = 15000; // 15 seconds timeout
    
    try {
      setLoading(true);
      setError(null);
      
      // Debug log
      console.log('Fetching videos for course:', {
        id: id,
        type: typeof id,
        url: `https://viegrand.site/api/video/get-course-videos.php?course_id=${id}`
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        throw new Error('Request timeout after 15 seconds');
      }, TIMEOUT_DURATION);
  
      const response = await fetch(`https://viegrand.site/api/video/get-course-videos.php?course_id=${encodeURIComponent(id)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
  
      clearTimeout(timeoutId);
  
      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);
  
      // Parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${data.error || 'Unknown error'}`);
      }
  
      if (!data || !data.data) {
        throw new Error('Invalid data format from server');
      }
  
      console.log(`API response time: ${Date.now() - startTime}ms`);
  
      setVideos(data.data);
      if (data.data.length > 0) {
        setCourseInfo({
          title: data.data[0].course_title,
          description: data.data[0].course_description,
          duration: data.data[0].duration,
          difficulty: data.data[0].difficulty
        });
      }
  
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        courseId: id
      });
      setError(error.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }

  const handleVideoPress = (video) => {
    navigation.navigate('VideoPlayer', {
      videoId: video.id,
      videoUrl: video.video_url || '',
      videoTitle: video.title || 'Untitled Video',
      courseId: courseId,
      courseName: courseInfo?.title || 'Untitled Course',
      description: video.description,
      topic: route.params?.topic
    });
  };

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
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]} // Update gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT }]}
      >
        {courseInfo && (
          <View style={styles.courseInfo}>
            <View style={styles.headerRow}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons name="chevron-left" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <View style={styles.courseTitleRow}>
                <Text style={styles.courseTitle} numberOfLines={1}>{courseInfo.title}</Text>
                <View style={[
                  styles.difficultyBadge, 
                  { backgroundColor: THEME.difficulty[courseInfo.difficulty?.toLowerCase() || 'easy'] }
                ]}>
                  <Text style={styles.difficultyText}>
                    {courseInfo.difficulty || 'Easy'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.menuButton}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.courseStats}>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="play-circle-outline" size={20} color="#FFF" />
                <Text style={styles.statText}>{videos.length} bài học</Text>
              </View>
              {courseInfo.duration && (
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#FFF" />
                  <Text style={styles.statText}>{courseInfo.duration}</Text>
                </View>
              )}
              <View style={styles.stat}>
                <MaterialCommunityIcons name="account-group-outline" size={20} color="#FFF" />
                <Text style={styles.statText}>1.2k học viên</Text>
              </View>
            </View>
          </View>
        )}
      </LinearGradient>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={THEME.primary} />
      ) : (
        <>
          <FlatList
            data={videos}
            renderItem={({ item }) => (
              <VideoItem video={item} onPress={handleVideoPress} />
            )}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.videoList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No videos found for this course.</Text>
            }
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />} // Thêm khoảng cách giữa các items
          />
          <CustomTabBar 
            navigation={navigation} 
            state={{ 
              index: 2, // Entertainment tab
              routes: [
                { name: 'Features' },
                { name: 'ElderlyHome' },
                { name: 'Entertainment' },
                { name: 'Settings' }
              ] 
            }}
            onTabPress={({ route }) => handleTabPress(route.name)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingBottom: 12, // Giảm padding bottom vì đã bớt nội dung
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4, // Giảm từ 8
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  courseInfo: {
    paddingHorizontal: 16, // Giảm từ 24
  },
  courseTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  courseTitle: {
    flex: 1,
    fontSize: normalize(16), // Giảm fontSize
    fontWeight: '600',
    color: '#FFF',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: THEME.difficulty.easy,
  },
  difficultyText: {
    color: '#FFF',
    fontSize: normalize(12),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12, // Giảm từ 16
    gap: 16, // Giảm từ 24
    marginBottom: 8, // Thêm margin bottom
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Giảm từ 10
  },
  statText: {
    color: '#FFF',
    fontSize: normalize(13), // Giảm từ 15
    fontWeight: '600',
  },
  videoItem: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  thumbnailContainer: {
    width: '100%',
    height: 160, // Giảm chiều cao thumbnail
    position: 'relative',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  playButtonWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -18 },
      { translateY: -18 }
    ],
    opacity: 0.9,
  },
  playButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: normalize(11),
    fontWeight: '500',
  },
  videoContent: {
    padding: 12,
    backgroundColor: '#FFF',
  },
  videoTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  videoMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    fontSize: normalize(12),
    color: colors.textSecondary,
  },
  metricDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 6,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: normalize(11),
    color: colors.success,
    fontWeight: '500',
  },
  videoList: {
    padding: 16,
    paddingBottom: TAB_BAR_HEIGHT + 16,
  },
  videoInfo: {
    padding: 24, // Increased from 20
    minHeight: 220, // Thêm chiều cao tối thiểu cho phần info
    backgroundColor: '#FFF',
    borderTopWidth: 0,
    paddingTop: 32, // Tăng padding top
    // Xóa marginTop và position để tránh overlap
    borderBottomLeftRadius: 24,  // Thêm border radius
    borderBottomRightRadius: 24, // Thêm border radius
  },
  videoTitle: {
    fontSize: normalize(14), // Giảm từ 15
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8, // Giảm từ 12
    lineHeight: 18, // Giảm từ 20
  },
  videoDescription: {
    fontSize: normalize(15), // Tăng từ 14
    color: '#4A5568',
    marginBottom: 20, // Tăng từ 20
    lineHeight: 24, // Tăng từ 22
    flexWrap: 'wrap', // Ensure text wraps properly
    paddingTop: 8, // Thêm padding top
  },
  videoMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20, // Tăng từ 16
    marginTop: 12, // Thêm margin top
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  metrics: {
    flexDirection: 'row',
    gap: 24, // Increased from 16
    flexWrap: 'wrap', // Allow metrics to wrap if needed
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Increased from 6
  },
  metricText: {
    fontSize: normalize(11), // Giảm từ 12
    color: colors.textSecondary,
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${THEME.success}15`,
    paddingHorizontal: 6, // Giảm từ 8
    paddingVertical: 3, // Giảm từ 4
    borderRadius: 8, // Giảm từ 12
    marginLeft: 12, // Increased from 8
  },
  completedText: {
    fontSize: normalize(12),
    color: THEME.success,
    fontWeight: '600',
  },
  videoList: {
    paddingVertical: 12, // Giảm từ 24
    paddingBottom: TAB_BAR_HEIGHT + 24, // Giảm padding bottom
    gap: 12, // Giảm từ 32
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: normalize(14),
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: normalize(14),
    marginTop: 20,
  }
});
