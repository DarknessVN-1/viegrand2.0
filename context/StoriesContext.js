import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load data from storage when app starts
  useEffect(() => {
    loadStoriesData();
  }, []);

  const loadStoriesData = async () => {
    try {
      const storiesData = await AsyncStorage.getItem('stories');
      const categoriesData = await AsyncStorage.getItem('categories');
      
      if (storiesData) setStories(JSON.parse(storiesData));
      if (categoriesData) setCategories(JSON.parse(categoriesData));
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const addStory = async (story) => {
    try {
      const newStories = [...stories, { ...story, id: Date.now().toString() }];
      await AsyncStorage.setItem('stories', JSON.stringify(newStories));
      setStories(newStories);
    } catch (error) {
      console.error('Error adding story:', error);
    }
  };

  const addCategory = async (category) => {
    try {
      const newCategories = [...categories, { ...category, id: Date.now().toString() }];
      await AsyncStorage.setItem('categories', JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const value = {
    stories,
    categories,
    addStory,
    addCategory,
  };

  return (
    <StoriesContext.Provider value={value}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
