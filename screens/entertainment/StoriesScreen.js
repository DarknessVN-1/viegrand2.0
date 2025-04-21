import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabBar from '../../components/navigation_bar'; // Thêm import này

const StoryCategories = [
  { 
    id: 'all', 
    name: 'Tất cả', 
    icon: 'book-multiple', 
    colors: ['#38A169', '#2F855A']
  },
  { 
    id: 'novel', 
    name: 'Tiểu thuyết', 
    icon: 'book-open-page-variant', 
    colors: ['#4299E1', '#3182CE']
  },
  { 
    id: 'comic', 
    name: 'Truyện tranh', 
    icon: 'image-multiple', 
    colors: ['#ED8936', '#DD6B20']
  },
  { 
    id: 'education', 
    name: 'Giáo dục', 
    icon: 'school', 
    colors: ['#9F7AEA', '#805AD5']
  },
];

export default function StoriesScreen({ navigation }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredStories, setFilteredStories] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    filterStories();
  }, [stories, selectedCategory, searchText]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://viegrand.site/api/get-stories.php');
      const data = await response.json();
      
      console.log('API Response:', data); // Thêm log để debug
      
      if (data.success) {
        // Lưu trực tiếp mảng stories không cần format
        setStories(data.stories);
        await AsyncStorage.setItem('storiesCache', JSON.stringify({
          data: data.stories,
          timestamp: Date.now()
        }));
      } else {
        setError('Không thể tải danh sách truyện');
      }
    } catch (err) {
      console.error('Fetch error:', err); // Thêm log để debug
      setError('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = [...stories];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(story => 
        story.category_id?.toString() === selectedCategory ||
        story.category_name?.toLowerCase() === StoryCategories.find(cat => cat.id === selectedCategory)?.name.toLowerCase()
      );
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(story =>
        story.title?.toLowerCase().includes(searchLower) ||
        story.description?.toLowerCase().includes(searchLower) ||
        story.category_name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredStories(filtered);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchText('');
    }
  };

  const handleStoryPress = (story) => {
    navigation.navigate('StoryDetail', { story });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
      style={styles.header}
    >
      <View style={styles.headerTop}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          {!isSearchVisible && (
            <Text style={styles.headerTitle}>Thư viện sách</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={toggleSearch}
          >
            <MaterialCommunityIcons 
              name={isSearchVisible ? "close" : "magnify"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={20} 
            color="rgba(255,255,255,0.7)"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm truyện..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {StoryCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <LinearGradient
              colors={selectedCategory === category.id ? category.colors : ['transparent', 'transparent']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.categoryChipGradient}
            >
              <MaterialCommunityIcons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#fff' : category.colors[0]} 
              />
              <Text style={[
                styles.categoryChipText,
                {color: selectedCategory === category.id ? '#fff' : category.colors[0]}
              ]}>
                {category.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );

  const renderStoryItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.storyCard, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
      onPress={() => navigation.navigate('StoryDetailScreen', { story: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardContainer}>
        <Image
          source={{ uri: item.thumbnail || 'https://via.placeholder.com/150' }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.gradientOverlay}
        />
        
        <View style={styles.cardContent}>
          <View style={styles.topContent}>
            <View style={[styles.categoryBadge, { backgroundColor: item.category_color || '#38A169' }]}>
              <MaterialCommunityIcons name={item.icon || "book-open-variant"} size={12} color="#fff" />
              <Text style={styles.categoryText}>{item.category_name}</Text>
            </View>
            {item.progress && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>{Math.round(item.progress)}%</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomContent}>
            <Text style={styles.storyTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            <View style={styles.statsContainer}>
              {item.volume_count > 0 && (
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="book-multiple" size={14} color="#fff" />
                  <Text style={styles.statText}>{item.volume_count} tập</Text>
                </View>
              )}
              {item.chapter_count > 0 && (
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="file-document" size={14} color="#fff" />
                  <Text style={styles.statText}>{item.chapter_count} chương</Text>
                </View>
              )}
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="eye" size={14} color="#fff" />
                <Text style={styles.statText}>{(item.read_count || 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleTabPress = (routeName) => {
    switch (routeName) {
      case 'Features':
      case 'ElderlyHome':
      case 'Entertainment':
      case 'Settings':
      case 'Medication':
        navigation.navigate('ElderlyTabs', { screen: routeName });
        break;
      default:
        navigation.navigate(routeName);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStories}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <>
        <FlatList
          data={filteredStories}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderStoryItem}
          contentContainerStyle={styles.storyGrid}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                {searchText ? 'Kết quả tìm kiếm' : 'Đề xuất cho bạn'}
              </Text>
              <Text style={styles.resultCount}>
                {filteredStories.length} truyện
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="book-open-variant" size={48} color={colors.grey} />
              <Text style={styles.emptyText}>Chưa có truyện nào</Text>
            </View>
          )}
        />
        {!loading && !error && (
          <CustomTabBar 
            navigation={navigation} 
            state={{ 
              index: 2,
              routes: [
                { name: 'Medication' },
                { name: 'ElderlyHome' },
                { name: 'Entertainment' },
                { name: 'Settings' }
              ] 
            }} 
            onTabPress={({ route }) => handleTabPress(route.name)}
          />
        )}
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    paddingBottom: 85, // Điều chỉnh padding để tránh nội dung bị che bởi navigation bar
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    marginVertical: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  categoriesScroll: {
    marginTop: 12,
  },
  categoriesContainer: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    marginRight: 10,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChipText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  storyGrid: {
    padding: 16,
  },
  storyCard: {
    flex: 1,
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  cardContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  topContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bottomContent: {
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 161, 105, 0.9)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  storyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  loader: {
    marginTop: 50
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: colors.grey
  },
  storyInfo: {
    gap: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultCount: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
});