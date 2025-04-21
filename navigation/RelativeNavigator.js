
// Điều này chỉ là một ví dụ, bạn cần chỉnh sửa file navigation của bạn

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RelativeHomeScreen from '../screens/home/RelativeHomeScreen';
import AlertScreen from '../screens/Alert/AlertScreen';
import MedicationScreen from '../screens/medication/MedicationScreen';

const HomeStack = createStackNavigator();
const MainTab = createBottomTabNavigator();

const RelativeHomeStack = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Đổi tên từ 'RelativeHome' thành 'RelativeHomePage' để tránh trùng lặp */}
      <HomeStack.Screen name="RelativeHomePage" component={RelativeHomeScreen} />
      {/* Các màn hình khác trong stack này */}
    </HomeStack.Navigator>
  );
};

const RelativeNavigator = () => {
  return (
    <MainTab.Navigator>
      <MainTab.Screen name="RelativeHome" component={RelativeHomeStack} />
      <MainTab.Screen name="Alert" component={AlertScreen} />
      <MainTab.Screen name="Medication" component={MedicationScreen} />
      {/* Các tab khác */}
    </MainTab.Navigator>
  );
};

export default RelativeNavigator;
