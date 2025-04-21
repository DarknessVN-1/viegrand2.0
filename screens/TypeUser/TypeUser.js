import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { metrics, normalize } from '../../utils/responsive';

const TypeUserScreen = ({ route }) => {

  const { typeUseBottomTab } = useAuth();

  const navigation = useNavigation()

  const handleGoToView = async (type) => {
    await typeUseBottomTab(type)
    navigation.replace('Splash')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="always"
      >
        <Image
          source={require('../../assets/header-group.png')}
          style={styles.header_logo}
          resizeMode="stretch"
        />
        <View style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Chọn vai trò</Text>
          </View>

          <TouchableOpacity onPress={() => handleGoToView('relative')} style={[styles.buttonWhite, { backgroundColor: colors.background }]}>
            <Text style={[styles.textButtonWhite]}>Người thân</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleGoToView('elderly')} style={[styles.buttonWhite, { backgroundColor: colors.background }]}>
            <Text style={[styles.textButtonWhite]}>Người sử dụng</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: metrics.padding,
  },
  mainContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? metrics.xxlargeSpace : metrics.xlargeSpace,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: metrics.xlargeSpace,
  },
  logo: {
    width: normalize(120),
    height: normalize(120),
    marginBottom: metrics.largeSpace,
  },
  header_logo: {
    width: Dimensions.get('screen').width * 1,
    height: normalize(200),
    marginBottom: metrics.largeSpace,
  },
  welcomeText: {
    fontSize: metrics.largeTitle,
    fontWeight: '700',
    color: colors.black,
    marginBottom: metrics.baseSpace,
  },
  subtitleText: {
    fontSize: metrics.caption,
    color: colors.black,
    marginBottom: metrics.mediumSpace,
  },
  buttonWhite: {
    marginHorizontal: normalize(30),
    textAlign: 'center',
    height: normalize(45),
    ...metrics.shadowStrong,
    marginVertical: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(10)
  },
  textButtonWhite: {
    color: colors.black,
    fontSize: metrics.body,
    fontWeight: '700'
  },
  buttonColors: {
    marginHorizontal: normalize(30),
    textAlign: 'center',
    height: normalize(45),
    ...metrics.shadowStrong,
    marginVertical: normalize(10),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(10)
  },
  textButtonColors: {
    color: colors.background,
    fontSize: metrics.body,
    fontWeight: '700'
  }
});


export default TypeUserScreen