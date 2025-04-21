import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GradientButton = ({ 
  onPress, 
  title, 
  icon, 
  colors = ['#4CAF50', '#2E7D32'],
  style,
  textStyle,
  iconSize = 24
}) => {
  return (
    <TouchableOpacity 
      style={[styles.buttonContainer, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <LinearGradient
        colors={colors}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={iconSize} 
            color="#fff" 
            style={styles.icon}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
    shadowColor: '#1B5E20',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonGradient: {
    height: 55,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  icon: {
    marginLeft: 8,
  }
});

export default GradientButton;