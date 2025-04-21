import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { normalize } from '../../utils/responsive';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Core layout
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  viewBody: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: normalize(10), // Add padding at the top since we removed the weather component
  },
  fullScreenBody: {
    backgroundColor: '#000',
    paddingTop: 0,
  },
  // New compact header
  compactHeaderView: {
    height: Platform.OS === 'android' ? normalize(70) + (StatusBar.currentHeight || 0) : normalize(70),
    width: '100%',
    backgroundColor: colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  topHeaderView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(15),
  },
  screenTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: colors.background,
  },
  backButton: {
    position: 'absolute',
    left: normalize(15),
    padding: normalize(5),
  },
  headerRightContainer: {
    position: 'absolute',
    right: normalize(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: colors.error,
    borderRadius: normalize(20),
    paddingVertical: normalize(5),
    paddingHorizontal: normalize(10),
    marginRight: normalize(10),
  },
  notificationButton: {
    padding: normalize(5),
  },
  
  // Enhanced Camera Styles
  cameraContainer: {
    width: '92%',
    alignSelf: 'center',
    marginTop: normalize(20),
    marginBottom: normalize(10),
    borderRadius: normalize(16),
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.4)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fullScreenContainer: {
    width: '100%',
    height: '100%',
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 0,
  },
  cameraContent: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
    position: 'relative',
  },
  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#121212',
    position: 'relative',
  },
  cameraGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: '100%',
    height: 1,
    top: '33.33%',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
    left: '33.33%',
    top: 0,
  },
  cameraHeaderControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: normalize(16),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iconButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: normalize(16),
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cameraButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cameraSensorInfo: {
    position: 'absolute',
    top: normalize(16),
    left: normalize(16),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(4),
  },
  cameraSensorText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '500',
  },
  cameraFooterInfo: {
    position: 'absolute',
    bottom: normalize(16),
    right: normalize(16),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(4),
  },
  cameraFooterText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '500',
  },
  timelineScrubber: {
    backgroundColor: '#1E1E1E',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
    borderBottomLeftRadius: normalize(16),
    borderBottomRightRadius: normalize(16),
  },
  timelineRuler: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: normalize(6),
  },
  timelineTick: {
    alignItems: 'center',
  },
  timelineTickLabel: {
    color: '#9E9E9E',
    fontSize: normalize(10),
  },
  timelineProgress: {
    height: normalize(4),
    backgroundColor: '#333',
    borderRadius: normalize(2),
    position: 'relative',
  },
  timelineIndicator: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(6),
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraInfoPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: normalize(12),
    backgroundColor: '#fff',
    borderBottomLeftRadius: normalize(16),
    borderBottomRightRadius: normalize(16),
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cameraStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraStatText: {
    marginLeft: normalize(6),
    fontSize: normalize(12),
    color: colors.textSecondary,
  },
  loadingContainer: {
    width: '100%',
    aspectRatio: 16/9,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  loadingCircle: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(40),
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loadingText: {
    color: '#fff',
    fontSize: normalize(14),
    marginBottom: normalize(20),
  },
  loadingBar: {
    width: '100%',
    height: normalize(4),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: normalize(2),
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    width: '100%', // Set a base width
  },
  cameraIndicatorContainer: {
    position: 'absolute',
    top: normalize(16),
    right: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(4),
  },
  cameraIndicator: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    backgroundColor: colors.success,
    marginRight: normalize(6),
  },
  cameraIndicatorRecording: {
    backgroundColor: colors.error,
  },
  recordingDot: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(5),
    backgroundColor: 'rgba(255,59,48,1)',
    opacity: 1,
    transform: [{scale: 1}],
    animation: 'pulse 1s infinite',
  },
  cameraIndicatorText: {
    color: '#fff',
    fontSize: normalize(10),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  recordingTime: {
    color: '#fff',
    fontSize: normalize(10),
    marginLeft: normalize(6),
  },
  
  // Camera List Styles
  cameraList: {
    padding: normalize(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: colors.primaryDark,
  },
  addCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(16),
    backgroundColor: colors.primary + '10',
  },
  addCameraText: {
    fontSize: normalize(12),
    fontWeight: '500',
    color: colors.primary,
    marginLeft: normalize(4),
  },
  cameraCardList: {
    marginBottom: normalize(20),
  },
  cameraCardContent: {
    paddingVertical: normalize(8),
    paddingRight: normalize(20),
  },
  cameraCard: {
    width: normalize(130),
    marginRight: normalize(12),
    padding: normalize(12),
    borderRadius: normalize(16),
    backgroundColor: '#fff',
    height: normalize(150), // Fixed height for all cards
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cameraCardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cameraCardImageContainer: {
    position: 'relative',
    marginBottom: normalize(10),
    height: normalize(80), // Fixed height for image container
  },
  cameraCardImage: {
    height: normalize(80),
    borderRadius: normalize(8),
    backgroundColor: colors.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraStatusIndicator: {
    position: 'absolute',
    top: normalize(6),
    right: normalize(6),
    width: normalize(18),
    height: normalize(18),
    borderRadius: normalize(9),
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cameraStatusOffline: {
    backgroundColor: 'rgba(240,240,240,0.8)',
  },
  cameraCardTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: normalize(4),
    height: normalize(20),
  },
  cameraCardSubtitle: {
    fontSize: normalize(12),
    color: colors.textTertiary,
  },
  cameraCardEmpty: {
    width: normalize(130),
    height: normalize(150),
    padding: normalize(12),
    borderRadius: normalize(16),
    backgroundColor: colors.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.textTertiary,
  },
  cameraCardEmptyIcon: {
    height: normalize(80),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCardEmptyText: {
    fontSize: normalize(12),
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
    marginTop: normalize(8),
  },

  // Events Section
  recentEvents: {
    marginTop: normalize(10),
  },
  recentEventsTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: normalize(12),
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(16),
    marginBottom: normalize(10),
    backgroundColor: '#fff',
    borderRadius: normalize(16),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  eventIconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  eventIconInfo: {
    backgroundColor: colors.info,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: normalize(4),
  },
  eventDescription: {
    fontSize: normalize(12),
    color: colors.textTertiary,
  },

  // New styles for WebView integration
  streamWebView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  webViewLoadingText: {
    color: '#fff',
    fontSize: normalize(14),
    marginTop: normalize(12),
    fontWeight: '500',
  },
  closeLoadingButton: {
    marginTop: normalize(20),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(16),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: normalize(20),
  },
  closeLoadingText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: normalize(13),
  },
  videoErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  videoErrorText: {
    color: '#fff',
    fontSize: normalize(14),
    marginTop: normalize(10),
    textAlign: 'center',
  },

  settingsButton: {
    borderColor: colors.primary,
    borderWidth: 1,
  },

  // Offline camera styles
  offlineRetryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(20),
    marginTop: normalize(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  offlineRetryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: normalize(14),
  },

  // Thêm style cho trường hợp không có camera nào
  noCameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(40),
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: normalize(16),
    marginTop: normalize(10),
  },
  noCameraText: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: normalize(16),
  },
  noCameraSubText: {
    fontSize: normalize(14),
    color: colors.textTertiary,
    marginTop: normalize(8),
    textAlign: 'center',
    paddingHorizontal: normalize(20),
  },

  // Camera error display styles
  cameraErrorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  cameraErrorTitle: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginTop: normalize(15),
    textAlign: 'center'
  },
  cameraErrorMessage: {
    color: '#ccc',
    fontSize: normalize(14),
    marginTop: normalize(8),
    textAlign: 'center',
    paddingHorizontal: normalize(20),
    lineHeight: normalize(20),
  },
  cameraButtonDisabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  
  // Offload WebView error styles
  webViewError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  webViewErrorIcon: {
    marginBottom: normalize(15),
  },
  webViewErrorText: {
    color: '#fff',
    fontSize: normalize(14),
    textAlign: 'center',
    marginBottom: normalize(20),
  },

  // Add this new style for icons
  iconWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(10),
  },

  // Add this new style for fullscreen button
  fullscreenButton: {
    position: 'absolute',
    right: normalize(16),
    top: normalize(16),
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});