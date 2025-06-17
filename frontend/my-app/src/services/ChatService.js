import api from './api';
import AIFileService from './AIFileService';

/**
 * ChatService - Handles all chat-related API operations
 */
class ChatService {
  /**
   * Send a message to the chat API and get a response
   * @param {string} message - The message to send
   * @param {string} model - The model to use for generation
   * @param {Object} fileAttachment - Optional file attachment
   * @param {AbortSignal} signal - Optional abort signal for cancellation
   * @returns {Promise} API response with generated message
   */
  static async sendMessage(message, model, fileAttachment = null, signal = null) {
    try {
      // If there's a file attachment with a valid fileId, try to use AI file processing
      if (fileAttachment && fileAttachment.fileId && fileAttachment.fileId !== 'error') {
        try {
          console.log("Processing message with file attachment using AI service...");
          
          // Use the AI file processing service to generate a response that includes file content
          const aiResponse = await AIFileService.generateFileBasedResponse(
            fileAttachment.fileId, 
            message, 
            model
          );
          
          return {
            message: aiResponse
          };
          
        } catch (fileError) {
          console.error("Error processing file with AI service:", fileError);
          // Fall back to regular message processing with a note about the file
          message = `${message} (Note: I couldn't process the attached file "${fileAttachment.fileName || 'file'}", but I can still help with your question.)`;
        }
      }
      
      // Regular message processing (no file or file processing failed)
      const payload = {
        prompt: message,
        model: model
      };
      
      // Add file information if available (for backward compatibility)
      if (fileAttachment) {
        console.log("Adding file attachment to request:", fileAttachment);
        // Extract fileId safely
        let fileId = null;
        if (fileAttachment.fileId && fileAttachment.fileId !== 'error') {
          // Try to convert to integer
          try {
            fileId = parseInt(fileAttachment.fileId, 10);
            if (isNaN(fileId)) {
              console.warn("fileId is NaN after parsing:", fileAttachment.fileId);
              fileId = null;
            }
          } catch (e) {
            console.error("Error parsing fileId:", e);
            fileId = null;
          }
        }
        
        payload.fileAttachment = {
          fileId: fileId,
          fileName: fileAttachment.fileName || 'Unknown File',
          contentType: fileAttachment.contentType || 'application/octet-stream',
          fileSize: ChatService.extractNumericFileSize(fileAttachment.size || fileAttachment.fileSize || 0)
        };
        
        console.log("Final fileAttachment payload:", payload.fileAttachment);
      }
      
      // Updated to match the ChatController's /generate endpoint expected format
      console.log("Sending payload to /chat/generate:", payload);
      
      // Create config object with signal if provided
      const config = {};
      if (signal) {
        config.signal = signal;
      }
      
      try {
        const response = await api.post('/chat/generate', payload, config);
        
        // The response is a string, so wrap it in an object
        return {
          message: response.data
        };
      } catch (error) {
        // If the request was aborted, rethrow the error
        if (error.name === 'AbortError' || error.message === 'canceled') {
          throw error;
        }
        
        console.error("Error in API call:", error);
        
        // If there's an issue with the file attachment, retry without it
        if (fileAttachment && error?.response?.status >= 400) {
          console.log("Retrying without file attachment...");
          const simplePayload = {
            prompt: `${message} (Note: There was an error processing your attached file "${fileAttachment.fileName}")`,
            model: model
          };
          
          const retryResponse = await api.post('/chat/generate', simplePayload, config);
          return {
            message: retryResponse.data
          };
        }
        
        throw error;
      }
    } catch (error) {
      // If the request was aborted, rethrow the error
      if (error.name === 'AbortError' || error.message === 'canceled') {
        throw error;
      }
      
      console.error('Error in sendMessage function:', error);
      throw error;
    }
  }

  /**
   * Create a new chat
   * @param {Object} chatData - The chat data
   * @returns {Promise} API response
   */
  static async createChat(chatData) {
    return api.post('/chat', chatData);
  }

  /**
   * Get all chats
   * @returns {Promise} API response
   */
  static async getAllChats() {
    return api.get('/chat');
  }

  /**
   * Get a specific chat by ID
   * @param {number} chatId - The chat ID
   * @returns {Promise} API response
   */
  static async getChatById(chatId) {
    return api.get(`/chat/${chatId}`);
  }

  /**
   * Update chat title
   * @param {number} chatId - The chat ID
   * @param {string} newTitle - The new title
   * @returns {Promise} API response
   */
  static async updateChatTitle(chatId, newTitle) {
    return api.put(`/chat/${chatId}/title`, newTitle, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }

  /**
   * Delete a chat by ID
   * @param {number} chatId - The chat ID
   * @returns {Promise} API response
   */
  static async deleteChat(chatId) {
    const response = await api.delete(`/chat/${chatId}`);
    return response;
  }

  /**
   * Delete all chats
   * @returns {Promise} API response
   */
  static async deleteAllChats() {
    const response = await api.delete('/chat/all');
    return response;
  }

  /**
   * Get generated responses
   * @returns {Promise} API response
   */
  static async getGeneratedResponses() {
    return api.get('/chat/generate');
  }

  /**
   * Extract numeric file size from formatted strings like "417 B" -> 417
   * @param {string|number} size - The size value (string or number)
   * @returns {number} - Numeric file size
   */
  static extractNumericFileSize(size) {
    if (typeof size === 'number') {
      return size;
    }
    
    if (typeof size === 'string') {
      // Extract the first number from the string (e.g., "417 B" -> 417)
      const match = size.match(/(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    return 0; // Default fallback
  }
}

export default ChatService; 