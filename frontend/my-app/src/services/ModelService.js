import api from './api';

/**
 * ModelService - Handles all model-related API operations
 */
class ModelService {
  /**
   * Get all available models
   * @returns {Promise} API response with available models
   */
  static async getModels() {
    try {
      const response = await api.get('/models');
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }
}

export default ModelService; 