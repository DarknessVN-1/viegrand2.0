import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../theme/colors';

const { width } = Dimensions.get('window');

const MusicPlayer = ({ video, onClose }) => {
  const [playing, setPlaying] = useState(true);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {video?.title || 'Now Playing'}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.playerContainer}>
        <YoutubeIframe
          height={width * 0.5625} // 16:9 aspect ratio
          width={width - 32}
          play={playing}
          videoId={video?.id}
          onChangeState={onStateChange}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => setPlaying(v => !v)}
        >
          <MaterialCommunityIcons 
            name={playing ? "pause" : "play"} 
            size={32} 
            color="#FFF" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  playerContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

export default MusicPlayer;
