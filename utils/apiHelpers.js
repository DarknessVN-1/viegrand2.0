/**
 * Helper utilities for API communication
 */

/**
 * Makes an API request with retry logic and multiple methods
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Request options
 * @param {number} retries - Number of retry attempts
 * @returns {Promise} - The API response
 */
export const apiRequest = async (url, options, retries = 1) => {
  try {
    const response = await fetch(url, options);
    
    // Try to get JSON response first
    try {
      const jsonData = await response.json();
      return jsonData;
    } catch (jsonError) {
      // If not JSON, try to get text response
      const textData = await response.text();
      
      // Check if the text response indicates success
      if (textData.includes('success')) {
        return { success: true, message: 'Operation successful' };
      }
      
      throw new Error('Invalid response format');
    }
  } catch (error) {
    // Retry logic
    if (retries > 0) {
      console.log(`Retrying request to ${url}, ${retries} attempts left`);
      return apiRequest(url, options, retries - 1);
    }
    
    throw error;
  }
};

/**
 * Creates form data for PHP API compatibility
 * @param {Object} data - The data to convert to FormData
 * @returns {FormData} - The FormData object
 */
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    // Convert boolean values to strings for PHP
    if (typeof data[key] === 'boolean') {
      formData.append(key, data[key] ? '1' : '0');
    } else {
      formData.append(key, data[key] || '');
    }
  });
  
  return formData;
};

/**
 * Converts an object to URL encoded parameters
 * @param {Object} data - The data to convert
 * @returns {string} - URL encoded string
 */
export const objectToUrlParams = (data) => {
  const params = new URLSearchParams();
  
  Object.keys(data).forEach(key => {
    // Convert boolean values to strings for PHP
    if (typeof data[key] === 'boolean') {
      params.append(key, data[key] ? '1' : '0');
    } else {
      params.append(key, data[key] || '');
    }
  });
  
  return params.toString();
};
