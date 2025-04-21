import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View, TouchableOpacity } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { colors } from "../../../theme/colors";
import { metrics, normalize } from "../../../utils/responsive";
import DialogEditMedicine from "./DialogEditMedicine";
import { notificationService } from "../../../services/notificationService";

const MedicineComponent = React.forwardRef((props, ref) => {

  const { user } = useAuth()

  const [dataMedicine, setDataMedicine] = useState([])
  const [editingMedicine, setEditingMedicine] = useState(null);

  useEffect(() => {
    handleGetMedicine()
  }, [])

  // Handle notifications when medicines change
  useEffect(() => {
    updateAllNotifications();
  }, [dataMedicine]);

  // Function to schedule notifications for all active medicines
  const updateAllNotifications = async () => {
    try {
      // Cancel all existing notifications first
      await notificationService.cancelAllNotifications();
      
      // Schedule notifications for active medicines only
      const activeMedicines = dataMedicine.filter(med => med.status === "1");
      
      for (const medicine of activeMedicines) {
        await notificationService.scheduleMedicationReminder(medicine);
      }
      
      console.log(`Scheduled notifications for ${activeMedicines.length} medicines`);
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const handleGetMedicine = async () => {
    try {
      const response = await fetch(`https://viegrand.site/api/get-medicine.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          username: user.username,
          user_id: user.user_id
        })
      });
      
      const data = await response.json();

      if (data.success) {
        setDataMedicine(data.data);
      }
    } catch (error) {
      console.error('Error fetching medicine data:', error);
    }
  }

  const handleChangeActive = async (itemMedicine, val, e) => {
    // Ngăn sự kiện touch lan truyền khi bấm switch
    e && e.stopPropagation();
    
    try {
      // Cập nhật UI trước
      const newData = dataMedicine.map(item => {
        if (item.id === itemMedicine.id) {
          return {...item, status: val ? "1" : "0"}
        }
        return item
      });
      setDataMedicine(newData);

      // Xử lý notification khi trạng thái thay đổi
      const updatedMedicine = {...itemMedicine, status: val ? "1" : "0"};
      
      if (val) {
        // Nếu bật thông báo, schedule notification
        await notificationService.scheduleMedicationReminder(updatedMedicine);
      } else {
        // Nếu tắt thông báo, cancel notification
        await notificationService.cancelNotification(`medicine-${itemMedicine.id}`);
      }

      // Gọi API để cập nhật status
      const response = await fetch(`https://viegrand.site/api/update-medicine-status.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          id: itemMedicine.id,
          status: val ? 1 : 0,
          user_id: user.user_id
        })
      });

      // Check if response is valid JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API did not return JSON");
      }
      
      const data = await response.json();
      if (!data.success) {
        // Nếu API fail, rollback lại UI
        setDataMedicine(dataMedicine);
        
        // Và hủy notification nếu vừa schedule
        if (val) {
          await notificationService.cancelNotification(`medicine-${itemMedicine.id}`);
        }
      }

    } catch (error) {
      console.error('Error updating medicine status:', error);
      // Nếu có lỗi, rollback lại UI
      setDataMedicine(dataMedicine);
    }
  }

  const handleEdit = (medicine) => {
    console.log('Editing medicine:', medicine);
    setEditingMedicine(medicine);
  };

  // Expose refresh method
  React.useImperativeHandle(ref, () => ({
    refresh: () => {
      handleGetMedicine();
    }
  }));

  return (
    <View style={{ marginHorizontal: normalize(20) }}>
      {dataMedicine.map((itemMedicine) => {
        return (
          <TouchableOpacity 
            key={itemMedicine.id} 
            style={styles.itemMedicine}
            onPress={() => handleEdit(itemMedicine)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: metrics.title, color: colors.black }}>
                {itemMedicine?.hour || '00'}:{itemMedicine?.minutes || '00'}
              </Text>
              <Text style={{ fontSize: metrics.body, color: colors.input.placeholder }}>
                {itemMedicine.note}
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: colors.primaryLight }}
              thumbColor={itemMedicine.status === "1" ? colors.primaryDark : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(val) => handleChangeActive(itemMedicine, val)}
              value={itemMedicine.status === "1"}
            />
          </TouchableOpacity>
        )
      })}

      {editingMedicine && (
        <DialogEditMedicine
          medicine={editingMedicine}
          closed={() => setEditingMedicine(null)}
          onSuccess={() => {
            setEditingMedicine(null);
            handleGetMedicine();
          }}
        />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  itemMedicine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: normalize(15), borderWidth: 1, borderColor: colors.input.placeholder, padding: normalize(10), borderRadius: 10 }
})

export default MedicineComponent