import { useIsFocused, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme/colors";
import { metrics, normalize } from "../../utils/responsive";

const IntroView = () => {

  const isFocus = useIsFocused();

  const navigation = useNavigation()

  useEffect(() => {
    if (isFocus) {
      StatusBar.setBackgroundColor(colors.primaryDark)
      StatusBar.setBarStyle('light-content')
    } else {
      StatusBar.setBackgroundColor(colors.background)
      StatusBar.setBarStyle('dark-content')
    }
  }, [isFocus])

  const handleSignin = () => {
    navigation.navigate('Signin')
  }

  const handleSignup = () => {
    navigation.navigate('Signup')
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        // Background Linear Gradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
        style={styles.background}
      />
      <View style={styles.viewTitle}>
        <Text style={styles.titleText}>Wellcome</Text>
      </View>

      <View style={styles.viewCenter}>
        <Image
          source={require('../../assets/intro-logo.png')}
          style={styles.imageCenter}
          resizeMode="contain"
        />
      </View>

      <View style={styles.viewFotter}>
        <Text style={[styles.titleFooter]}>
          Chào Mừng Đến Với VieCare
        </Text>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.textSubtitle}>Luôn luôn đồng hành và chăm sóc</Text>
          <Text style={styles.textSubtitle}>gia đình nhỏ của bạn</Text>
        </View>

        <TouchableOpacity onPress={handleSignup} style={styles.buttonSignup}>
          <Text style={styles.textButtonSignup}>Đăng ký</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => handleSignin()}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: Dimensions.get('screen').height * 1,
  },
  titleText: {
    fontSize: metrics.inputHeightMinium,
    color: colors.background,
    fontWeight: 'bold'
  },
  viewTitle: {
    paddingHorizontal: normalize(30),
    height: normalize(Dimensions.get('screen').width * 0.2),
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  viewCenter: {
    alignItems: 'center', justifyContent: 'center', width: '100%', height: normalize(Dimensions.get('screen').height * 0.4)
  },
  imageCenter: {
    width: '90%',
    height: normalize(150)
  },
  viewFotter: {
    height: normalize(Dimensions.get('screen').height * 0.4),
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  titleFooter: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: metrics.title,
    marginBottom: normalize(10)
  },
  textSubtitle: {
    color: colors.background,
    fontSize: metrics.caption,
    fontWeight: '600'
  },
  buttonSignup: {
    backgroundColor: colors.background, width: '80%', marginTop: normalize(20), alignItems: 'center', justifyContent: 'center', paddingVertical: normalize(10),
    borderRadius: 10
  },
  textButtonSignup: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: metrics.body
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: metrics.largeSpace,
    alignItems: 'center'
  },
  footerText: {
    color: colors.background,
    fontSize: metrics.caption,
  },
  footerLink: {
    color: colors.background,
    fontSize: metrics.caption,
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
})

export default IntroView;