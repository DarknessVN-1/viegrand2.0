import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, { useState } from "react";
import { Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from '../../../theme/colors';
import { metrics, normalize } from "../../../utils/responsive";
import { notificationService } from "../../../services/notificationService";

const DialogEditMedicine = ({ closed, medicine, onSuccess }) => {
  const [time, setTime] = useState(new Date(0, 0, 0, medicine.hour, medicine.minutes));
  const [popChooseDate, setPopChooseDate] = useState(false);
  const [note, setNote] = useState(medicine.note);
  const [sound, setSound] = useState(medicine.music === "1");
  const [reNotification, setReNotification] = useState(medicine.replay === "1");
  const [error, setError] = useState('');

  const onChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setPopChooseDate(false);
    setTime(currentTime);
  };

  const handleSubmitEdit = async () => {
    try {
      const updatedMedicine = {
        id: medicine.id,
        note,
        hour: moment(time).get('hour'),
        minutes: moment(time).get('minute'),
        music: sound ? 1 : 0,
        replay: reNotification ? 1 : 0
      };

      const response = await fetch(`https://viegrand.site/api/update-medicine.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(updatedMedicine)
      });

      const data = await response.json();
      if (data.success) {
        // Update the notification if medicine is active
        if (medicine.status === "1") {
          // Cancel the old notification
          await notificationService.cancelNotification(`medicine-${medicine.id}`);
          
          // Schedule the updated notification
          const notificationMedicine = {
            ...updatedMedicine,
            music: sound ? "1" : "0",
            replay: reNotification ? "1" : "0",
            status: medicine.status
          };
          
          await notificationService.scheduleMedicationReminder(notificationMedicine);
        }
        
        onSuccess();
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (error) {
      console.error(error);
      setError('Error updating medicine');
    }
  };

  const handleDelete = async () => {
    try {
      // Cancel the notification before deleting the medicine
      await notificationService.cancelNotification(`medicine-${medicine.id}`);
      
      const response = await fetch(`https://viegrand.site/api/delete-medicine.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          id: medicine.id,
          user_id: medicine.user_id
        })
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error(error);
      setError('Error deleting medicine');
    }
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
          <Text style={styles.modalText}>Sửa lịch nhắc</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TouchableOpacity onPress={() => setPopChooseDate(!popChooseDate)} style={styles.viewInput}>
            <Text style={styles.textInput}>{moment(time).format('HH:mm')}</Text>
            <AntDesign name='right' size={15} color={colors.black} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            multiline={true}
            numberOfLines={2}
            value={note}
            onChangeText={(e) => {
              setNote(e)
              setError('')
            }}
            placeholder="Nhập ghi chú..."
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Âm thanh</Text>
            <Switch
              trackColor={{ false: "#767577", true: colors.primaryLight }}
              thumbColor={sound ? colors.primaryDark : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setSound}
              value={sound}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Báo lại</Text>
            <Switch
              trackColor={{ false: "#767577", true: colors.primaryLight }}
              thumbColor={reNotification ? colors.primaryDark : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setReNotification}
              value={reNotification}
            />
          </View>

          <View style={styles.containerButton}>
            <TouchableOpacity style={styles.continueButton} onPress={handleSubmitEdit}>
              <Text style={styles.continueText}>Cập nhật</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteText}>Xóa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={closed}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {popChooseDate && (
          <DateTimePicker
            value={time}
            mode="time"
            display="spinner"
            onChange={onChange}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: colors.input.placeholder,
    height: normalize(40),
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textInput: {
    fontSize: metrics.caption,
    color: colors.black
  },
  input: {
    height: normalize(100),
    borderColor: '#ccc',
    borderWidth: normalize(1),
    borderRadius: normalize(8),
    width: '100%',
    padding: normalize(10),
    textAlignVertical: 'top',
    marginTop: 10
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15
  },
  switchLabel: {
    fontSize: metrics.caption,
    color: colors.black
  },
  containerButton: {
    justifyContent: 'space-between',
    alignItems: "center",
    flexDirection: 'row',
    width: '100%',
    marginTop: 15,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5
  },
  deleteText: {
    color: "#fff",
    fontSize: normalize(14),
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5
  },
  continueText: {
    color: "#fff",
    fontSize: normalize(14),
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#d3d3d3",
    borderRadius: 8,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5
  },
  cancelText: {
    color: "#000",
    fontSize: normalize(14),
    fontWeight: "bold",
  },
  errorText: {
    color: 'red',
    marginBottom: metrics.smallSpace,
    textAlign: 'center',
  },
});

export default DialogEditMedicine;
