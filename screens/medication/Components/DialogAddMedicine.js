import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, { useState } from "react";
import { Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from '../../../theme/colors';
import { metrics, normalize } from "../../../utils/responsive";
import { notificationService } from "../../../services/notificationService";

const DialogAddMedicine = ({ closed, user, onSuccess }) => {

  const [time, setTime] = useState(new Date());

  const [popChooseDate, setPopChooseDate] = useState(false)

  const [note, setNote] = useState('')

  const [sound, setSound] = useState(false)

  const [reNotification, setReNotification] = useState(false)

  const [error, setError] = useState('');

  const onChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setPopChooseDate(false)
    setTime(currentTime);
  };

  const handleSubmitAdd = async () => {

    if (note == '') {
      setNote('Please add note')
    }

    const body = {
      note,
      hour: moment(time).get('hour'),
      minutes: moment(time).get('minute'),
      music: sound ? 1 : 0,
      replay: reNotification ? 1 : 0,
      user_id: user.user_id,
      username: user.username,
      status: 1
    }

    try {
      const response = await fetch(`https://viegrand.site/api/medicine.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(body)

      });
      const data = await response.json();

      if (data.success) {
        // Schedule notification for the new medicine if it was created successfully
        if (data.id) {
          const medicineWithId = {
            ...body,
            id: data.id,
            music: sound ? "1" : "0",
            replay: reNotification ? "1" : "0",
            status: "1"
          };
          
          await notificationService.scheduleMedicationReminder(medicineWithId);
        }
        
        onSuccess(); // Gọi callback thay vì closed()
      }

    } catch (error) {
      console.log(error);
      setError('Error')
    }
  }

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={true}
      onRequestClose={closed}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Thêm lịch nhắc</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity onPress={() => setPopChooseDate(!popChooseDate)} style={styles.viewInput}>
            <Text style={styles.textInput}>{moment(time).format('HH:mm')}</Text>
            <AntDesign name='right' size={15} color={colors.black} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            multiline={true} // Cho phép nhập nhiều dòng
            numberOfLines={2} // Giới hạn số dòng
            value={note}
            onChangeText={(e) => {
              setNote(e)
              setError('')
            }}
            placeholder="Nhập ghi chú..."
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 15 }}>
            <Text style={{ fontSize: metrics.caption, color: colors.black }}>Âm thanh</Text>
            <Switch
              trackColor={{ false: "#767577", true: colors.primaryLight }} // Màu nền
              thumbColor={sound ? colors.primaryDark : "#f4f3f4"} // Màu nút
              ios_backgroundColor="#3e3e3e" // Background trên iOS
              onValueChange={setSound} // Hàm khi bật/tắt
              value={sound} // Trạng thái hiện tại
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 15 }}>
            <Text style={{ fontSize: metrics.caption, color: colors.black }}>Báo lại</Text>
            <Switch
              trackColor={{ false: "#767577", true: colors.primaryLight }} // Màu nền
              thumbColor={reNotification ? colors.primaryDark : "#f4f3f4"} // Màu nút
              ios_backgroundColor="#3e3e3e" // Background trên iOS
              onValueChange={setReNotification} // Hàm khi bật/tắt
              value={reNotification} // Trạng thái hiện tại
            />
          </View>

          <View style={styles.containerButton}>
            <TouchableOpacity style={styles.continueButton} onPress={handleSubmitAdd}>
              <Text style={styles.continueText}>Thêm</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={closed}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
        {popChooseDate && <DateTimePicker
          value={time}
          mode="time" // Chế độ 'time' để chọn thời gian
          display="spinner" // Hiển thị mặc định
          onChange={onChange}
        />}
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
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: metrics.body,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  viewInput: {
    borderWidth: 1, borderColor: colors.input.placeholder, height: normalize(40), width: '100%', alignItems: 'center', paddingHorizontal: normalize(10), borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textInput: {
    fontSize: metrics.caption,
    color: colors.black
  },
  input: {
    height: normalize(100), // Đảm bảo đủ không gian cho 3 dòng
    borderColor: '#ccc',
    borderWidth: normalize(1),
    borderRadius: normalize(8),
    width: '100%',
    padding: normalize(10),
    textAlignVertical: 'top',
    marginTop: 10
  },
  containerButton: {
    justifyContent: 'space-between',
    alignItems: "center",
    flexDirection: 'row',
    width: '100%',
    marginTop: 15
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
});
export default DialogAddMedicine