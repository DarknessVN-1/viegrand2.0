import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated, TextInput, FlatList, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './StoryDetailScreen.styles';
import { StoryHero } from './components/StoryHero';
import { StoryStats } from './components/StoryStats';
import { StoryDetails } from './components/StoryDetails';
import debounce from 'lodash.debounce';
import CustomTabBar from '../../components/navigation_bar';

export default function StoryDetailScreen({ route, navigation }) {
  const { story } = route.params;
  const [volumes, setVolumes] = useState(story.volumes || []);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [fontSize, setFontSize] = useState('normal');
  const [showControls, setShowControls] = useState(true);
  const [theme, setTheme] = useState('light');
  const [lineHeight, setLineHeight] = useState('normal');
  const scrollY = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const [index, setIndex] = useState(0);
  const [routes] = useState(() => {
    // Nếu truyện không có chương, chỉ hiển thị tab Info và Content
    if (!story.has_chapters) {
      return [
        { key: 'info', title: 'Thông tin' },
        { key: 'content', title: 'Nội dung' },
      ];
    }
    // Nếu có chương, hiển thị cả 3 tab
    return [
      { key: 'info', title: 'Thông tin' },
      { key: 'chapters', title: 'Danh sách chương' },
      { key: 'content', title: 'Nội dung' },
    ];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [error, setError] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [relatedTags, setRelatedTags] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Add refs
  const scrollViewRef = useRef(null);
  const scrollTimeout = useRef(null);
  const [readingPositions, setReadingPositions] = useState({});

  // Add formatReadingTime function before renderContentRoute
  const formatReadingTime = (text) => {
    if (!text) return '0 phút đọc';
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} phút đọc`;
  };

  useEffect(() => {
    if (story.has_chapters) {
      if (story.volumes?.length > 0) {
        setSelectedVolume(story.volumes[0]);
        loadChaptersByVolume(story.volumes[0].id);
      } else {
        loadAllChapters();
      }
    }
  }, []);

  useEffect(() => {
    loadReadingProgress();
  }, []);

  useEffect(() => {
    if (selectedChapter) {
      saveReadingProgress();
    }
  }, [selectedChapter]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadReadingProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem(`reading_progress_${story.id}`);
      if (progress) {
        const { volumeId, chapterId, position } = JSON.parse(progress);
        if (volumeId) {
          const volume = story.volumes?.find(v => v.id === volumeId);
          if (volume) {
            setSelectedVolume(volume);
            await loadChaptersByVolume(volume.id, chapterId);
            setReadingPositions(prev => ({
              ...prev,
              [chapterId]: position
            }));
          }
        } else if (chapterId) {
          await loadAllChapters(chapterId);
          setReadingPositions(prev => ({
            ...prev,
            [chapterId]: position
          }));
        }
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  };

  const saveReadingProgress = async () => {
    try {
      const progress = {
        volumeId: selectedVolume?.id,
        chapterId: selectedChapter.id,
        position: readingPositions[selectedChapter.id] || 0
      };
      await AsyncStorage.setItem(
        `reading_progress_${story.id}`,
        JSON.stringify(progress)
      );
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  };

  const loadChaptersByVolume = async (volumeId, selectChapterId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://viegrand.site/api/get-chapters.php?story_id=${story.id}&volume_id=${volumeId}`);
      const data = await response.json();
      
      if (data.success) {
        setChapters(data.chapters);
        if (data.chapters.length > 0) {
          if (selectChapterId) {
            const chapter = data.chapters.find(c => c.id === selectChapterId);
            setSelectedChapter(chapter || data.chapters[0]);
          } else {
            setSelectedChapter(data.chapters[0]);
          }
        }
      } else {
        setError('Không thể tải danh sách chương');
      }
    } catch (error) {
      setError('Đã có lỗi xảy ra khi tải dữ liệu');
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllChapters = async (selectChapterId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://viegrand.site/api/get-chapters.php?story_id=${story.id}`);
      const data = await response.json();
      if (data.success) {
        setChapters(data.chapters);
        if (data.chapters.length > 0) {
          if (selectChapterId) {
            const chapter = data.chapters.find(c => c.id === selectChapterId);
            setSelectedChapter(chapter || data.chapters[0]);
          } else {
            setSelectedChapter(data.chapters[0]);
          }
        }
      } else {
        setError('Không thể tải danh sách chương');
      }
    } catch (error) {
      setError('Đã có lỗi xảy ra khi tải dữ liệu');
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: showControls ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowControls(!showControls);
  };

  const navigateToChapter = (direction) => {
    const currentIndex = chapters.findIndex(c => c.id === selectedChapter.id);
    let nextIndex;

    if (direction === 'next') {
      nextIndex = currentIndex + 1;
      if (nextIndex >= chapters.length) {
        const currentVolumeIndex = volumes.findIndex(v => v.id === selectedVolume?.id);
        if (currentVolumeIndex < volumes.length - 1) {
          setSelectedVolume(volumes[currentVolumeIndex + 1]);
          loadChaptersByVolume(volumes[currentVolumeIndex + 1].id);
        }
        return;
      }
    } else {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        const currentVolumeIndex = volumes.findIndex(v => v.id === selectedVolume?.id);
        if (currentVolumeIndex > 0) {
          setSelectedVolume(volumes[currentVolumeIndex - 1]);
          loadChaptersByVolume(volumes[currentVolumeIndex - 1].id);
        }
        return;
      }
    }

    setSelectedChapter(chapters[nextIndex]);
  };

  const renderChapterNavigation = () => (
    <Animated.View style={[styles.chapterNavigation, { opacity: controlsOpacity }]}>
      <TouchableOpacity 
        style={[
          styles.navButton,
          !canNavigatePrevious() && styles.navButtonDisabled
        ]}
        onPress={() => navigateToChapter('previous')}
        disabled={!canNavigatePrevious()}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
        <Text style={styles.navText}>Trước</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.navButton,
          !canNavigateNext() && styles.navButtonDisabled
        ]}
        onPress={() => navigateToChapter('next')}
        disabled={!canNavigateNext()}
      >
        <Text style={styles.navText}>Sau</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  const canNavigatePrevious = () => {
    if (!selectedChapter) return false;
    const currentIndex = chapters.findIndex(c => c.id === selectedChapter.id);
    return currentIndex > 0 || (selectedVolume && volumes.findIndex(v => v.id === selectedVolume.id) > 0);
  };

  const canNavigateNext = () => {
    if (!selectedChapter) return false;
    const currentIndex = chapters.findIndex(c => c.id === selectedChapter.id);
    return currentIndex < chapters.length - 1 || (selectedVolume && volumes.findIndex(v => v.id === selectedVolume.id) < volumes.length - 1);
  };

  const renderTabBar = props => (
    <View style={styles.tabBarContainer}>
      <TabBar
        {...props}
        indicatorStyle={styles.tabIndicator}
        style={styles.tabBar}
        labelStyle={styles.tabLabel}
        tabStyle={styles.tab}
        scrollEnabled={true}
        activeColor={colors.primary}
        inactiveColor="#666" // Changed from colors.grey to a darker gray
        renderLabel={({ route, focused, color }) => (
          <View style={styles.tabLabelContainer}>
            <Text style={[
              styles.tabLabelText,
              focused ? styles.tabLabelTextActive : styles.tabLabelTextInactive
            ]}>
              {route.title}
            </Text>
          </View>
        )}
      />
    </View>
  );

  const renderInfoRoute = () => (
    <ScrollView style={styles.tabContent}>
      <StoryHero story={story} />
      <StoryStats 
        readCount={story.readCount}
        chaptersCount={chapters.length}
        rating={story.rating}
      />
      <StoryDetails story={story} />
    </ScrollView>
  );

  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <View style={styles.searchBar}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={20} 
          color={colors.grey} 
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo số chương hoặc tiêu đề..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            debouncedSearch(text);
          }}
          placeholderTextColor={colors.grey}
          returnKeyType="search"
          autoCapitalize="none"
          autoComplete="off"
        />
        {searchQuery ? (
          <TouchableOpacity 
            onPress={() => {
              setSearchQuery('');
              setFilteredChapters([]);
            }}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons 
              name="close-circle" 
              size={20} 
              color={colors.grey} 
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {isSearching && (
        <ActivityIndicator 
          size="small" 
          color={colors.primary} 
          style={styles.searchLoader} 
        />
      )}
    </View>
  );

  const renderChaptersRoute = () => (
    <View style={styles.tabContent}>
      {renderSearchBar()}
      
      {searchQuery && filteredChapters.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            Không tìm thấy kết quả cho "{searchQuery}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchQuery ? filteredChapters : chapters}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.chapterItem,
                selectedChapter?.id === item.id && styles.selectedChapter,
                index % 2 === 0 && styles.evenChapter
              ]}
              onPress={() => {
                setSelectedChapter(item);
                setIndex(2);
              }}
            >
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterNumber}>
                  Chương {item.chapter_number}
                </Text>
                <Text style={styles.chapterTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.chapterMeta}>
                {selectedChapter?.id === item.id && (
                  <View style={styles.readingBadge}>
                    <Text style={styles.readingBadgeText}>Đang đọc</Text>
                  </View>
                )}
                <MaterialCommunityIcons
                  name={selectedChapter?.id === item.id ? "bookmark" : "chevron-right"}
                  size={24}
                  color={selectedChapter?.id === item.id ? colors.primary : colors.grey}
                />
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.chapterListContainer}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );

  const renderContentRoute = () => {
    // Nếu truyện không có chương, hiển thị nội dung trực tiếp
    if (!story.has_chapters) {
      const paragraphs = story.content.split('\n').filter(p => p.trim());
      const readingTime = formatReadingTime(story.content);

      return (
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterTitle}>
                {story.title}
              </Text>
            </View>

            {paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                style={[
                  styles.paragraph,
                  fontSize === 'large' && styles.largeText,
                  lineHeight === 'relaxed' && styles.relaxedLineHeight,
                  theme === 'dark' && styles.darkText
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </ScrollView>
        </View>
      );
    }

    // Nếu có chương, giữ nguyên logic cũ
    if (!selectedChapter) {
      return (
        <View style={styles.contentTab}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Vui lòng chọn một chương để đọc
            </Text>
          </View>
        </View>
      );
    }

    const paragraphs = selectedChapter.content.split('\n').filter(p => p.trim());
    const readingTime = formatReadingTime(selectedChapter.content);

    return (
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterTitle}>
              Chương {selectedChapter.chapter_number}
            </Text>
            <Text style={styles.chapterSubtitle}>
              {selectedChapter.title}
            </Text>
          </View>

          {paragraphs.map((paragraph, index) => (
            <Text
              key={index}
              style={[
                styles.paragraph,
                fontSize === 'large' && styles.largeText,
                lineHeight === 'relaxed' && styles.relaxedLineHeight,
                theme === 'dark' && styles.darkText
              ]}
            >
              {paragraph}
            </Text>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setFilteredChapters([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchLower = text.toLowerCase().trim();
    
    // Tìm kiếm theo số chương
    const isNumberSearch = !isNaN(searchLower);
    const searchNumber = isNumberSearch ? parseInt(searchLower) : null;

    const filtered = chapters.filter(chapter => {
      // Tìm theo số chương
      if (isNumberSearch) {
        return chapter.chapter_number === searchNumber ||
               chapter.chapter_number.toString().includes(searchLower);
      }

      // Tìm theo tiêu đề
      const titleMatch = chapter.title.toLowerCase().includes(searchLower);
      const chapterNumberMatch = (`chương ${chapter.chapter_number}`).toLowerCase().includes(searchLower);
      
      return titleMatch || chapterNumberMatch;
    });

    // Sắp xếp kết quả để ưu tiên kết quả chính xác hơn
    filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Ưu tiên kết quả bắt đầu với từ khóa tìm kiếm
      const aStartsWith = aTitle.startsWith(searchLower);
      const bStartsWith = bTitle.startsWith(searchLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Sau đó sắp xếp theo số chương
      return a.chapter_number - b.chapter_number;
    });

    setFilteredChapters(filtered);
    setIsSearching(false);

    // Lưu lịch sử tìm kiếm nếu có kết quả
    if (filtered.length > 0) {
      saveSearchHistory(text);
    }
  };

  // Thêm debounce để tăng hiệu suất tìm kiếm
  const debouncedSearch = useCallback(
    debounce((text) => handleSearch(text), 300),
    []
  );

  const handleTagPress = (tag) => {
    // Xử lý khi tag là số chương
    if (tag.startsWith('Chương')) {
      const chapterNumber = parseInt(tag.replace('Chương ', ''));
      const chapter = chapters.find(c => c.chapter_number === chapterNumber);
      if (chapter) {
        setSelectedChapter(chapter);
        setIndex(2); // Chuyển sang tab nội dung
        return;
      }
    }

    // Xử lý khi tag là tên volume
    const volume = volumes.find(v => v.title === tag);
    if (volume) {
      setSelectedVolume(volume);
      loadChaptersByVolume(volume.id);
      return;
    }

    // Xử lý khi tag là tên chương
    const chapter = chapters.find(c => c.title === tag);
    if (chapter) {
      setSelectedChapter(chapter);
      setIndex(2); // Chuyển sang tab nội dung
    }
  };

  const saveSearchHistory = async (query) => {
    if (!query) return;
    try {
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem(`search_history_${story.id}`, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(`search_history_${story.id}`);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(`search_history_${story.id}`);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
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
    <View style={[
      styles.container,
      { backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a' }
    ]}>
      <LinearGradient
        colors={['#2F855A', '#276749']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
            >
              <MaterialCommunityIcons 
                name="format-size" 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setLineHeight(lineHeight === 'normal' ? 'relaxed' : 'normal')}
            >
              <MaterialCommunityIcons 
                name="format-line-spacing" 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <MaterialCommunityIcons 
                name={theme === 'light' ? 'weather-sunny' : 'weather-night'}
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          info: renderInfoRoute,
          ...(story.has_chapters ? { chapters: renderChaptersRoute } : {}),
          content: renderContentRoute,
        })}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
      />

      {/* Chỉ hiển thị navigation khi có chương và đang ở tab content */}
      {story.has_chapters && index === 2 && renderChapterNavigation()}

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
    </View>
  );
}
