import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native'; 

const Stack = createStackNavigator();

function MainNavigator() {
  const navigation = useNavigation(); 

  useEffect(() => {
    Alert.alert('Thông báo', 'Ứng dụng khởi động thành công!');
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
}

export default MainNavigator;
