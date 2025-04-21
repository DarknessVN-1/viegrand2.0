import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStories } from '../../context/StoriesContext';
import { colors } from '../../theme/colors';

export default function AddStoryScreen({ navigation }) {
  const { addStory, categories } = useStories();
  const [storyData, setStoryData] = useState({
    title: '',
    description: '',
    shortContent: '',
    icon: 'book-open-variant',
    categoryId: '',
    timeRead: '5 phút',
  });

  const handleSubmit = async () => {
    await addStory(storyData);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm truyện mới</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tiêu đề</Text>
          <TextInput
            style={styles.input}
            value={storyData.title}
            onChangeText={(text) => setStoryData(prev => ({ ...prev, title: text }))}
            placeholder="Nhập tiêu đề truyện"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả ngắn</Text>
          <TextInput
            style={styles.input}
            value={storyData.description}
            onChangeText={(text) => setStoryData(prev => ({ ...prev, description: text }))}
            placeholder="Nhập mô tả ngắn"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nội dung</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={storyData.shortContent}
            onChangeText={(text) => setStoryData(prev => ({ ...prev, shortContent: text }))}
            placeholder="Nhập nội dung truyện"
            multiline
            numberOfLines={10}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Thêm truyện</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
