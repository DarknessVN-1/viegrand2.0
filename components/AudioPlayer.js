import React, { useEffect, useState } from 'react';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AudioPlayer = ({ url, title, artist, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const progress = useProgress();

  useEffect(() => {
    setupPlayer();
    return () => cleanup();
  }, [url]);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add({
        id: 'trackId',
        url: url,
        title: title,
        artist: artist,
      });
    } catch (error) {
      onError && onError(error);
    }
  };

  const cleanup = async () => {
    await TrackPlayer.stop();
    await TrackPlayer.destroy();
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlayback}>
          <MaterialCommunityIcons 
            name={isPlaying ? "pause-circle" : "play-circle"} 
            size={40} 
            color="#2F855A" 
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.time}>{formatTime(progress.position)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    marginLeft: 10,
    fontSize: 12,
    color: '#666',
  }
});

export default AudioPlayer;
