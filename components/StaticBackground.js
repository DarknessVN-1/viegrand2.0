import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function StaticBackground() {
  return (
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="rgba(76, 175, 80, 0.15)" />
          <Stop offset="1" stopColor="rgba(46, 125, 50, 0.15)" />
        </LinearGradient>
        <LinearGradient id="grad2" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="rgba(76, 175, 80, 0.1)" />
          <Stop offset="1" stopColor="rgba(46, 125, 50, 0.1)" />
        </LinearGradient>
      </Defs>

      {/* Top right decorative shape */}
      <Path
        d="M320,0 C280,20 250,50 240,100 Q380,120 400,0"
        fill="url(#grad1)"
      />

      {/* Bottom left wave */}
      <Path
        d="M0,260 C100,240 180,280 200,320 Q80,380 0,400"
        fill="url(#grad2)"
      />

      {/* Decorative circles */}
      <Circle cx="85%" cy="15%" r="50" fill="url(#grad1)" />
      <Circle cx="15%" cy="85%" r="40" fill="url(#grad2)" />
      
      {/* Small accent circles */}
      <Circle cx="70%" cy="40%" r="15" fill="rgba(76, 175, 80, 0.07)" />
      <Circle cx="30%" cy="60%" r="20" fill="rgba(46, 125, 50, 0.07)" />
    </Svg>
  );
}
