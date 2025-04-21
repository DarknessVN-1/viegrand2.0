import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FeaturesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Màn hình Tính năng</Text>
      {/* Thêm các thành phần tính năng của bạn ở đây */}
    </View>
  );
}

function goToHealth(navigation) {
  // Thay vì navigation.navigate('Health'):
  navigation.navigate('RelativeTabs', { screen: 'Health' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 18
  }
});