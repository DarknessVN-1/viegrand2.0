import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground() {
  const circle1Movement = useRef(new Animated.Value(0)).current;
  const circle2Movement = useRef(new Animated.Value(0)).current;
  const waveMovement = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(circle1Movement, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(circle1Movement, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(circle2Movement, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(circle2Movement, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(waveMovement, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(waveMovement, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="rgba(76, 175, 80, 0.2)" />
          <Stop offset="1" stopColor="rgba(46, 125, 50, 0.2)" />
        </LinearGradient>
      </Defs>

      <AnimatedCircle
        cx="90%"
        cy="10%"
        r="100"
        fill="url(#grad)"
        transform={circle1Movement.interpolate({
          inputRange: [0, 1],
          outputRange: ['translate(0, 0)', 'translate(-20, 20)'],
        })}
      />

      <AnimatedCircle
        cx="10%"
        cy="90%"
        r="80"
        fill="url(#grad)"
        transform={circle2Movement.interpolate({
          inputRange: [0, 1],
          outputRange: ['translate(0, 0)', 'translate(20, -20)'],
        })}
      />

      <AnimatedPath
        d={`
          M 0 ${height * 0.65}
          C ${width * 0.25} ${height * 0.55},
            ${width * 0.75} ${height * 0.75},
            ${width} ${height * 0.65}
          L ${width} ${height}
          L 0 ${height}
          Z
        `}
        fill="url(#grad)"
        transform={waveMovement.interpolate({
          inputRange: [0, 1],
          outputRange: ['translate(0, 0)', 'translate(0, -20)'],
        })}
      />
    </Svg>
  );
}
