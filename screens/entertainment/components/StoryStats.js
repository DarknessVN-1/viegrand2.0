import React from 'react';
import { View, Text } from 'react-native';
import styles from '../StoryDetailScreen.styles';

export const StoryStats = ({ readCount, chaptersCount, rating }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{(readCount || 0).toLocaleString()}</Text>
      <Text style={styles.statLabel}>Lượt đọc</Text>
    </View>
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{chaptersCount}</Text>
      <Text style={styles.statLabel}>Chương</Text>
    </View>
    <View style={[styles.statBox, styles.statBoxLast]}>
      <Text style={styles.statValue}>{rating || '4.5'}</Text>
      <Text style={styles.statLabel}>Đánh giá</Text>
    </View>
  </View>
);
