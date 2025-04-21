import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { normalize } from '../../utils/responsive';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Slightly nicer background color
  },
  headerView: {
    height: Platform.OS === 'android' ? normalize(70) + (StatusBar.currentHeight || 0) : normalize(70),
    width: '100%',
    backgroundColor: colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(15),
  },
  backButton: {
    position: 'absolute',
    left: normalize(15),
    padding: normalize(5),
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  rightPlaceholder: {
    width: normalize(40),
    height: normalize(40),
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: normalize(20),
    paddingTop: normalize(28),
  },
  formGroup: {
    marginBottom: normalize(24),
  },
  formLabel: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: normalize(8),
    paddingLeft: normalize(2),
    letterSpacing: 0.3,
  },
  formInput: {
    height: normalize(55),
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(15),
    fontSize: normalize(16),
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  formHelper: {
    fontSize: normalize(13),
    color: colors.textTertiary,
    marginTop: normalize(6),
    marginLeft: normalize(6),
  },
  formSelect: {
    height: normalize(55),
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  formSelectText: {
    fontSize: normalize(16),
    color: colors.textPrimary,
  },
  formSelectPlaceholder: {
    color: colors.textTertiary,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(20),
    marginBottom: normalize(30),
  },
  formButton: {
    flex: 1,
    height: normalize(55),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  formButtonPrimary: {
    backgroundColor: colors.primary,
    marginLeft: normalize(10),
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    marginRight: normalize(10),
  },
  formButtonPrimaryText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  formButtonSecondaryText: {
    color: colors.textPrimary,
    fontSize: normalize(16),
    fontWeight: '500',
  },
  formButtonIcon: {
    marginRight: normalize(8),
  },
  formSectionTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: normalize(18),
    marginTop: normalize(10),
  },
  formDivider: {
    height: 1,
    backgroundColor: '#E9ECF0',
    marginVertical: normalize(20),
  },
  formInfoBox: {
    backgroundColor: 'rgba(111, 149, 248, 0.1)',
    borderRadius: normalize(10),
    padding: normalize(15),
    marginBottom: normalize(24),
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  formInfoText: {
    color: colors.primaryDark,
    fontSize: normalize(14),
    lineHeight: normalize(20),
  },
  // Animation styling
  fadeIn: {
    opacity: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
    paddingLeft: normalize(2),
  },
  sectionIcon: {
    marginRight: normalize(8),
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: colors.primaryDark,
  },
});
