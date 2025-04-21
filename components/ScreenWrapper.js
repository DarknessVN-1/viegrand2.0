import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomTabBar from './navigation_bar';

const ScreenWrapper = ({ children, navigation, routeName }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <CustomTabBar 
        navigation={navigation}
        state={{ 
          index: 0,
          routes: [{ name: routeName }]
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginBottom: 85, // Match TAB_BAR_HEIGHT
  }
});

export default ScreenWrapper;
