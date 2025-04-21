import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const UnderDevelopmentScreen = () => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name="construction" 
        size={80} 
        color={colors.primary}
      />
      <Text style={styles.title}>Đang phát triển</Text>
      <Text style={styles.message}>
        Tính năng này đang được phát triển và sẽ sớm ra mắt!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default UnderDevelopmentScreen;
