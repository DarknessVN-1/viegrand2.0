import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { normalize } from '../../utils/responsive';

export default function PaymentScreen({ navigation, route }) {
  const { plan } = route.params || { plan: 'monthly' };
  const { updatePremiumStatus } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format prices based on plan
  const getPlanPrice = () => {
    switch(plan) {
      case 'monthly': return 119000;
      case 'quarterly': return 299000;
      case 'yearly': return 999000;
      default: return 119000;
    }
  };

  const handlePayment = async () => {
    // Basic validation
    if (paymentMethod === 'card' && (!cardNumber || !cardName || !expiryDate || !cvv)) {
      Alert.alert('Thông tin thiếu', 'Vui lòng điền đầy đủ thông tin thẻ');
      return;
    }

    // Simulate payment processing
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update premium status in auth context
      await updatePremiumStatus(true);
      
      // Navigate to success screen
      navigation.navigate('PaymentSuccess');
    } catch (error) {
      Alert.alert('Lỗi thanh toán', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Tổng quan đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gói Premium</Text>
            <Text style={styles.summaryValue}>{plan === 'monthly' ? 'Hàng tháng' : 
              (plan === 'quarterly' ? '3 tháng' : '12 tháng')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giá</Text>
            <Text style={styles.summaryValue}>{getPlanPrice().toLocaleString()} VND</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{getPlanPrice().toLocaleString()} VND</Text>
          </View>
        </View>

        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          
          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'card' && styles.selectedMethod]}
            onPress={() => setPaymentMethod('card')}
          >
            <MaterialCommunityIcons name="credit-card" size={24} color="#2E7D32" />
            <Text style={styles.methodText}>Thẻ tín dụng / Ghi nợ</Text>
            <MaterialCommunityIcons 
              name={paymentMethod === 'card' ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
              size={24} 
              color="#2E7D32" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'banking' && styles.selectedMethod]}
            onPress={() => setPaymentMethod('banking')}
          >
            <MaterialCommunityIcons name="bank" size={24} color="#2E7D32" />
            <Text style={styles.methodText}>Internet Banking</Text>
            <MaterialCommunityIcons 
              name={paymentMethod === 'banking' ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
              size={24} 
              color="#2E7D32" 
            />
          </TouchableOpacity>
        </View>

        {paymentMethod === 'card' && (
          <View style={styles.cardDetails}>
            <Text style={styles.sectionTitle}>Thông tin thẻ</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số thẻ</Text>
              <TextInput 
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
              <TextInput 
                style={styles.input}
                placeholder="NGUYEN VAN A"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Hạn sử dụng</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {paymentMethod === 'banking' && (
          <View style={styles.bankingInfo}>
            <Text style={styles.sectionTitle}>Hướng dẫn chuyển khoản</Text>
            <Text style={styles.bankingInstructions}>
              Vui lòng chuyển khoản đến tài khoản sau và nhập mã giao dịch:
            </Text>
            <View style={styles.bankDetails}>
              <Text style={styles.bankDetailText}>Ngân hàng: VPBank</Text>
              <Text style={styles.bankDetailText}>Số tài khoản: 123456789012</Text>
              <Text style={styles.bankDetailText}>Tên: CONG TY FUJI APP</Text>
              <Text style={styles.bankDetailText}>Nội dung: FUJI [Số điện thoại của bạn]</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.paymentButton, isLoading && styles.paymentButtonDisabled]}
          onPress={handlePayment}
          disabled={isLoading}
        >
          <Text style={styles.paymentButtonText}>
            {isLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  orderSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: normalize(15),
    color: '#666666',
  },
  summaryValue: {
    fontSize: normalize(15),
    color: '#000000',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#000000',
  },
  totalValue: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#2E7D32',
  },
  paymentMethods: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedMethod: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  methodText: {
    flex: 1,
    marginLeft: 12,
    fontSize: normalize(15),
    color: '#000000',
  },
  cardDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: normalize(14),
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: normalize(15),
  },
  rowInputs: {
    flexDirection: 'row',
  },
  paymentButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  paymentButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  bankingInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bankingInstructions: {
    fontSize: normalize(14),
    color: '#666666',
    marginBottom: 16,
  },
  bankDetails: {
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  bankDetailText: {
    fontSize: normalize(14),
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
});
