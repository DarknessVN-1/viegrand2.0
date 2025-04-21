const API_URL = 'https://viegrand.site/api';

export const premiumService = {
  async upgradePremium(userId, planData) {
    try {
      console.log('Sending upgrade request:', { userId, planData });
      
      const response = await fetch(`${API_URL}/upgrade.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          plan_type: planData.plan,
          amount: planData.amount,
          payment_method: planData.paymentMethod
        }),
      });

      // Log response for debugging
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid server response');
      }

      if (!data.success) {
        throw new Error(data.message || 'Upgrade failed');
      }

      return data;
    } catch (error) {
      console.error('Premium upgrade error:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred',
        error: error
      };
    }
  },

  async checkPremiumStatus(userId) {
    try {
      // Tạm thời mock response
      // TODO: Uncomment khi backend sẵn sàng
      /*
      const response = await fetch(
        `${API_URL}/premium/status.php?user_id=${userId}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      await logResponse(response);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      */

      // Mock response based on local storage
      return {
        success: true,
        message: 'Status check successful',
        data: {
          isPremium: true,
          planType: 'monthly',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
    } catch (error) {
      console.error('Premium status check error:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred',
        error: error
      };
    }
  }
};
