import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Get status bar height
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

// Base dimensions
const BASE_WIDTH = 375; // iPhone X width
const BASE_HEIGHT = 812; // iPhone X height

// Scale factors
const wscale = SCREEN_WIDTH / BASE_WIDTH;
const hscale = SCREEN_HEIGHT / BASE_HEIGHT;

// Normalize sizes based on screen dimensions
export const normalize = (size, based = 'width') => {
  const newSize = based === 'height' ? size * hscale : size * wscale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Device specific metrics
export const metrics = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  statusBarHeight: STATUS_BAR_HEIGHT,

  // Margins & Paddings
  baseSpace: normalize(8),
  smallSpace: normalize(4),
  mediumSpace: normalize(12),
  largeSpace: normalize(16),
  xlargeSpace: normalize(24),
  xxlargeSpace: normalize(32),

  // Border radius
  borderRadius: normalize(12),
  buttonRadius: normalize(10),
  inputRadius: normalize(8),

  // Component sizes
  headerHeight: normalize(56),
  inputHeight: normalize(56),
  inputHeightMinium: normalize(40),
  buttonHeight: normalize(52),
  iconSize: normalize(24),
  smallIconSize: normalize(20),

  // Font sizes
  largeTitle: normalize(32),
  title: normalize(24),
  subtitle: normalize(18),
  body: normalize(16),
  caption: normalize(14),
  small: normalize(12),

  // Input related
  inputPadding: normalize(16),
  inputFontSize: normalize(16),
  labelFontSize: normalize(12),

  // Shadow values
  shadowBase: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: normalize(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
    elevation: 3,
  },

  shadowStrong: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: normalize(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: normalize(8),
    elevation: 5,
  },
};

// Common styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    paddingTop: STATUS_BAR_HEIGHT,
  },
  content: {
    flex: 1,
    padding: metrics.largeSpace,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
};
