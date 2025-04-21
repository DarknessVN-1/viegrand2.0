const API_URL = 'https://viegrand.site/api';

export const medicationService = {
  async getMedications(userId) {
    try {
      const response = await fetch(`${API_URL}/medications.php?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Format lại dữ liệu cho phù hợp với client
        return {
          success: true,
          data: data.data.map(med => ({
            id: med.id,
            name: med.name,
            time: med.time,
            user_id: med.user_id
          }))
        };
      }
      return data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  },

  async addMedication(medication) {
    try {
      const response = await fetch(`${API_URL}/medications.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medication),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  },

  async deleteMedication(id, userId) {
    try {
      const response = await fetch(`${API_URL}/medications.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, user_id: userId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }
};
