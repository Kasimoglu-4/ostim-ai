import api from './api';

/**
 * FileService - Handles all file-related operations
 */
class FileService {
  /**
   * Upload a file to the server
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} - Response data from the server
   */
  static async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload a file specifically for chat context
   * @param {File} file - The file to upload
   * @param {number} chatId - The chat ID to associate the file with
   * @param {number|null} messageId - Optional message ID to associate the file with
   * @returns {Promise<Object>} - Response data from the server
   */
  static async uploadChatFile(file, chatId, messageId = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId.toString()); // Backend expects string
      if (messageId) {
        formData.append('messageId', messageId.toString()); // Backend expects string
      }

      console.log('Uploading file with chatId:', chatId, 'messageId:', messageId);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('File upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading chat file:', error);
      throw error;
    }
  }

  /**
   * Get all files associated with a specific chat
   * @param {number} chatId - The chat ID to get files for
   * @returns {Promise<Object>} - List of files for the chat
   */
  static async getFilesForChat(chatId) {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching files for chat:', error);
      throw error;
    }
  }

  /**
   * Get all files associated with a specific message
   * @param {number} messageId - The message ID to get files for
   * @returns {Promise<Object>} - List of files for the message
   */
  static async getFilesForMessage(messageId) {
    try {
      const response = await api.get(`/files/message/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching files for message:', error);
      throw error;
    }
  }

  /**
   * Get a specific file by its ID
   * @param {number} fileId - The file ID to retrieve
   * @returns {Promise<Object>} - File data
   */
  static async getFileById(fileId) {
    try {
      const response = await api.get(`/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching file by ID:', error);
      throw error;
    }
  }

  /**
   * Delete a file by its ID
   * @param {number} fileId - The file ID to delete
   * @returns {Promise<Object>} - Response data from the server
   */
  static async deleteFile(fileId) {
    try {
      const response = await api.delete(`/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Download a file by its ID
   * @param {number} fileId - The file ID to download
   * @param {string} fileName - The original file name for download
   * @returns {Promise<void>} - Triggers file download
   */
  static async downloadFile(fileId, fileName) {
    try {
      const response = await api.get(`/files/download/${fileId}`, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   * @param {File} file - The file to validate
   * @param {Object} options - Validation options
   * @param {number} options.maxSize - Maximum file size in bytes
   * @param {string[]} options.allowedTypes - Array of allowed MIME types
   * @returns {Object} - Validation result
   */
  static validateFile(file, options = {}) {
    const { maxSize = 50 * 1024 * 1024, allowedTypes = [] } = options; // Default 50MB

    const errors = [];

    if (file.size > maxSize) {
      errors.push(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   * @param {string} fileName - The file name
   * @returns {string} - File extension
   */
  static getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase();
  }

  /**
   * Check if file is an image
   * @param {File|string} file - File object or MIME type string
   * @returns {boolean} - True if file is an image
   */
  static isImageFile(file) {
    const mimeType = typeof file === 'string' ? file : file.type;
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is a document
   * @param {File|string} file - File object or MIME type string
   * @returns {boolean} - True if file is a document
   */
  static isDocumentFile(file) {
    const mimeType = typeof file === 'string' ? file : file.type;
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return documentTypes.includes(mimeType);
  }
}

export default FileService; 