import React from 'react';
import { View, StyleSheet, Platform, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

/**
 * RelativeTabBar - Thanh điều hướng tối giản dành cho người thân
 */
const RelativeTabBar = ({ state = { index: 0, routes: [] }, navigation, descriptors }) => {
  // Sử dụng animated value cho hiệu ứng nhấn
  const pressAnimations = React.useRef(
    [...Array(5)].map(() => new Animated.Value(1))
  ).current;

  // Cấu hình các tab (không có label)
  const tabs = [
    { name: 'RelativeHome', icon: 'home' },
    { name: 'Medication', icon: 'pill' },
    { name: 'Alert', icon: 'bell-ring' },
    { name: 'Camera', icon: 'cctv' },
    { name: 'Settings', icon: 'cog' }
  ];

  // Kiểm tra nếu không cần hiển thị tabbar
  if (!state || !state.routes || state.routes.length === 0) {
    return null;
  }

  // Kiểm tra ẩn tabbar trong route options
  const currentRoute = state.routes[state.index];
  const currentDescriptor = descriptors && descriptors[currentRoute.key];
  const currentOptions = currentDescriptor ? currentDescriptor.options : {};
  
  if (currentOptions.tabBarVisible === false) {
    return null;
  }

  const handlePressIn = (index) => {
    Animated.timing(pressAnimations[index], {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.timing(pressAnimations[index], {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (index, routeName) => {
    handlePressOut(index);
    navigation.navigate(routeName);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab, index) => {
          const isActive = state.index === index;
          const isLast = index === tabs.length - 1;
          
          return (
            <React.Fragment key={tab.name}>
              <Animated.View 
                style={[
                  styles.tabWrapper,
                  { transform: [{ scale: pressAnimations[index] }] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tab,
                    isActive && styles.activeTab
                  ]}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  onPress={() => handlePress(index, tab.name)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.iconOuterContainer,
                    isActive && styles.activeIconOuterContainer
                  ]}>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons
                        name={tab.icon}
                        size={isActive ? 24 : 22}
                        color={isActive ? colors.primary : '#757575'}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {isActive && <View style={styles.activeIndicator} />}
              </Animated.View>
              
              {/* Thêm đường ngăn cách giữa các tab */}
              {!isLast && <View style={styles.separator} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10, // Đặt thấp hơn (gần bottom)
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 8, // Giảm padding
    paddingHorizontal: 5,
    width: width * 0.85, // Giảm độ rộng xuống 85% màn hình
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', // Đảm bảo tất cả các thành phần được căn chỉnh theo trục ngang
  },
  tabWrapper: {
    flex: 1,
    paddingVertical: 5, // Giảm padding
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {
    // Không cần background màu
  },
  iconOuterContainer: {
    height: 42, // Tăng kích thước
    width: 42, // Tăng kích thước
    borderRadius: 21, // Đảm bảo đây là 1/2 của height và width để tạo hình tròn hoàn hảo
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconOuterContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
  },
  iconContainer: {
    height: 40, // Giảm kích thước
    width: 40, // Giảm kích thước
    borderRadius: 20, // Đảm bảo đây là 1/2 của height và width để tạo hình tròn hoàn hảo
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1, // Đảm bảo luôn là hình vuông rồi mới bo tròn
    backgroundColor: 'transparent',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    height: 3,
    width: 16,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  separator: {
    height: 24, // Chiều cao của đường ngăn cách
    width: 1, // Chiều rộng mỏng
    backgroundColor: 'rgba(0,0,0,0.1)', // Màu xám nhạt
    alignSelf: 'center', // Đảm bảo nó nằm giữa theo chiều dọc
  },
});

export default RelativeTabBar;
