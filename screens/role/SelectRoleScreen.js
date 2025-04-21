import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { normalize, metrics } from '../../utils/responsive';
import { colors } from '../../theme/colors';

const ROLES = {
  ELDERLY: 'elderly',
  RELATIVE: 'relative'
};

export default function SelectRoleScreen({ navigation }) {
  const { updateUserRole } = useAuth();

  const handleSelectRole = async (role) => {
    try {
      await updateUserRole(role);
      navigation.replace(role === 'elderly' ? 'ElderlyHome' : 'RelativeHome');
    } catch (error) {
      console.error('Error setting role:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.background}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Bạn là ai?</Text>
        <Text style={styles.subtitle}>Chọn vai trò của bạn để tiếp tục</Text>

        <TouchableOpacity 
          style={styles.roleCard}
          onPress={() => handleSelectRole(ROLES.ELDERLY)}
        >
          <MaterialCommunityIcons 
            name="account-circle" 
            size={60} 
            color={colors.primary}
          />
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>Người cao tuổi</Text>
            <Text style={styles.roleDescription}>
              Dành cho người cần được chăm sóc và theo dõi
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.roleCard}
          onPress={() => handleSelectRole(ROLES.RELATIVE)}
        >
          <MaterialCommunityIcons 
            name="account-heart" 
            size={60} 
            color={colors.primary}
          />
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>Người thân</Text>
            <Text style={styles.roleDescription}>
              Dành cho người muốn chăm sóc và theo dõi người thân
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: metrics.padding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: normalize(120),
    height: normalize(120),
    marginBottom: metrics.largeSpace,
  },
  title: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: metrics.smallSpace,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: normalize(16),
    color: colors.textSecondary,
    marginBottom: metrics.xlargeSpace,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: metrics.borderRadius,
    padding: metrics.largeSpace,
    marginBottom: metrics.largeSpace,
    width: '100%',
    ...metrics.shadowStrong,
  },
  roleInfo: {
    flex: 1,
    marginLeft: metrics.largeSpace,
  },
  roleName: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: metrics.smallSpace,
  },
  roleDescription: {
    fontSize: normalize(14),
    color: colors.textSecondary,
  },
});
