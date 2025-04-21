// MOCK IMPLEMENTATION: This service has been disabled due to library conflicts.

import { Platform } from 'react-native';

export const notificationService = {
  // Mock implementation of request permissions
  async requestPermissions() {
    console.log('[MOCK] Notification permissions requested');
    return false;
  },

  // Mock implementation of scheduling medication reminder
  async scheduleMedicationReminder(medicine) {
    console.log('[MOCK] Scheduled medication reminder for:', medicine);
    return null;
  },

  // Mock implementation of canceling notification
  async cancelNotification(identifier) {
    console.log('[MOCK] Canceled notification with ID:', identifier);
    return true;
  },

  // Mock implementation of canceling all notifications
  async cancelAllNotifications() {
    console.log('[MOCK] Canceled all notifications');
    return true;
  },

  // Mock implementation of getting all scheduled notifications
  async getAllScheduledNotifications() {
    console.log('[MOCK] Getting all scheduled notifications');
    return [];
  },

  // Mock implementation of scheduling snooze reminder
  async scheduleSnoozeReminder(medicine, minutes = 10) {
    console.log('[MOCK] Scheduled snooze reminder for:', medicine);
    return null;
  },
  
  // Mock implementation of checking if notification exists
  async checkIfNotificationExists(identifier) {
    console.log('[MOCK] Checking if notification exists:', identifier);
    return false;
  },
  
  // Mock implementation of marking medication as taken
  async markMedicationAsTaken(id, userId) {
    console.log('[MOCK] Marking medication as taken:', id, userId);
    
    try {
      // Still attempt to call the API, just don't handle notifications
      const response = await fetch('https://viegrand.site/api/mark-medicine-taken.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          user_id: userId,
          taken: 1,
          date: new Date().toISOString()
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      return { success: false };
    }
  }
};
