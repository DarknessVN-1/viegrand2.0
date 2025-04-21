import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen({ navigation }) {
  const { user, typeUser } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideTopAnim = useRef(new Animated.Value(0)).current;
  const slideBottomAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600, // Reduced from 1000
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 15,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      // Exit animation sequence
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400, // Reduced from 500
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          tension: 15,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideTopAnim, {
          toValue: -1000,
          duration: 800, // Reduced from 1000
          useNativeDriver: true,
        }),
        Animated.timing(slideBottomAnim, {
          toValue: 1000,
          duration: 800, // Reduced from 1000
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          if (user) {
            if (typeUser) {
              navigation.replace(typeUser == 'relative' ? 'RelativeHome' : 'ElderlyHome');
            } else {
              navigation.replace('TypeUser');
            }
            // Navigate based on user role

          } else {
            navigation.replace('Intro');
          }
        }, 300); // Reduced from 500
      });
    }, 1200); // Reduced from 2000 - This is the main wait time

    return () => clearTimeout(timer);
  }, [navigation, user, fadeAnim, scaleAnim, slideTopAnim, slideBottomAnim, typeUser]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.gradientTop,
          { transform: [{ translateY: slideTopAnim }] }
        ]}
      />
      <Animated.View
        style={[
          styles.gradientBottom,
          { transform: [{ translateY: slideBottomAnim }] }
        ]}
      />
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
  },
  gradientTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%', // Exactly half
    backgroundColor: '#43A047',
    zIndex: 1,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%', // Exactly half
    backgroundColor: '#1B5E20',
    zIndex: 1,
  },
  centerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  logo: {
    width: 200,
    height: 200,
  },
});
