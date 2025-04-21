import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { metrics } from '../utils/responsive';
import { colors } from '../theme/colors';

export default function FloatingLabelInput({
  label,
  icon,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  placeholder = '',
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  return (
    <Animated.View style={[styles.container, isFocused && styles.focused]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={isFocused ? '#4CAF50' : '#757575'}
          style={styles.icon}
        />
      </View>

      <View style={styles.inputContainer}>
        <Animated.Text style={[
          styles.label,
          {
            transform: [{
              translateY: animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -28] // Điều chỉnh vị trí dọc
              })
            }],
            fontSize: animatedIsFocused.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 12]
            }),
            color: animatedIsFocused.interpolate({
              inputRange: [0, 1],
              outputRange: ['#757575', '#4CAF50']
            })
          }
        ]}>
          {label}
        </Animated.Text>
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            !isFocused && !value && styles.inputWithPlaceholder
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={colors.input.placeholder}
          blurOnSubmit
        />
      </View>

      {secureTextEntry && (
        <TouchableOpacity 
          style={styles.visibilityToggle}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={22}
            color={isFocused ? '#4CAF50' : '#757575'}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: metrics.inputHeight,
    borderRadius: metrics.inputRadius,
    marginVertical: metrics.baseSpace,
    paddingHorizontal: metrics.inputPadding,
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...metrics.shadowBase,
  },
  focused: {
    borderColor: colors.input.borderFocused,
    borderWidth: 2,
    ...metrics.shadowStrong,
  },
  iconContainer: {
    marginRight: metrics.mediumSpace,
    height: '100%',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  input: {
    fontSize: metrics.inputFontSize,
    color: colors.input.text,
    paddingVertical: metrics.baseSpace,
    height: '100%',
  },
  inputWithPlaceholder: {
    color: 'transparent', // Ẩn text khi có placeholder
  },
  label: {
    fontSize: metrics.labelFontSize,
    position: 'absolute',
    backgroundColor: colors.input.background,
    paddingHorizontal: metrics.smallSpace,
    color: colors.input.label,
    left: -4,
    top: '50%',  // Căn giữa theo chiều dọc
    transform: [{ translateY: -12 }], // Điều chỉnh vị trí chính xác
    zIndex: 1,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  icon: {
    marginTop: 2,
  },
});
