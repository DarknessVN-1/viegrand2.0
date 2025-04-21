import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Công cụ debug thông tin người dùng, ID và dữ liệu AsyncStorage
 */
export const userDebugger = {
  /**
   * Kiểm tra và in ra thông tin người dùng từ bộ nhớ
   */
  async debugUserData(user) {
    try {
      console.log('\n===== USER DEBUG INFO =====');
      
      // 1. Kiểm tra user từ context
      console.log('User data from context:', user ? {
        user_id: user.user_id,
        id: user.id,
        username: user.username,
        email: user.email,
        allFields: Object.keys(user)
      } : 'No user in context');
      
      // 2. Kiểm tra AsyncStorage
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        console.log('User data in AsyncStorage:', {
          user_id: userData.user_id,
          id: userData.id,
          username: userData.username,
          email: userData.email,
          allFields: Object.keys(userData)
        });
      } else {
        console.log('No user data found in AsyncStorage');
      }
      
      console.log('===== END DEBUG INFO =====\n');
    } catch (error) {
      console.error('Error in debugUserData:', error);
    }
  },
  
  /**
   * Kiểm tra API với userID
   */
  async testAPI(user) {
    try {
      console.log('\n===== API TEST WITH USER ID =====');
      
      if (!user) {
        console.log('No user provided, cannot test API');
        return;
      }
      
      // Sử dụng ID đầy đủ
      const testUserID = user.user_id || user.id;
      console.log(`Testing with full user_id: ${testUserID}`);
      
      // Test API với user_id đầy đủ
      try {
        const url = `https://viegrand.site/api/get_emegency.php?user_id=${testUserID}`;
        console.log(`Request URL: ${url}`);
        const response = await fetch(url);
        const text = await response.text();
        console.log('Response with full ID:', text);
        
        try {
          const json = JSON.parse(text);
          console.log('Parsed emergency data:', json);
          
          // Kiểm tra ID trả về có khớp với ID gốc không
          if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
            const returnedId = json.data[0].user_id;
            if (returnedId !== testUserID) {
              console.warn('⚠️ WARNING: Returned user_id does not match! Backend might be truncating ID');
              console.log(`Original: ${testUserID}`);
              console.log(`Returned: ${returnedId}`);
            }
          }
        } catch (parseError) {
          console.log('Could not parse as JSON');
        }
      } catch (error) {
        console.error('Error calling emergency API:', error);
      }
      
      console.log('===== END API TEST =====\n');
    } catch (error) {
      console.error('Error in testAPI:', error);
    }
  },
  
  /**
   * Fix lỗi tương thích user_id/id
   */
  async syncUserIDs() {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) return false;
      
      const userData = JSON.parse(storedUserData);
      let updated = false;
      
      // Nếu không có user_id, thêm từ id
      if (!userData.user_id && userData.id) {
        userData.user_id = userData.id;
        updated = true;
        console.log("Added user_id from id");
      }
      
      // Nếu không có id, thêm từ user_id
      if (!userData.id && userData.user_id) {
        userData.id = userData.user_id;
        updated = true;
        console.log("Added id from user_id");
      }
      
      if (updated) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log("User data updated and saved");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in syncUserIDs:', error);
      return false;
    }
  }
};

/**
 * Kiểm tra ID đã được chuẩn hóa chưa
 */
function normalizeUserId(userId) {
  if (userId && typeof userId === 'string') {
    const numericPart = userId.match(/^(\d+)/);
    if (numericPart && numericPart[1]) {
      return numericPart[1]; 
    }
  }
  return userId;
}
