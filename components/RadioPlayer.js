import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AudioManager from '../services/AudioManager';

const DEBOUNCE_TIME = 800; // 800ms delay between channel changes

const RadioPlayer = ({ streamUrl, stationName, onNext, onPrevious }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioManager = useRef(AudioManager.getInstance()).current;
  const isMounted = useRef(true);
  
  // Add animation values
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const loadingAnimation = useRef(new Animated.Value(0)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Handle URL changes
  useEffect(() => {
    if (!streamUrl) return;
    loadAudio();
  }, [streamUrl]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);

      // Cleanup previous sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      await audioManager.stopCurrent();

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: false, isLooping: true },
        onPlaybackStatusUpdate
      );

      if (!isMounted.current) {
        await newSound.unloadAsync();
        return;
      }

      audioManager.setCurrentSound(newSound);
      setSound(newSound);
      setIsPlaying(false);

      // Start playing after a short delay
      setTimeout(async () => {
        if (isMounted.current && newSound) {
          try {
            await newSound.playAsync();
          } catch (error) {
            console.error('Error auto-playing:', error);
          }
        }
      }, 500);

    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const togglePlayback = async () => {
    if (!sound || isLoading) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        // Try reloading if sound is not loaded
        if (!(await isSoundLoaded())) {
          await loadAudio();
        } else {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      // Attempt to recover by reloading
      await loadAudio();
    }
  };

  const isSoundLoaded = async () => {
    if (!sound) return false;
    try {
      const status = await sound.getStatusAsync();
      return status.isLoaded;
    } catch {
      return false;
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (!isMounted.current) return;
    
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    } else {
      setIsPlaying(false);
    }
  };

  const handleChannelChange = (direction) => {
    if (isLoading) return;
    
    // Stop current sound before changing
    if (sound) {
      sound.stopAsync().then(() => {
        if (direction === 'next') {
          onNext();
        } else {
          onPrevious();
        }
      });
    } else {
      if (direction === 'next') {
        onNext();
      } else {
        onPrevious();
      }
    }
  };

  // Animation for loading spinner
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(loadingAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ).start();
    } else {
      loadingAnimation.setValue(0);
    }
  }, [isLoading]);

  // Animation for radio icon rotation
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true
        })
      ).start();
    } else {
      Animated.timing(rotateAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [isPlaying]);

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const loadingSpin = loadingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const renderLoadingIndicator = () => (
    <View style={styles.loadingWrapper}>
      <ActivityIndicator size="large" color="#FFF" />
      <Text style={styles.loadingText}>
        Đang tải...
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.albumArt, { transform: [{ rotate: spin }] }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="radio" size={60} color="#FFF" />
        </View>
      </Animated.View>

      <View style={styles.infoContainer}>
        <Text style={styles.stationName} numberOfLines={2}>{stationName}</Text>
        <Text style={styles.statusText}>
          {isLoading ? 'Đang tải...' : isPlaying ? 'Đang phát' : 'Đã dừng'}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, isLoading && styles.buttonDisabled]}
          onPress={() => handleChannelChange('prev')}
          disabled={isLoading}
        >
          <MaterialCommunityIcons 
            name="skip-previous" 
            size={32} 
            color={isLoading ? "rgba(255,255,255,0.5)" : "#FFF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.playButton, isLoading && styles.buttonDisabled]} 
          onPress={togglePlayback}
          disabled={isLoading}
        >
          {isLoading ? renderLoadingIndicator() : (
            <MaterialCommunityIcons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#FFF"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, isLoading && styles.buttonDisabled]}
          onPress={() => handleChannelChange('next')}
          disabled={isLoading}
        >
          <MaterialCommunityIcons 
            name="skip-next" 
            size={32} 
            color={isLoading ? "rgba(255,255,255,0.5)" : "#FFF"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    aspectRatio: 0.9,
    padding: 20,
  },
  albumArt: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 1000,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  stationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButtonDisabled: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default RadioPlayer;
