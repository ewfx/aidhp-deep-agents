/**
 * Utility functions for checking API connection status
 */
import axios from 'axios';
import { config } from '../config';

/**
 * Check if the API server is available and responding
 * @returns {Promise<boolean>} True if the API is connected, false otherwise
 */
export const checkApiConnection = async () => {
  const apiUrl = config.apiUrl; // Get the correct API URL from config
  
  if (!apiUrl) {
    console.error('API URL is undefined in configuration');
    return false;
  }
  
  try {
    console.log('Checking API connection to:', apiUrl);
    
    // Try the health endpoint first
    try {
      const healthResponse = await axios.get(`${apiUrl}/api/health`, {
        timeout: 5000, // Short timeout for quick check
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (healthResponse.status === 200) {
        console.log('API health check succeeded:', healthResponse.status);
        return true;
      }
    } catch (healthError) {
      console.log('Health endpoint not available, trying base URL...');
    }
    
    // If health endpoint fails, try a basic request to the base URL
    const response = await axios.get(apiUrl, {
      timeout: 5000, // Short timeout for quick check
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('API connection check failed:', error.message);
    return false;
  }
};

export default checkApiConnection; 