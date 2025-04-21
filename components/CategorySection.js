import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StoryCard from './StoryCard';
import { colors } from '../theme/colors';

const CategorySection = ({ category, onStoryPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category.name}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {category.stories.map(story => (
          <StoryCard
            key={story.id}
            story={story}
            onPress={() => onStoryPress(story)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
    color: colors.text,
  },
});

export default CategorySection;
