import { useCallback } from 'react';
import { processResponseContent } from '../ChatArea';
import { createMessage, updateChatTitle, clearSearchCache } from '../../../services/api';

/**
 * Custom hook for managing message operations
 * Handles message processing, database operations, and title updates
 */
export const useMessageManagement = (conversations, setConversations, currentConversationId) => {
  // Process message content for bot messages
  const processMessageContent = useCallback((message) => {
    if (message.role === 'assistant' && typeof message.content === 'string') {
      // Clean up excessive newlines between numbered list items
      let content = message.content;
      
      // First, replace sequences of 3 or more newlines with just 1 newline
      content = content.replace(/\n{3,}/g, '\n');
      
      // Specifically target numbered sections with bold titles
      content = content.replace(/(\d+\.\s+\*\*[^*]+\*\*:.*?(?:\n\s*-\s+.*?)*)\n{2,}(?=\d+\.\s+\*\*)/g, '$1\n');
      
      // Fix spacing between any numbered list items - make it tighter
      content = content.replace(/(\d+\.\s+.*?)(\n\s*){2,}(?=\d+\.)/g, '$1\n');
      
      // Clean up spacing around code blocks 
      content = content.replace(/\n{2,}(```)/g, '\n$1');
      content = content.replace(/(```[^`]*```)\n{2,}/g, '$1\n');
      
      // Reduce excessive spacing before and after **bold text**
      content = content.replace(/\n{2,}(\*\*)/g, '\n$1');
      content = content.replace(/(\*\*[^*]*\*\*)\n{2,}/g, '$1\n');
      
      // Clean up spacing around list structures
      content = content.replace(/(\*\*[^*]+\*\*:)\n{2,}(\s*-\s+)/g, '$1\n$2');
      
      // Super aggressive: replace ANY double+ newlines with single newlines
      content = content.replace(/\n{2,}/g, '\n');
      
      // Clean up any trailing/leading whitespace
      content = content.trim();
      
      // Final pass: ensure numbered sections are tightly spaced
      content = content.replace(/(\d+\.\s+\*\*[^*]+\*\*:[\s\S]*?)(\n+)(?=\d+\.\s+\*\*)/g, '$1\n');
      
      message.content = processResponseContent(content);
    }
    return message;
  }, []);

  // Save message to database
  const saveMessageToDatabase = useCallback(async (message, targetConversationId) => {
    const messageData = {
      messageContent: message.content,
      chatId: parseInt(targetConversationId),
      messageType: message.role === 'assistant' ? 'bot' : 'user',
      createdTime: message.timestamp
    };
    
    // Extract file IDs if message has attachments
    const fileIds = message.attachments ? 
      message.attachments
        .filter(att => att.fileId && att.fileId !== 'error')
        .map(att => parseInt(att.fileId, 10))
        .filter(id => !isNaN(id)) : null;
    
    try {
      await createMessage(messageData, fileIds);
      console.log("Message saved to database successfully", { messageData, fileIds });
      
      // Clear search cache since new content was added
      clearSearchCache();
      console.log("Search cache cleared after new message");
      
    } catch (error) {
      console.error("Error saving message to database:", error);
    }
  }, []);

  // Update conversation title
  const updateConversationTitleInDatabase = useCallback(async (conversationId, newTitle) => {
    if (newTitle.trim()) {
      try {
        console.log("Updating chat title in database:", {
          chatId: conversationId,
          newTitle: newTitle,
          titleLength: newTitle.length
        });
        await updateChatTitle(conversationId, newTitle);
        console.log("Updated chat title in database to:", newTitle);
        
        // Clear search cache since conversation title changed
        clearSearchCache();
        console.log("Search cache cleared after title update");
        
      } catch (error) {
        console.error("Error updating chat title in database:", error);
        console.error("Error details:", error.response?.data || error.message);
      }
    } else {
      console.warn("Skipping title update - empty title generated");
    }
  }, []);

  return {
    processMessageContent,
    saveMessageToDatabase,
    updateConversationTitleInDatabase
  };
}; 