import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { metrics, normalize } from '../../utils/responsive';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export default function NotificationDetailScreen({ route, navigation }) {
  const { medicineId } = route.params || {};
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Lấy thông tin chi tiết về thuốc cần uống
  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://viegrand.site/api/get-medicine-detail.php`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: medicineId,
            user_id: user.user_id
          })
        });
        
        const data = await response.json();
        if (data.success && data.data) {
          setMedicine(data.data);
        } else {
          setError('Không tìm thấy thông tin thuốc');
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi tải thông tin');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (medicineId) {
      fetchMedicineDetails();
    } else {
      setError('Không có ID thuốc');
      setLoading(false);
    }
  }, [medicineId]);

  // Xử lý khi đã uống thuốc
  const handleTakeMedication = async () => {
    try {
      setLoading(true);
      const result = await notificationService.markMedicationAsTaken(medicineId, user.user_id);
      
      if (result.success) {
        navigation.goBack();
      } else {
        setError('Không thể đánh dấu đã uống thuốc');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi báo lại sau
  const handleSnooze = async () => {
    if (medicine) {
      await notificationService.scheduleSnoozeReminder(medicine, 10);
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Nhắc nhở uống thuốc</Text>
      </LinearGradient>

      {error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={60} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.medicineInfoContainer}>
            <MaterialCommunityIcons name="pill" size={50} color={colors.primary} />
            <Text style={styles.timeText}>{medicine?.hour || '00'}:{medicine?.minutes || '00'}</Text>
            <Text style={styles.medicineText}>{medicine?.note}</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleTakeMedication}
            >
              <MaterialCommunityIcons name="check-circle" size={24} color="white" />
              <Text style={styles.primaryButtonText}>Đã uống thuốc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSnooze}
            >
              <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Báo lại sau</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: normalize(50),
    paddingBottom: normalize(20),
    alignItems: 'center',
    borderBottomLeftRadius: normalize(20),
    borderBottomRightRadius: normalize(20),
  },
  headerTitle: {
    fontSize: metrics.title,
    fontWeight: 'bold',
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: normalize(20),
    justifyContent: 'space-between',
  },
  medicineInfoContainer: {
    alignItems: 'center',
    paddingTop: normalize(40),
  },
  timeText: {
    fontSize: normalize(36),
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginTop: normalize(20),
  },
  medicineText: {
    fontSize: metrics.body,
    color: colors.textSecondary,
    marginTop: normalize(10),
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: normalize(10),
  },
  button: {
    borderRadius: normalize(10),
    paddingVertical: normalize(15),
    paddingHorizontal: normalize(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: metrics.body,
    marginLeft: normalize(10),
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: metrics.body,
    marginLeft: normalize(10),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  errorText: {
    fontSize: metrics.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: normalize(20),
  }
});
