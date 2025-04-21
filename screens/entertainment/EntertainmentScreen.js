import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { normalize, metrics } from '../../utils/responsive';
import CustomTabBar from '../../components/navigation_bar';

const { width } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);
const TEXT_SIDE_SPACING = width * 0.045; // Add this constant
const GRID_SIDE_MARGIN = width * 0.045;
const GRID_SPACING = 12;
const BUTTON_WIDTH = (width - (GRID_SIDE_MARGIN * 2) - (GRID_SPACING * 2)) / 3;
const BUTTON_HEIGHT = BUTTON_WIDTH * 1.1;
const CONTENT_PADDING = 16; // Replaced metrics.padding with fixed value

// Updated color theme with darker green palette
const THEME = {
  primary: colors.primary,
  secondary: colors.primaryDark,
  accent: colors.primaryLight,
  gradients: {
    header: [colors.primaryDark, colors.primary, colors.primaryLight],
    primary: [colors.primary + '20', colors.primary + '10'],
    secondary: [colors.primaryDark + '20', colors.primaryDark + '10'],
    accent: [colors.primaryLight + '20', colors.primaryLight + '10'],
    card: ['#F7FAFC', '#EDF2F7'],
  },
  text: {
    primary: '#FFFFFF',
    secondary: colors.textSecondary,
    dark: colors.textPrimary
  }
};

const FeatureButton = ({ title, icon, onPress, subtitle }) => (
  <TouchableOpacity style={styles.featureButton} onPress={onPress}>
    <View style={styles.featureIconContainer}>
      <MaterialCommunityIcons name={icon} size={38} color={colors.primary} />
      <View style={styles.featureDecoration} />
    </View>
    <Text numberOfLines={1} style={styles.featureTitle}>{title}</Text>
    <Text numberOfLines={1} style={styles.featureSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

export default function EntertainmentScreen({ navigation }) {
  const features = [
    {
      title: 'Truyện',
      subtitle: 'Đọc truyện thư giãn',
      icon: 'book-open-variant',
      navigateTo: 'Truyện'
    },
    {
      title: 'Thể dục',
      subtitle: 'Vận động nhẹ nhàng',
      icon: 'run',
      navigateTo: 'ExerciseSelection'
    },
    {
      title: 'MiniGame',
      subtitle: 'Trò chơi giải trí',
      icon: 'gamepad-variant',
      navigateTo: 'MiniGame'
    },
    {
      title: 'Video',
      subtitle: 'Xem video thư giãn',
      icon: 'youtube',
      navigateTo: 'Video'
    }
  ];

  const handleFeaturePress = (feature) => {
    if (feature.navigateTo) {
      navigation.navigate(feature.navigateTo);
    } else if (feature.title === 'MiniGame') {
      navigation.navigate('MiniGame');
    } else if (feature.title === 'Truyện') {
      navigation.navigate('Truyện');
    } else {
      console.log('Navigating to:', feature.title);
      navigation.navigate(feature.title);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[colors.primaryDark, colors.primary, colors.primaryLight]} // Updated gradient colors
            start={{x: 0.2, y: 0}}
            end={{x: 0.8, y: 1}}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.mainTitle}>Giải trí</Text>
                <Text style={styles.headerSubtitle}>Thư giãn mỗi ngày 🎯</Text>
              </View>
              <TouchableOpacity style={styles.searchButton}>
                <MaterialCommunityIcons name="magnify" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.mainSection}>
          <View style={styles.backgroundPattern}>
            <MaterialCommunityIcons 
              name="dots-grid" 
              size={200} 
              color={colors.primary + '05'} 
            />
          </View>
          
          <View style={styles.featureGrid}>
            {features.map((item, index) => (
              <React.Fragment key={index}>
                <FeatureButton
                  {...item}
                  onPress={() => handleFeaturePress(item)}
                />
                {index === 1 && <View style={styles.rowSpacer} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      </SafeAreaView>
      <CustomTabBar 
        state={{ index: 3 }} 
        descriptors={{}}
        navigation={navigation} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingBottom: 90, // Keep the bottom padding for tabbar
    // Remove paddingTop here since we'll handle it in the header
  },
  headerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
    backgroundColor: 'transparent', // Add this to ensure shadow works properly
  },
  header: {
    height: Platform.OS === 'android' ? normalize(100) + StatusBar.currentHeight : normalize(100),
    width: '100%',
    borderBottomLeftRadius: normalize(20),
    borderBottomRightRadius: normalize(20),
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(15),
    marginTop: Platform.OS === 'android' ? normalize(5) : normalize(10), // Reduced marginTop
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 16, // Replaced metrics.padding with fixed value
  },
  mainTitle: {
    fontSize: normalize(22), // Slightly smaller font
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2, // Reduced margin
  },
  mainSection: {
    flex: 1,
    paddingTop: normalize(20),
    position: 'relative',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  featureButton: {
    width: width * 0.42,
    aspectRatio: 0.85,
    backgroundColor: '#FFF',
    borderRadius: 20,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.input.border,
  },
  featureTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: normalize(12),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: normalize(14),
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  backgroundPattern: {
    position: 'absolute',
    right: -50,
    top: -20,
    opacity: 0.5,
    transform: [{ rotate: '15deg' }],
    zIndex: -1,
  },
  featureIconContainer: {
    width: width * 0.2,
    height: width * 0.2,
    backgroundColor: colors.primary + '08',
    borderRadius: width * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.primary + '15',
  },
  featureDecoration: {
    position: 'absolute',
    right: -4,
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    zIndex: -1,
  },
  rowSpacer: {
    width: '100%',
    height: 10,
  },
});
