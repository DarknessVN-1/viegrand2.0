import { Entypo } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../../../theme/colors";
import { metrics, normalize } from "../../../utils/responsive";

const PopPassWord = ({ closed, user, handleSubmit }) => {


  const [formData, setFormData] = useState({
    password: ''
  });

  const [error, setError] = useState('');

  const [focusedInput, setFocusedInput] = useState(null);
  const [sercurityPassword, setSercurityPassword] = useState(true)

  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const renderInputField = (name, icon, placeholder, type = 'default', secure = false, password) => (
    <View style={{ marginBottom: 10, width: '100%' }}>
      <Text style={[styles.titleInput]}>Nhập mật khẩu của bạn</Text>
      <Animated.View style={[
        styles.inputWrapper,
        focusedInput === name && styles.inputWrapperFocused,
      ]}>
        <TextInput
          style={styles.input}
          placeholder={`Nhập ${placeholder} ...`}
          placeholderTextColor={colors.black}
          keyboardType={type}
          secureTextEntry={secure}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          value={formData[name]}
          onChangeText={(text) => updateFormData(name, text)}
        />

        {password && <TouchableOpacity onPress={() => setSercurityPassword(!sercurityPassword)} style={styles.iconSeeInput}>
          <Entypo name={sercurityPassword ? 'eye' : 'eye-with-line'} size={20} color={colors.black} />
        </TouchableOpacity>}
      </Animated.View>
    </View>
  );

  const handleContinue = () => {
    if (user.password === formData.password) {
      handleSubmit()
    } else {
      setError('Error Password')
    }
  };

  const handleCancel = () => {
    closed()
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={true}
      onRequestClose={closed}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Vui lòng xác nhận để thêm lịch nhắc</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {renderInputField('password', 'lock', 'Mật Khẩu', 'default', sercurityPassword, true)}

          <View style={styles.containerButton}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueText}>Tiếp tục</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '70%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: metrics.body,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: metrics.inputRadius,
    marginBottom: metrics.mediumSpace,
    paddingHorizontal: metrics.mediumSpace,
    height: metrics.inputHeightMinium,
    ...metrics.shadowBase,
  },
  inputWrapperFocused: {
    borderWidth: 2,
    borderColor: colors.surfaceBackground,
    ...metrics.shadowStrong,
  },
  input: {
    flex: 1,
    marginLeft: metrics.baseSpace,
    fontSize: metrics.caption,
    color: colors.black,
  },
  titleInput: {
    color: colors.input.label,
    fontSize: metrics.caption,
    marginBottom: 5
  },
  containerButton: {
    justifyContent: 'space-between',
    alignItems: "center",
    flexDirection: 'row',
    width: '100%'
  },
  continueButton: {
    backgroundColor: colors.primary, // Màu xanh
    borderRadius: 8,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5
  },
  continueText: {
    color: "#fff", // Chữ trắng
    fontSize: normalize(14),
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#d3d3d3", // Màu xám
    borderRadius: 8,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5
  },
  cancelText: {
    color: "#000", // Chữ đen
    fontSize: normalize(14),
    fontWeight: "bold",
  },
  errorText: {
    color: 'red',
    marginBottom: metrics.smallSpace,
    textAlign: 'center',
  },
})

export default PopPassWord