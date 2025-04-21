import React from 'react';
import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../StoryDetailScreen.styles';

export const StoryHero = ({ story }) => (
  <View style={styles.heroSection}>
    <Image 
      source={{ uri: story.thumbnail || story.cover }}
      style={styles.heroCover}
      blurRadius={3}
    />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.heroGradient}
    />
    <View style={styles.heroContent}>
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: story.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      </View>
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <View style={styles.authorWrapper}>
          <View style={styles.authorInfo}>
            <MaterialCommunityIcons name="pencil-circle" size={16} color="#fff" />
            <Text style={styles.authorText}>{story.author || 'Không xác định'}</Text>
          </View>
        </View>
      </View>
    </View>
  </View>
);
