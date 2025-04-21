import React, { useRef } from 'react';
import { Video } from 'expo-av';

export default function CustomVideoPlayer({ videoUrl, thumbnailUrl }) {
  const videoRef = useRef(null);

  return (
    <Video
      ref={videoRef}
      source={videoUrl}
      posterSource={thumbnailUrl}
      useNativeControls
      resizeMode="contain"
      posterResizeMode="cover"
      style={{ flex: 1 }}
    />
  );
}
