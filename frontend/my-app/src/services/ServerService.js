import api from './api';

/**
 * ServerService - Handles all server-related API operations
 */
class ServerService {
  /**
   * Create a new server
   * @param {Object} serverData - The server data
   * @returns {Promise} API response
   */
  static async createServer(serverData) {
    return api.post('/chat-server', serverData);
  }

  /**
   * Get all servers
   * @returns {Promise} API response
   */
  static async getAllServers() {
    return api.get('/chat-server');
  }

  /**
   * Get a specific server by ID
   * @param {number} serverId - The server ID
   * @returns {Promise} API response
   */
  static async getServerById(serverId) {
    return api.get(`/chat-server/${serverId}`);
  }

  /**
   * Delete a server by ID
   * @param {number} serverId - The server ID
   * @returns {Promise} API response
   */
  static async deleteServer(serverId) {
    return api.delete(`/chat-server/${serverId}`);
  }

  /**
   * Update server status
   * @param {number} serverId - The server ID
   * @param {Object} statusData - The status data
   * @returns {Promise} API response
   */
  static async updateServerStatus(serverId, statusData) {
    return api.put(`/chat-server/${serverId}/status`, statusData);
  }
}

export default ServerService; 