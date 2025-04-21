export const notificationConfig = {
  // Thời gian (phút) cho nhắc nhở trước khi uống thuốc
  REMINDER_ADVANCE_TIME: 5,
  
  // Thời gian (phút) báo lại nếu không nhận phản hồi
  REMINDER_SNOOZE_TIME: 10,
  
  // Số lần tối đa báo lại
  MAX_REMINDER_REPEATS: 3,
  
  // Các loại thông báo
  NOTIFICATION_TYPES: {
    MEDICATION: 'medication',
    EXERCISE: 'exercise',
    GENERAL: 'general'
  },
  
  // Đường dẫn đến các âm thanh thông báo
  SOUNDS: {
    DEFAULT: 'default',
    MEDICATION: require('../assets/sounds/sound.mp3')
  }
};
