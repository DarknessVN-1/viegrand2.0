const API_URL = 'https://viegrand.site/api';
import { DebugHelper } from '../utils/DebugHelper';

export const EmergencyService = {
  // Lấy thiết lập cảnh báo của người dùng
  async getEmergencySettings(userId) {
    try {
      console.log("EmergencyService: Getting settings for user_id:", userId);
      
      // Sử dụng ID đầy đủ trực tiếp
      const response = await fetch(`${API_URL}/get_emegency.php?user_id=${userId}`);
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed data:", data);
        
        // Định dạng dữ liệu API 1: { "status": "success", "data": [...] }
        if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
          console.log("Format 1: Array data structure detected");
          const settings = data.data[0];
          
          // Chuyển đổi giá trị 'on' thành '1' để thống nhất 
          // (chỉ để tiện so sánh nội bộ trong app, không phải để gửi đi)
          return {
            success: true,
            data: {
              status: settings.status === 'on' ? '1' : settings.status || '0',
              sound: settings.sound === 'on' ? '1' : settings.sound || '0',
              message: settings.message === 'on' ? '1' : settings.message || '0',
              // Lưu thêm giá trị nguyên bản
              original: {
                status: settings.status || 'off',
                sound: settings.sound || 'off',
                message: settings.message || 'off'
              }
            }
          };
        }
        
        // Định dạng dữ liệu API 2: Trả về object trực tiếp
        if (data && !data.status && !data.message) {
          console.log("Format 2: Direct object structure detected");
          return {
            success: true,
            data: data
          };
        }
        
        // Nếu là lỗi hoặc không có dữ liệu
        if (data.status === 'error' || data.message === 'No records found') {
          console.log("No settings found");
          // Trả về dữ liệu mặc định nếu không tìm thấy
          return {
            success: false,
            error: data.message || "No settings found",
            data: {
              status: '0',
              sound: '0',
              message: '0'
            }
          };
        }
        
        // Các trường hợp khác
        return {
          success: false,
          error: "Unknown response format",
          data: {
            status: '0',
            sound: '0',
            message: '0'
          }
        };
      } catch (parseError) {
        console.error("Parse error:", parseError);
        return {
          success: false,
          error: "Invalid JSON response",
          data: {
            status: '0',
            sound: '0',
            message: '0'
          }
        };
      }
    } catch (error) {
      console.error('Error fetching emergency settings:', error);
      // Trả về dữ liệu mặc định nếu có lỗi
      return {
        success: false,
        error: error.message,
        data: {
          status: '0',
          sound: '0',
          message: '0'
        }
      };
    }
  },

  // Cập nhật thiết lập cảnh báo - đổi thành gửi giá trị "on"/"off" thay vì "1"/"0"
  async updateEmergencySettings(data) {
    try {
      // Sử dụng user_id đầy đủ và chuyển đổi boolean thành "on"/"off"
      const jsonData = {
        user_id: data.user_id,
        username: data.username || 'User',
        status: data.status ? 'on' : 'off',  // Đổi từ 1/0 thành on/off
        sound: data.sound ? 'on' : 'off',    // Đổi từ 1/0 thành on/off
        message: data.message ? 'on' : 'off'  // Đổi từ 1/0 thành on/off
      };
      
      console.log("Sending data with full user_id:", jsonData);
      
      // Gọi API với ID đầy đủ
      const response = await fetch(`${API_URL}/push_emegency.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData),
      });
      
      // Đọc phản hồi dưới dạng text
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      // Cố gắng parse thành JSON nếu có thể
      try {
        const jsonResponse = JSON.parse(responseText);
        return {
          success: jsonResponse.status === 'success',
          data: jsonResponse
        };
      } catch (e) {
        // Nếu không phải JSON, kiểm tra text response có chứa success không
        if (responseText.includes('success')) {
          return {
            success: true,
            data: { message: 'Settings updated successfully' }
          };
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      console.error('Error updating emergency settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Lấy danh sách liên hệ khẩn cấp
  async getEmergencyContacts(userId) {
    try {
      console.log("EmergencyService: Getting contacts for user_id:", userId);
      
      const response = await fetch(`${API_URL}/emergency_contacts.php?user_id=${userId}`);
      const responseText = await response.text();
      console.log("Raw contacts response:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed contacts data:", data);
        
        if (data.success && Array.isArray(data.data)) {
          console.log(`Found ${data.data.length} contacts`);
          
          // Format lại dữ liệu cho phù hợp với client
          return {
            success: true,
            data: data.data.map(contact => ({
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              address: contact.address || '',
              user_id: contact.user_id,
              created_at: contact.created_at
            }))
          };
        } else if (data.success && data.data && data.data.length === 0) {
          // Trường hợp không có liên hệ nào
          console.log("No contacts found for user");
          return {
            success: true,
            data: []
          };
        } else {
          // Trường hợp lỗi
          console.log("Error response from API:", data);
          return {
            success: false,
            error: data.message || "Failed to fetch contacts",
            data: []
          };
        }
      } catch (parseError) {
        console.error("Parse error for contacts:", parseError);
        // Check if response contains "No records found"
        if (responseText.includes('No records found')) {
          return {
            success: true,
            data: [],
            message: "No contacts found"
          };
        }
        
        return {
          success: false,
          error: "Invalid JSON response for contacts",
          data: []
        };
      }
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },
  
  // Thêm liên hệ khẩn cấp mới
  async addEmergencyContact(contact) {
    try {
      console.log("EmergencyService: Adding new contact:", contact);
      
      const response = await fetch(`${API_URL}/emergency_contacts.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });
      
      // Get text response for debugging
      const responseText = await response.text();
      console.log("Add contact response text:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed add contact response:", data);
        return {
          success: data.success || data.status === 'success',
          data: data,
          id: data.id || null
        };
      } catch (e) {
        console.log("Could not parse add contact response as JSON");
        // Check if response indicates success
        if (responseText.includes('success')) {
          return {
            success: true,
            message: "Contact added successfully"
          };
        }
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Cập nhật liên hệ khẩn cấp
  async updateEmergencyContact(contact) {
    try {
      console.log("EmergencyService: Updating contact:", contact);
      
      const response = await fetch(`${API_URL}/emergency_contacts.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });
      
      // Get text response for debugging
      const responseText = await response.text();
      console.log("Update contact response text:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed update contact response:", data);
        return {
          success: data.success || data.status === 'success',
          data: data
        };
      } catch (e) {
        console.log("Could not parse update contact response as JSON");
        // Check if response indicates success
        if (responseText.includes('success')) {
          return {
            success: true,
            message: "Contact updated successfully"
          };
        }
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Xóa liên hệ khẩn cấp
  async deleteEmergencyContact(id, userId) {
    try {
      console.log("EmergencyService: Deleting contact:", {id, user_id: userId});
      
      const response = await fetch(`${API_URL}/emergency_contacts.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, user_id: userId }),
      });
      
      // Get text response for debugging
      const responseText = await response.text();
      console.log("Delete contact response text:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed delete contact response:", data);
        return {
          success: data.success || data.status === 'success',
          data: data
        };
      } catch (e) {
        console.log("Could not parse delete contact response as JSON");
        // Check if response indicates success
        if (responseText.includes('success')) {
          return {
            success: true,
            message: "Contact deleted successfully"
          };
        }
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Wrap the entire service with DebugHelper to log all calls
export const DebugEmergencyService = DebugHelper.createDebugProxy(EmergencyService, 'EmergencyService');
