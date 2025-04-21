import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize } from '../../utils/responsive';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash/debounce';
import { checkBlockedContent } from '../../utils/blockKeywords';
import MicroButton from '../../components/MicroButton'; // Add this import
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

const { width } = Dimensions.get('window');
const YOUTUBE_API_KEY = 'AIzaSyA7s3k07ODsYZTSWGY4YQj_MANaFUsTgqk'; // Thêm API key của bạn

const CATEGORIES = {
  exercise: {
    title: 'Thể dục',
    icon: 'run',
    color: '#48BB78'
  },
  health: {
    title: 'Sức khỏe',
    icon: 'heart-pulse',
    color: '#E53E3E'
  },
  entertainment: {
    title: 'Giải trí',
    icon: 'music',
    color: '#9F7AEA'
  },
  learning: {
    title: 'Học tập',
    icon: 'book-open-page-variant',
    color: '#4299E1'
  },
  cooking: {
    title: 'Nấu ăn',
    icon: 'pot-steam',
    color: '#ED8936'
  }
};

const VideoScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchAnimValue = useRef(new Animated.Value(0)).current;
  const playerRef = useRef(null);
  const flatListRef = useRef(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const lastPlayedTime = useRef(0);
  const [playerState, setPlayerState] = useState(null);
  const hasPlayerReady = useRef(false);
  const readyTimeout = useRef(null);
  const loadingTimeout = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsPortrait(window.height > window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Thêm useEffect để cleanup timeouts
  useEffect(() => {
    return () => {
      if (readyTimeout.current) clearTimeout(readyTimeout.current);
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    };
  }, []);

  const fetchVideos = async (category = null) => {
    try {
      setLoading(true);
      const url = category 
        ? `https://viegrand.site/api/video/video.php?category=${category}`
        : 'https://viegrand.site/api/video/video.php';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      // Debug log for development
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      try {
        const data = JSON.parse(responseText);
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch videos');
        }
        
        if (data.items && data.items.length > 0) {
          setVideos(data.items);
          setSelectedVideo(data.items[0]);
        } else {
          throw new Error('No videos available');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể tải video. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

// Thêm danh sách từ khóa nhạy cảm chi tiết
const SENSITIVE_KEYWORDS = {
  adult: [
    'sex', 'khiêu dâm', 'erotic', 'người lớn', '18+', 'sexy', 
    'nude', 'khỏa thân', 'bikini', 'dating'
  ],
  violence: [
    'bạo lực', 'violence', 'blood', 'máu me', 'giết', 'đánh nhau',
    'kill', 'murder', 'fight', 'war', 'chiến tranh'
  ],
  gambling: [
    'cờ bạc', 'gambling', 'casino', 'poker', 'slot', 'bet', 'cá độ',
    'số đề', 'lô đề'
  ],
  drugs: [
    'ma túy', 'drugs', 'cocaine', 'heroin', 'cần sa', 'thuốc lắc',
    'hút', 'chích'
  ],
  harmful: [
    'tự tử', 'suicide', 'giết người', 'tự hại', 'tự sát',
    'toxic', 'độc hại', 'nguy hiểm'
  ]
};

// Cập nhật hàm searchYouTubeVideos
const searchYouTubeVideos = async (query) => {
  if (!query.trim()) return;

  // Kiểm tra từ khóa nhạy cảm
  const hasSensitiveContent = Object.values(SENSITIVE_KEYWORDS).some(category =>
    category.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  if (hasSensitiveContent) {
    setError('Nội dung tìm kiếm không phù hợp. Vui lòng thử từ khóa khác.');
    setSearchResults([]);
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    // Thêm bộ lọc an toàn và tối ưu cho người cao tuổi
    const safeQuery = `${query} phù hợp người cao tuổi`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet` +
      `&maxResults=25` +
      `&q=${encodeURIComponent(safeQuery)}` +
      `&type=video` +
      `&key=${YOUTUBE_API_KEY}` +
      `&regionCode=VN` +
      `&relevanceLanguage=vi` +
      `&safeSearch=strict` +
      `&videoEmbeddable=true` +
      `&videoSyndicated=true`
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.error('YouTube API error:', data.error);
      throw new Error(data.error.message);
    }
    
    if (data.items && data.items.length > 0) {
      const formattedResults = data.items.map(item => ({
        ...item,
        id: typeof item.id === 'string' ? { videoId: item.id } : item.id
      }));
      setSearchResults(formattedResults);
    } else {
      setSearchResults([]);
    }
  } catch (error) {
    console.error('Search error:', error);
    setError('Không thể tìm kiếm video. Vui lòng thử lại sau.');
    setSearchResults([]);
  } finally {
    setLoading(false);
  }
};

  // Debounce search function
  const debouncedSearch = useCallback(
    debounce((query) => searchYouTubeVideos(query), 500),
    []
  );

// Cập nhật hàm handleSearch
const handleSearch = (text) => {
  setSearchQuery(text);
  
  // Kiểm tra từ khóa nhạy cảm
  const hasSensitiveContent = Object.values(SENSITIVE_KEYWORDS).some(category =>
    category.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  if (hasSensitiveContent) {
    setError('Từ khóa tìm kiếm không phù hợp');
    setSearchSuggestions([]);
    return;
  }

  // Nếu từ khóa an toàn, tạo gợi ý tìm kiếm phù hợp người cao tuổi
  if (text.trim()) {
    const suggestions = [
      `Nhạc dân ca ${text}`,
      `Bài tập thể dục ${text}`,
      `Hướng dẫn nấu ăn ${text}`,
      `Tin tức ${text}`,
      `Giải trí ${text}`
    ].filter(suggestion => !Object.values(SENSITIVE_KEYWORDS).some(category =>
      category.some(keyword => 
        suggestion.toLowerCase().includes(keyword.toLowerCase())
      )
    ));
    setSearchSuggestions(suggestions);
  } else {
    setSearchSuggestions([]);
  }

  if (!text.trim()) {
    setShowSearchResults(false);
  }
};

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true); // Thêm dòng này
      searchYouTubeVideos(searchQuery);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSearchResults(true);
    searchYouTubeVideos(suggestion);
  };

  const toggleFavorite = async (video) => {
    try {
      const newFavorites = favorites.some(fav => fav.id.videoId === video.id.videoId)
        ? favorites.filter(fav => fav.id.videoId !== video.id.videoId)
        : [...favorites, video];
      setFavorites(newFavorites);
      await AsyncStorage.setItem('videoFavorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = await AsyncStorage.getItem('videoFavorites');
        if (saved) setFavorites(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  const animateSearch = (show) => {
    Animated.timing(searchAnimValue, {
      toValue: show ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchFocus = () => {
    setIsSearchActive(true);
    animateSearch(true);
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    setShowSearchResults(false);
    animateSearch(false);
  };

  const renderHeader = () => (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
      >
        {Object.entries(CATEGORIES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.categoryButton,
              selectedCategory === key && { backgroundColor: value.color }
            ]}
            onPress={() => {
              setSelectedCategory(key);
              fetchVideos(key);
            }}
          >
            <MaterialCommunityIcons 
              name={value.icon} 
              size={20} 
              color={selectedCategory === key ? '#FFF' : value.color} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === key && { color: '#FFF' }
            ]}>
              {value.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TouchableOpacity 
        style={styles.searchBarWrapper}
        onPress={handleSearchFocus}
      >
        <MaterialCommunityIcons name="magnify" size={22} color="#718096" />
        <Text style={styles.searchPlaceholder}>Tìm kiếm video...</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlaybackControls = () => (
    <View style={styles.playbackControls}>
      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => setPlaybackSpeed(speed => Math.max(0.5, speed - 0.25))}
      >
        <MaterialCommunityIcons name="rewind" size={28} color="#2F855A" />
        <Text style={styles.controlText}>Chậm hơn</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => setIsPlaying(!isPlaying)}
      >
        <MaterialCommunityIcons 
          name={isPlaying ? "pause" : "play"} 
          size={28} 
          color="#2F855A" 
        />
        <Text style={styles.controlText}>
          {isPlaying ? "Tạm dừng" : "Phát"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => setIsFullscreen(!isFullscreen)}
      >
        <MaterialCommunityIcons 
          name={isFullscreen ? "fullscreen-exit" : "fullscreen"} 
          size={28} 
          color="#2F855A" 
        />
        <Text style={styles.controlText}>
          {isFullscreen ? "Thu nhỏ" : "Phóng to"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => setPlaybackSpeed(speed => Math.min(2, speed + 0.25))}
      >
        <MaterialCommunityIcons name="fast-forward" size={28} color="#2F855A" />
        <Text style={styles.controlText}>Nhanh hơn</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => setSelectedVideo(item)}
    >
      <Image
        style={styles.thumbnail}
        source={{ uri: item.snippet.thumbnails.medium.url }}
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.snippet.title}
        </Text>
        <Text style={styles.channelTitle}>{item.snippet.channelTitle}</Text>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
        >
          <MaterialCommunityIcons 
            name={favorites.some(fav => fav.id.videoId === item.id.videoId) ? "heart" : "heart-outline"}
            size={24} 
            color="#E53E3E" 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSearchSuggestions = () => {
    if (!searchQuery.trim() || !searchSuggestions.length) return null;

    return (
      <View style={styles.suggestionsContainer}>
        {searchSuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionItem}
            onPress={() => {
              setSearchQuery(suggestion);
              searchYouTubeVideos(suggestion);
            }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color="#718096" />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSearchScreen = () => (
    <SafeAreaView style={styles.searchScreenContainer}>
      <View style={styles.searchScreen}>
        <View style={styles.searchHeader}>
          <TouchableOpacity
            style={styles.searchBackButton}
            onPress={handleSearchClose}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A202C" />
          </TouchableOpacity>
          <View style={styles.searchBarContainer}>
            <Searchbar
              placeholder="Tìm kiếm video..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBarActive}
              inputStyle={styles.searchInput}
              iconColor="#666"
              autoFocus
              onSubmitEditing={handleSearchSubmit}
              onIconPress={handleSearchSubmit}
            />
          </View>
        </View>

        {searchQuery.trim() && !showSearchResults ? (
          // Hiển thị gợi ý khi đang gõ và chưa bấm tìm
          <View style={styles.suggestionsWrapper}>
            <ScrollView style={styles.suggestionsScroll}>
              {searchSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <MaterialCommunityIcons 
                    name="magnify" 
                    size={20} 
                    color="#718096" 
                    style={styles.suggestionIcon}
                  />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          // Hiển thị kết quả tìm kiếm
          <View style={styles.searchResultsContainer}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2F855A" />
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={40} 
                  color="#E53E3E" 
                />
                <Text style={[styles.errorText, styles.errorMessage]}>
                  {error}
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.searchResultItem}
                    onPress={() => {
                      setSelectedVideo(item);
                      handleSearchClose();
                    }}
                  >
                    <View style={styles.searchThumbnailContainer}>
                      <Image
                        style={[
                          styles.searchThumbnail,
                          !item.snippet?.thumbnails?.medium?.url && styles.searchThumbnailPlaceholder
                        ]}
                        source={
                          item.snippet?.thumbnails?.medium?.url
                            ? { uri: item.snippet.thumbnails.medium.url }
                            : { uri: 'https://via.placeholder.com/120x68/E2E8F0/A0AEC0?text=No+Image' }
                        }
                        onError={(e) => {
                          console.log('Image loading error:', e.nativeEvent.error);
                        }}
                      />
                    </View>
                    <View style={styles.searchVideoInfo}>
                      <Text style={styles.searchVideoTitle} numberOfLines={2}>
                        {item.snippet?.title || 'Không có tiêu đề'}
                      </Text>
                      <View style={styles.searchMeta}>
                        <Text style={styles.searchChannelTitle}>
                          {item.snippet?.channelTitle || 'Không có tên kênh'}
                        </Text>
                        <Text style={styles.searchViews}>• 500 lượt xem</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id?.videoId || item.etag || Math.random().toString()}
                contentContainerStyle={styles.searchResults}
                ListEmptyComponent={() => (
                  <View style={styles.emptySearch}>
                    <Text style={styles.emptyText}>
                      {searchQuery.trim() ? 'Không tìm thấy kết quả phù hợp' : 'Nhập từ khóa để tìm kiếm'}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );

const handleVideoSelect = async (video) => {
  try {
    setIsLoadingVideo(true);
    setSelectedVideo(video);
    setIsPlayerReady(false);
    setIsPlaying(false);
    
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ 
        offset: 0, 
        animated: true 
      });
    }

    // Đợi UI cập nhật
    await new Promise(resolve => setTimeout(resolve, 300));

  } catch (error) {
    console.error('Error changing video:', error);
  } finally {
    setIsLoadingVideo(false);
  }
};

const handleVideoStateChange = () => {
  // ...existing code...
};

const renderVideoPlayer = () => (
  <View style={styles.playerWrapper}>
    {isLoadingVideo ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    ) : (
      <>
        <YoutubePlayer
          ref={playerRef}
          height={isPortrait ? width * 0.5625 : '100%'} 
          width={isPortrait ? '100%' : '100%'}
          videoId={selectedVideo?.id?.videoId}
          play={isPlaying && isPlayerReady}
          onError={(e) => {
            console.error('Player error:', e);
            setIsPlaying(false);
            setIsPlayerReady(false);
          }}
          playbackRate={playbackSpeed}
          onReady={() => setIsPlayerReady(true)}
          onChangeState={handleVideoStateChange}
          initialPlayerParams={{
            preventFullScreen: true,
            controls: true,
            modestbranding: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
            origin: 'https://www.youtube.com'
          }}
        />
        <View style={styles.playerOverlay}>
          <View style={styles.playerControls}>
            <TouchableOpacity 
              style={[
                styles.controlBtn,
                (!isPlayerReady || playerState === 'buffering') && styles.controlBtnDisabled
              ]}
              onPress={() => {
                if (isPlayerReady && playerState !== 'buffering') {
                  setIsPlaying(!isPlaying);
                }
              }}
              disabled={!isPlayerReady || playerState === 'buffering'}
            >
              <MaterialCommunityIcons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color={(!isPlayerReady || playerState === 'buffering') ? "#666" : "#FFF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </>
    )}
  </View>
);

  const renderVideoInfo = () => (
    <View style={styles.videoInfoContainer}>
      <Text style={styles.videoTitle}>
        {selectedVideo.snippet.title}
      </Text>
      
      <View style={styles.videoStats}>
        <Text style={styles.viewCount}>500 lượt xem</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="thumb-up-outline" size={24} color="#606060" />
            <Text style={styles.actionText}>Thích</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="share-outline" size={24} color="#606060" />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="download-outline" size={24} color="#606060" />
            <Text style={styles.actionText}>Tải về</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => toggleFavorite(selectedVideo)}
          >
            <MaterialCommunityIcons 
              name={favorites.some(fav => fav.id.videoId === selectedVideo.id.videoId) 
                ? "heart" : "heart-outline"} 
              size={24} 
              color="#606060" 
            />
            <Text style={styles.actionText}>Yêu thích</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.channelContainer}>
        <View style={styles.channelInfo}>
          <Image
            style={styles.channelAvatar}
            source={{ uri: `https://i.pravatar.cc/100?u=${selectedVideo.snippet.channelTitle}` }}
          />
          <View style={styles.channelMeta}>
            <Text style={styles.channelName}>{selectedVideo.snippet.channelTitle}</Text>
            <Text style={styles.subscriberCount}>1000 người đăng ký</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeText}>ĐĂNG KÝ</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.descriptionContainer}>
        <Text 
          style={styles.description}
          numberOfLines={showFullDescription ? undefined : 2}
        >
          {selectedVideo.snippet.description || 'Không có mô tả'}
        </Text>
        {selectedVideo.snippet.description?.length > 100 && (
          <TouchableOpacity
            onPress={() => setShowFullDescription(!showFullDescription)}
          >
            <Text style={styles.showMoreText}>
              {showFullDescription ? 'THU GỌN' : 'HIỆN THÊM'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSuggestedVideo = ({ item }) => (
    <TouchableOpacity 
      style={styles.suggestedVideoItem}
      onPress={() => handleVideoSelect(item)}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          style={styles.thumbnail}
          source={{ uri: item.snippet.thumbnails.medium.url }}
        />
        <View style={styles.videoDuration}>
          <Text style={styles.durationText}>4:30</Text>
        </View>
      </View>
      
      <View style={styles.videoDetails}>
        <Text style={styles.videoItemTitle} numberOfLines={2}>
          {item.snippet.title}
        </Text>
        <Text style={styles.channelName}>{item.snippet.channelTitle}</Text>
        <Text style={styles.videoMeta}>500 lượt xem • 2 giờ trước</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMainContent = () => (
    <View style={styles.mainContent}>
      {selectedVideo && (
        <FlatList
          ref={flatListRef}
          data={videos.filter(v => v.id.videoId !== selectedVideo?.id.videoId)}
          renderItem={renderSuggestedVideo}
          keyExtractor={item => item.id.videoId}
          ListHeaderComponent={() => (
            <>
              {renderVideoPlayer()}
              {renderVideoInfo()}
              <View style={styles.divider} />
              <Text style={styles.suggestedHeader}>Video tiếp theo</Text>
            </>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  // Add custom voice commands handler
  const { handleCommand } = useVoiceCommands({
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    volumeUp: () => {/* implement volume up */},
    volumeDown: () => {/* implement volume down */},
    mute: () => {/* implement mute */},
    unmute: () => {/* implement unmute */}
  });

  const handleCustomVoiceCommands = (command) => {
    return handleCommand(command);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isSearchActive ? (
        renderSearchScreen()
      ) : (
        <>
          <LinearGradient
            colors={['#2F855A', '#276749']}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Video cho người cao tuổi</Text>
          </LinearGradient>

          {renderSearchBar()}
          {renderMainContent()}
        </>
      )}
      <MicroButton 
        style={styles.microButton}
        customCommands={handleCustomVoiceCommands}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  videoInfoContainer: {
    padding: 12,
    backgroundColor: '#FFF',
  },
  videoTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 12,
    lineHeight: 22,
  },
  videoMeta: {
    flexDirection: 'column',
    gap: 16,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelMeta: {
    marginLeft: 12,
  },
  channelName: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#0F0F0F',
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  actionButton: {
    padding: 8,
  },
  speedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 4,
    borderRadius: 20,
  },
  speedButton: {
    padding: 4,
  },
  speedText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#2F855A',
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  suggestedVideoItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
  },
  suggestedThumbnail: {
    width: 160,
    height: 90,
    borderRadius: 8,
  },
  suggestedVideoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  suggestedVideoTitle: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#1A202C',
    lineHeight: 20,
  },
  suggestedChannelTitle: {
    fontSize: normalize(13),
    color: '#718096',
  },
  listContainer: {
    backgroundColor: '#FFF',
  },
  categoryList: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  categoryText: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginLeft: 6,
    color: '#4A5568'
  },
  searchContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F7FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: normalize(15),
    color: '#718096',
    flex: 1,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  controlButton: {
    alignItems: 'center',
    padding: 8,
  },
  controlText: {
    fontSize: normalize(12),
    color: '#4A5568',
    marginTop: 4,
    textAlign: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: normalize(16),
    color: '#718096',
    textAlign: 'center',
  },
  searchScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchScreen: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  searchBackButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
  },
  searchBarContainer: {
    flex: 1,
  },
  searchBarActive: {
    elevation: 0,
    backgroundColor: '#F7FAFC',
    borderRadius: 24,
    height: 44,
  },
  searchInput: {
    fontSize: normalize(15),
    color: '#1A202C',
    paddingLeft: 8,
    height: 44,
  },
  searchResults: {
    padding: 16,
  },
  searchLoading: {
    marginTop: 20,
  },
  emptySearch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  searchHint: {
    fontSize: normalize(16),
    color: '#718096',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  searchThumbnailContainer: {
    width: 120,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  searchThumbnailPlaceholder: {
    backgroundColor: '#E2E8F0',
  },
  searchVideoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  searchVideoTitle: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#1A202C',
  },
  searchChannelTitle: {
    fontSize: normalize(12),
    color: '#718096',
    marginTop: 4,
  },
  playerWrapper: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  playerOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 2,
  },
  fullscreenButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  videoInfoContainer: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  videoTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#1A202C',
    lineHeight: 24,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: normalize(14),
    color: '#718096',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: normalize(12),
    color: '#4A5568',
    marginTop: 4,
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderRadius: 24,
  },
  speedButton: {
    padding: 8,
  },
  speedDisplay: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  speedValue: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#2F855A',
  },
  speedLabel: {
    fontSize: normalize(10),
    color: '#718096',
    marginTop: 2,
  },
  suggestedItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  suggestedThumbnail: {
    width: width * 0.38, // Responsive width
    height: (width * 0.38) * 0.5625, // 16:9 ratio
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  suggestedInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  suggestedTitle: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#1A202C',
    lineHeight: 20,
    marginBottom: 8,
  },
  suggestedMeta: {
    justifyContent: 'space-between',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedChannel: {
    fontSize: normalize(12),
    color: '#718096',
    marginLeft: 4,
    flex: 1,
  },
  suggestedViews: {
    fontSize: normalize(12),
    color: '#718096',
    marginLeft: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  suggestionText: {
    fontSize: normalize(15),
    color: '#4A5568',
    marginLeft: 12,
  },
  errorMessage: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  suggestionsWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  suggestionsScroll: {
    maxHeight: 300, // Giới hạn chiều cao danh sách gợi ý
  },
  suggestionIcon: {
    marginRight: 16,
  },
  searchResultsContainer: {
    flex: 1,
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  searchViews: {
    fontSize: normalize(12),
    color: '#718096',
    marginLeft: 4,
  },
  loadingContainer: {
    height: width * 0.5625,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: normalize(14),
  },
  suggestedHeader: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#2D3748',
    padding: 16,
    backgroundColor: '#F7FAFC',
  },
  playerWrapper: {
    width: '100%',
    backgroundColor: '#000',
  },
  videoInfoContainer: {
    padding: 12,
  },
  videoTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#0F0F0F',
    marginBottom: 8,
  },
  videoStats: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  viewCount: {
    fontSize: normalize(14),
    color: '#606060',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: normalize(12),
    color: '#606060',
    marginTop: 4,
  },
  channelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  channelMeta: {
    marginLeft: 12,
    flex: 1,
  },
  channelName: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#0F0F0F',
  },
  subscriberCount: {
    fontSize: normalize(12),
    color: '#606060',
  },
  subscribeButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeText: {
    color: '#FFF',
    fontSize: normalize(14),
    fontWeight: '500',
  },
  descriptionContainer: {
    paddingVertical: 12,
  },
  description: {
    fontSize: normalize(14),
    color: '#606060',
    lineHeight: 20,
  },
  showMoreText: {
    color: '#606060',
    fontSize: normalize(14),
    fontWeight: '500',
    marginTop: 8,
  },
  suggestedVideoItem: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnailContainer: {
    position: 'relative',
    width: width * 0.4,
    aspectRatio: 16/9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoDuration: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: normalize(12),
  },
  videoDetails: {
    flex: 1,
    marginLeft: 12,
  },
  videoItemTitle: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#0F0F0F',
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: normalize(12),
    color: '#606060',
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: '500',
    color: '#0F0F0F',
    padding: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  playerControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlBtn: {
    padding: 8,
  },
  microButton: {
    bottom: 100, // Adjust position to avoid overlap with other controls
    right: 20,
    zIndex: 1000,
  },
  controlBtnDisabled: {
    opacity: 0.5,
  },
});

export default VideoScreen;
