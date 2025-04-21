import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import colors from '../theme/colors';  // Change to default import
import { cardShadow } from '../utils/shadow';

export const Card = ({ children, style }) => {
  // Add error boundary check
  if (!colors) {
    console.warn('Colors not available in Card component');
    return <View style={[defaultStyles.card, style]}>{children}</View>;
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors?.card || '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    ...cardShadow,
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
      },
    }),
  },
});