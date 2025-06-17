import api from './api';

/**
 * MessageService - Handles all message-related API operations
 */
class MessageService {
  /**
   * Create a new message
   * @param {Object} messageData - The message data
   * @param {Array} fileIds - Optional array of file IDs to link to the message
   * @returns {Promise} API response
   */
  static async createMessage(messageData, fileIds = null) {
    const requestData = {
      messageContent: messageData.messageContent,
      chatId: messageData.chatId,
      messageType: messageData.messageType,
      createdTime: messageData.createdTime,
      fileIds: fileIds
    };
    
    return api.post('/message', requestData);
  }

  /**
   * Get all messages for a specific chat
   * @param {number} chatId - The chat ID
   * @returns {Promise} API response
   */
  static async getMessagesForChat(chatId) {
    return api.get(`/message/chat/${chatId}`);
  }

  /**
   * Get a specific message by ID
   * @param {number} messageId - The message ID
   * @returns {Promise} API response
   */
  static async getMessageById(messageId) {
    return api.get(`/message/${messageId}`);
  }

  /**
   * Delete a message by ID
   * @param {number} messageId - The message ID
   * @returns {Promise} API response
   */
  static async deleteMessage(messageId) {
    return api.delete(`/message/${messageId}`);
  }
}

export default MessageService; 