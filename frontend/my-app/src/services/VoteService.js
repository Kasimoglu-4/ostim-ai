import api from './api';

/**
 * VoteService - Handles all vote-related API operations
 */
class VoteService {
  /**
   * Create a new vote
   * @param {number} chatId - The chat ID
   * @param {Object} voteData - The vote data
   * @returns {Promise} API response
   */
  static async createVote(chatId, voteData) {
    try {
      console.log("VoteService.createVote called with:", { chatId, voteData });
      
      // Ensure the chatId and messageId are integers
      const data = { 
        ...voteData,
        chatId: parseInt(chatId, 10)
      };
      
      // Ensure messageId is an integer
      if (voteData.messageId !== undefined) {
        data.messageId = parseInt(voteData.messageId, 10);
        // Check if parsing was successful
        if (isNaN(data.messageId)) {
          console.error("Error: messageId is not a valid number:", voteData.messageId);
          throw new Error("Invalid messageId: must be a number");
        }
      }
      
      console.log("VoteService: Sending vote data to backend:", data);
      console.log("VoteService: Making POST request to /vote endpoint...");
      
      // The backend endpoint is /api/vote
      const response = await api.post(`/vote`, data);
      
      console.log("VoteService: Received response from backend:", response);
      console.log("VoteService: Response status:", response.status);
      console.log("VoteService: Response data:", response.data);
      
      return response;
    } catch (error) {
      console.error("VoteService: Error creating vote:", error);
      console.error("VoteService: Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get all votes for a specific chat
   * @param {number} chatId - The chat ID
   * @returns {Promise} API response
   */
  static async getVotesForChat(chatId) {
    return api.get(`/vote/chat/${chatId}`);
  }

  /**
   * Get a specific vote by ID
   * @param {number} voteId - The vote ID
   * @returns {Promise} API response
   */
  static async getVoteById(voteId) {
    return api.get(`/vote/${voteId}`);
  }

  /**
   * Delete a vote by ID
   * @param {number} voteId - The vote ID
   * @returns {Promise} API response
   */
  static async deleteVote(voteId) {
    return api.delete(`/vote/${voteId}`);
  }
}

export default VoteService; 