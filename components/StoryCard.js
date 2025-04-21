import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const StoryCard = ({ story, onPress, featured }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, featured && styles.featuredContainer]} 
      onPress={onPress}
    >
      {story.thumbnail ? (
        <Image
          source={{ uri: story.thumbnail }}
          style={[styles.thumbnail, featured && styles.featuredThumbnail]}
          defaultSource={require('../assets/default-book.png')}
        />
      ) : (
        <View style={[styles.iconContainer, featured && styles.featuredIconContainer]}>
          <MaterialCommunityIcons 
            name={story.icon || 'book-open-variant'} 
            size={featured ? 32 : 24} 
            color={colors.primary} 
          />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{story.title}</Text>
        {featured ? (
          <Text style={styles.description} numberOfLines={2}>
            {story.description}
          </Text>
        ) : (
          <Text style={styles.shortContent} numberOfLines={2}>
            {story.shortContent}
          </Text>
        )}
        <View style={styles.footer}>
          <View style={styles.stats}>
            <MaterialCommunityIcons name="eye" size={16} color={colors.grey} />
            <Text style={styles.readCount}>{story.readCount}</Text>
          </View>
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.grey} />
            <Text style={styles.timeRead}>{story.timeRead}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginHorizontal: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredContainer: {
    width: 280,
  },
  thumbnail: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  featuredThumbnail: {
    height: 120,
  },
  iconContainer: {
    height: 80,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.primary}20`,
  },
  featuredIconContainer: {
    height: 120,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.text,
  },
  shortContent: {
    fontSize: 13,
    color: colors.grey,
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readCount: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.grey,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRead: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.grey,
  }
});

export default StoryCard;
