import { useState, useCallback } from 'react';
import { getAllChats } from '../../../services/api';

/**
 * Custom hook for managing conversation state and operations
 * Handles loading, storing, and retrieving conversations
 */
export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Load user's chats when component mounts
  const loadUserChats = useCallback(async () => {
    try {
      const response = await getAllChats();
      console.log('Loaded chats from database:', response.data);
      
      if (response.data && response.data.length > 0) {
        // Convert the backend chat format to frontend format
        const formattedConversations = response.data.map(chat => ({
          id: chat.chatId.toString(),
          title: chat.title,
          messages: [], // Messages will be loaded when conversation is selected
          model: chat.lmmType,
          timestamp: new Date(chat.createdTime)
        }));
        
        // Sort conversations by timestamp, newest first
        formattedConversations.sort((a, b) => b.timestamp - a.timestamp);
        
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, []);

  // Get the current conversation
  const getCurrentConversation = useCallback(() => {
    return conversations.find(conv => conv.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  return {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    loadUserChats,
    getCurrentConversation
  };
}; 