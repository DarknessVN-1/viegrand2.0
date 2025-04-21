import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normalize } from '../../utils/responsive';

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.questionContainer} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
          <MaterialCommunityIcons name="chevron-down" size={24} color="#666666" />
        </Animated.View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function FAQScreen() {
  const faqCategories = [
    {
      title: "Tài khoản & Bảo mật",
      icon: "shield-account",
      faqs: [
        {
          question: "Làm thế nào để thay đổi thông tin cá nhân?",
          answer: "Bạn có thể thay đổi thông tin cá nhân bằng cách:\n\n1. Vào phần Cài đặt\n2. Chọn Hồ sơ cá nhân\n3. Nhấn vào thông tin cần thay đổi\n4. Cập nhật và lưu thông tin mới"
        },
        {
          question: "Quên mật khẩu phải làm sao?",
          answer: "Để khôi phục mật khẩu:\n\n1. Nhấn 'Quên mật khẩu' tại màn hình đăng nhập\n2. Nhập email đã đăng ký\n3. Làm theo hướng dẫn trong email được gửi đến"
        }
      ]
    },
    {
      title: "Theo dõi Sức khỏe",
      icon: "heart-pulse",
      faqs: [
        {
          question: "Cách nhập chỉ số sức khỏe hàng ngày?",
          answer: "Để nhập chỉ số sức khỏe:\n\n1. Vào tab Sức khỏe\n2. Chọn '+' để thêm chỉ số mới\n3. Chọn loại chỉ số và nhập giá trị\n4. Nhấn Lưu để cập nhật"
        }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="frequently-asked-questions" size={32} color="#2E7D32" />
        <Text style={styles.headerTitle}>Câu hỏi thường gặp</Text>
        <Text style={styles.headerSubtitle}>Tìm câu trả lời nhanh cho các thắc mắc của bạn</Text>
      </View>
      <View style={styles.content}>
        {faqCategories.map((category, index) => (
          <View key={index} style={styles.category}>
            <View style={styles.categoryHeader}>
              <MaterialCommunityIcons name={category.icon} size={24} color="#2E7D32" />
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>
            {category.faqs.map((faq, idx) => (
              <FAQItem
                key={idx}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: normalize(16),
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    marginRight: 16,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
  },
  answerText: {
    fontSize: normalize(14),
    color: '#666666',
    lineHeight: normalize(20),
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  headerTitle: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: normalize(15),
    color: '#2E7D32',
    textAlign: 'center',
  },
  category: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#1B5E20',
    marginLeft: 8,
  }
});
