import api from './api';

/**
 * AIFileService - Handles AI-powered file processing operations
 */
class AIFileService {
  
  /**
   * Analyze a file before upload to check text extraction capabilities
   * @param {File} file - The file to analyze
   * @returns {Promise<Object>} - Analysis result including text preview
   */
  static async analyzeFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/files/ai/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error analyzing file:', error);
      throw error;
    }
  }

  /**
   * Ask a question about an uploaded file
   * @param {number} fileId - The ID of the uploaded file
   * @param {string} question - The question to ask about the file
   * @param {string} model - The AI model to use (optional)
   * @returns {Promise<Object>} - AI response about the file
   */
  static async askQuestionAboutFile(fileId, question, model = 'deepseek-r1:1.5b') {
    try {
      const response = await api.post(`/files/ai/question/${fileId}`, null, {
        params: {
          question,
          model
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error asking question about file:', error);
      throw error;
    }
  }

  /**
   * Ask a question about a file with conversation context
   * @param {number} fileId - The ID of the uploaded file
   * @param {string} question - The question to ask about the file
   * @param {string} context - Previous conversation context (optional)
   * @param {string} model - The AI model to use (optional)
   * @returns {Promise<Object>} - AI response about the file with context
   */
  static async askQuestionWithContext(fileId, question, context = null, model = 'deepseek-r1:1.5b') {
    try {
      const params = { question, model };
      if (context) {
        params.context = context;
      }
      
      const response = await api.post(`/files/ai/question-with-context/${fileId}`, null, {
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error asking contextual question about file:', error);
      throw error;
    }
  }

  /**
   * Get a summary of an uploaded file
   * @param {number} fileId - The ID of the uploaded file
   * @param {string} model - The AI model to use (optional)
   * @returns {Promise<Object>} - AI-generated summary
   */
  static async summarizeFile(fileId, model = 'deepseek-r1:1.5b') {
    try {
      const response = await api.post(`/files/ai/summarize/${fileId}`, null, {
        params: { model }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error summarizing file:', error);
      throw error;
    }
  }

  /**
   * Get a detailed analysis of an uploaded file
   * @param {number} fileId - The ID of the uploaded file
   * @param {string} model - The AI model to use (optional)
   * @returns {Promise<Object>} - AI-generated analysis
   */
  static async analyzeFileContent(fileId, model = 'deepseek-r1:1.5b') {
    try {
      const response = await api.post(`/files/ai/detailed-analysis/${fileId}`, null, {
        params: { model }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error analyzing file content:', error);
      throw error;
    }
  }

  /**
   * Get extracted text content from a file
   * @param {number} fileId - The ID of the uploaded file
   * @returns {Promise<Object>} - Extracted text content
   */
  static async getExtractedText(fileId) {
    try {
      const response = await api.get(`/files/ai/text/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting extracted text:', error);
      throw error;
    }
  }

  /**
   * Re-extract text from a file (if extraction failed previously)
   * @param {number} fileId - The ID of the uploaded file
   * @returns {Promise<Object>} - Re-extraction result
   */
  static async reExtractText(fileId) {
    try {
      const response = await api.post(`/files/ai/re-extract/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error re-extracting text:', error);
      throw error;
    }
  }

  /**
   * Generate AI response that includes file content in the conversation
   * This method combines file content with a user message for AI processing
   * @param {number} fileId - The ID of the uploaded file
   * @param {string} userMessage - The user's message/question
   * @param {string} model - The AI model to use
   * @returns {Promise<string>} - AI response incorporating file content
   */
  static async generateFileBasedResponse(fileId, userMessage, model = 'deepseek-r1:1.5b') {
    try {
      console.log('AIFileService: Generating file-based response for fileId:', fileId, 'message:', userMessage, 'model:', model);
      
      // First get the extracted text
      const textResponse = await this.getExtractedText(fileId);
      console.log('AIFileService: Retrieved extracted text response:', textResponse);
      
      const extractedText = textResponse.extractedText;
      
      if (!extractedText || extractedText.trim() === '') {
        console.warn('AIFileService: No extracted text found');
        return "I couldn't extract any text content from this file to help answer your question.";
      }
      
      console.log('AIFileService: Extracted text preview (first 100 chars):', 
                  extractedText.substring(0, Math.min(100, extractedText.length)));
      
      // Then ask a question about the file with the user's message
      const aiResponse = await this.askQuestionAboutFile(fileId, userMessage, model);
      console.log('AIFileService: Received AI response:', aiResponse);
      
      return aiResponse.response;
      
    } catch (error) {
      console.error('AIFileService: Error generating file-based response:', error);
      throw error;
    }
  }

  /**
   * Check if a file type supports text extraction
   * @param {string} contentType - The MIME type of the file
   * @returns {boolean} - Whether text extraction is supported
   */
  static isTextExtractionSupported(contentType) {
    if (!contentType) return false;
    
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/msword', // .doc
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.ms-excel', // .xls
      'text/plain',
      'text/html',
      'text/xml',
      'application/xml',
      'application/json',
      'text/csv',
      'text/markdown',
      'application/rtf'
    ];
    
    const lowerContentType = contentType.toLowerCase();
    
    return supportedTypes.includes(lowerContentType) ||
           lowerContentType.startsWith('text/') ||
           lowerContentType.includes('javascript') ||
           lowerContentType.includes('css') ||
           lowerContentType.includes('html') ||
           lowerContentType.includes('xml') ||
           lowerContentType.includes('json');
  }

  /**
   * Enhanced sendMessage function that includes file attachment support
   */
  static async sendMessage(prompt, model = 'deepseek-r1:1.5b', fileData = null) {
    try {
      console.log('AIFileService: sendMessage called with:', { prompt, model, fileData });
      
      let requestData = {
        prompt: prompt,
        model: model
      };

      // If file data is provided, add it as fileAttachment
      if (fileData && fileData.fileId) {
        console.log('Adding file attachment to request:', fileData);
        
        // Extract numeric file size from the size string (e.g., "417 B" -> 417)
        let numericFileSize = null;
        if (fileData.size) {
          const sizeMatch = fileData.size.toString().match(/(\d+)/);
          if (sizeMatch) {
            numericFileSize = parseInt(sizeMatch[1], 10);
          }
        }
        
        const fileAttachment = {
          fileId: fileData.fileId,
          fileName: fileData.fileName,
          contentType: fileData.contentType,
          fileSize: numericFileSize // Send numeric value instead of "417 B"
        };
        
        console.log('Final fileAttachment payload:', fileAttachment);
        requestData.fileAttachment = fileAttachment;
      }

      console.log('Sending payload to /chat/generate:', requestData);

      const response = await api.post('/chat/generate', requestData);
      return response.data;
      
    } catch (error) {
      console.error('Error in API call:', error);
      
      // If there's a file attachment and the call failed, try without the file attachment
      if (fileData && fileData.fileId) {
        console.log('Retrying without file attachment...');
        try {
          const fallbackResponse = await api.post('/chat/generate', {
            prompt: `${prompt} (Note: There was an error processing your attached file "${fileData.fileName}")`,
            model: model
          });
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Fallback request also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }
}

export default AIFileService; 