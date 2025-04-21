import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import React, { useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomTabBar from '../components/navigation_bar';
import VideoPlayerScreen from '../screens/exercise/VideoPlayerScreen';
import MedicationScreen from '../screens/medication/MedicationScreen';
import RelativeTabBar from '../components/RelativeTabBar';
import AlertScreen from '../screens/Alert/AlertScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import AddCameraScreen from '../screens/camera/AddCameraScreen';
import VoiceSettings from '../screens/settings/VoiceSettings';

// Import screens
import EntertainmentScreen from '../screens/entertainment/EntertainmentScreen';
import FeaturesScreen from '../screens/features/FeaturesScreen';
import ElderlyHomeScreen from '../screens/home/ElderlyHomeScreen';
import RelativeHomeScreen from '../screens/home/RelativeHomeScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import PlanDetailScreen from '../screens/premium/PlanDetailScreen';
import PremiumScreen from '../screens/premium/PremiumScreen';
import SelectRoleScreen from '../screens/role/SelectRoleScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import BiometricsScreen from '../screens/settings/BiometricsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import FAQScreen from '../screens/settings/FAQScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SupportScreen from '../screens/settings/SupportScreen';
import UserGuideScreen from '../screens/settings/UserGuideScreen';
import SigninScreen from '../screens/signin/SigninScreen';
import SignupScreen from '../screens/signup/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
import AddStoryScreen from '../screens/entertainment/AddStoryScreen';
import MiniGameScreen from '../screens/entertainment/MiniGameScreen';
import StoriesScreen from '../screens/entertainment/StoriesScreen';
import StoryDetailScreen from '../screens/entertainment/StoryDetailScreen';
import VideoScreen from '../screens/entertainment/VideoScreen';
import CourseListScreen from '../screens/exercise/CourseListScreen';
import ExerciseSelectionScreen from '../screens/exercise/ExerciseSelectionScreen';
import MemoryCardScreen from '../screens/games/MemoryCardScreen';
import NumberPuzzleScreen from '../screens/games/NumberPuzzleScreen';
import SudokuScreen from '../screens/games/SudokuScreen';
import IntroView from '../screens/IntroView/IntroView';
import TypeUserScreen from '../screens/TypeUser/TypeUser';
import RoleSwitcherScreen from '../screens/settings/RoleSwitcherScreen';
import TestWebViewScreen from '../screens/camera/TestWebViewScreen';
import RoleSwitcher from '../screens/settings/RoleSwitcher';

// Enable native screens for better performance
enableScreens();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const SettingsStackNav = createStackNavigator();

// Define defaultScreenOptions here so it's available for SettingsStack
const defaultScreenOptions = {
  headerShown: true,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

// Create a separate stack navigator for settings screens
const SettingsStack = () => (
  <SettingsStackNav.Navigator
    screenOptions={defaultScreenOptions}>
    <SettingsStackNav.Screen name="SettingsMain" component={SettingsScreen} 
      options={{ title: 'Cài đặt', headerShown: false }}
    />
    <SettingsStackNav.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{
        title: 'Đổi mật khẩu',
      }}
    />
    <SettingsStackNav.Screen
      name="Biometrics"
      component={BiometricsScreen}
      options={{
        title: 'Sinh trắc học',
      }}
    />
    <SettingsStackNav.Screen
      name="About"
      component={AboutScreen}
      options={{
        title: 'Về ứng dụng',
      }}
    />
    <SettingsStackNav.Screen
      name="Support"
      component={SupportScreen}
      options={{
        title: 'Trợ giúp',
      }}
    />
    <SettingsStackNav.Screen
      name="FAQ"
      component={FAQScreen}
      options={{
        title: 'Câu hỏi thường gặp',
      }}
    />
    <SettingsStackNav.Screen
      name="UserGuide"
      component={UserGuideScreen}
      options={{
        title: 'Hướng dẫn sử dụng',
      }}
    />
    <SettingsStackNav.Screen
      name="RoleSwitcher"
      component={RoleSwitcherScreen}
      options={{
        title: 'Chuyển chế độ',
      }}
    />
  </SettingsStackNav.Navigator>
);

function ElderlyTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName="ElderlyHome"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
        },
        lazy: true,
        detachInactiveScreens: true,
      }}
    >
      <Tab.Screen
        name="Medication"
        component={MedicationScreen}
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen
        name="ElderlyHome"
        component={ElderlyHomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Entertainment"
        component={EntertainmentScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}  // Use SettingsStack here
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function RelativeTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <RelativeTabBar {...props} />}
      initialRouteName="RelativeHome"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
        },
        lazy: true,
        detachInactiveScreens: true,
      }}
    >
      <Tab.Screen
        name="RelativeHome"
        component={RelativeHomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Medication"
        component={MedicationScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Alert"
        component={AlertScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}  // Use SettingsStack here
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function goHealthForRelative(navigation) {
  navigation.navigate('RelativeTabs', { screen: 'Health' });
}

function goHealthForElderly(navigation) {
  navigation.navigate('ElderlyTabs', { screen: 'Health' });
}

const AppNavigator = ({ navigation }) => {
  // Preload common assets
  useEffect(() => {
    // You can preload important screens or assets here
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: true,
        detachInactiveScreens: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        transitionSpec: {
          open: {
            animation: 'timing',
            config: { duration: 250 },
          },
          close: {
            animation: 'timing',
            config: { duration: 200 },
          },
        },
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      {/* Splash Screen */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Intro"
        component={IntroView}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="TypeUser"
        component={TypeUserScreen}
        options={{ headerShown: false }}
      />

      {/* Auth Screens */}
      <Stack.Screen name="Signin" component={SigninScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectRole" component={SelectRoleScreen} options={{ headerShown: false }} />

      {/* Home Screens */}
      <Stack.Screen name="ElderlyHome" component={ElderlyTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="RelativeHome" component={RelativeTabNavigator} options={{ headerShown: false }} />

      {/* Premium & Payment Screens */}
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          title: 'Nâng cấp Premium',
        }}
      />
      <Stack.Screen
        name="PlanDetail"
        component={PlanDetailScreen}
        options={{
          title: 'Chi tiết gói Premium',
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          title: 'Thanh toán',
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Entertainment"
        component={EntertainmentScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="MiniGame"
        component={MiniGameScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Sudoku"
        component={SudokuScreen}
        options={{
          headerShown: false
        }}
      />

      <Stack.Screen
        name="MemoryCard"
        component={MemoryCardScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="NumberPuzzle"
        component={NumberPuzzleScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Truyện"
        component={StoriesScreen}
        options={{
          headerShown: false,
          tabBarVisible: true,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="book-open-variant" size={24} color={color} />
          )
        }}
      />
      <Stack.Screen
        name="StoryDetailScreen"
        component={StoryDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddStory"
        component={AddStoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExerciseSelection"
        component={ExerciseSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseListScreen"
        component={CourseListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Video"
        component={VideoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Medication"
        component={MedicationScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ElderlyTabs"
        component={ElderlyTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RelativeTabs"
        component={RelativeTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Features"
        component={FeaturesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddCamera"
        component={AddCameraScreen}
        options={{
          title: 'Thêm Camera Mới',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="TestWebView"
        component={TestWebViewScreen}
        options={{
          title: 'Test WebView',
          headerShown: false
        }}
      />
      <Stack.Screen name="RoleSwitcher" component={RoleSwitcher} />
    </Stack.Navigator>
  );
};

export default AppNavigator;