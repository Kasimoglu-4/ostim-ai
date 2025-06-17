import React, { useCallback, useRef } from 'react';
import { deleteChat, deleteAllChats, createChat } from '../../services/api';
import '../../styles/ConversationOperations.css';

/**
 * ConversationOperations - Handles conversation CRUD operations
 * Separated for better single responsibility and testability
 */
const ConversationOperations = ({
  conversations,
  setConversations,
  currentConversationId,
  setCurrentConversationId,
  selectedModel,
  saveMessageToDatabase,
  updateConversationTitleInDatabase
}) => {
  const titleUpdateTimeoutRef = useRef();

  // Create a new conversation (navigate to welcome screen)
  const createNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    return null;
  }, [setCurrentConversationId]);

  // Create a new conversation with backend integration
  const createNewConversationWithMessage = useCallback(async () => {
    // Check if there's already an empty chat
    const hasEmptyChat = conversations.some(conv => 
      conv.messages.length === 0 && conv.title === 'New Chat'
    );
    
    // If there's already an empty chat, select it instead of creating a new one
    if (hasEmptyChat) {
      const emptyChat = conversations.find(conv => 
        conv.messages.length === 0 && conv.title === 'New Chat'
      );
      setCurrentConversationId(emptyChat.id);
      return emptyChat.id;
    }
    
    try {
      // Create the chat in the backend first
      const chatData = {
        title: 'New Chat',
        lmmType: selectedModel,
        status: 'active',
        shareToken: 'default-token'
      };
      
      const response = await createChat(chatData);
      console.log('Backend response for chat creation:', response.data);
      const backendChat = response.data;
      
      // Create the frontend conversation with the backend-generated ID
      const newConversation = {
        id: backendChat.chatId.toString(),
        title: 'New Chat',
        messages: [],
        model: selectedModel,
        timestamp: new Date()
      };
      
      console.log('Created new conversation with backend ID:', newConversation.id);
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      return newConversation.id;
    } catch (error) {
      console.error('Error creating conversation in backend:', error);
      
      // Fallback to client-side ID if backend creation fails
      console.log('Falling back to client-side ID generation');
      const newConversation = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        model: selectedModel,
        timestamp: new Date()
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      return newConversation.id;
    }
  }, [conversations, selectedModel, setConversations, setCurrentConversationId]);

  // Delete a conversation
  const deleteConversation = useCallback(async (id) => {
    try {
      // Delete from backend first
      const response = await deleteChat(id);
      
      // Display success message from backend
      if (response && response.data) {
        console.log(response.data);
      }
      
      // Then update the UI state
      setConversations(prevConversations => prevConversations.filter(conv => conv.id !== id));
      
      if (currentConversationId === id) {
        const remainingConversations = conversations.filter(conv => conv.id !== id);
        setCurrentConversationId(remainingConversations.length > 0 ? remainingConversations[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert(error.response?.data || 'Failed to delete chat. Please try again.');
    }
  }, [setConversations, currentConversationId, conversations, setCurrentConversationId]);

  // Delete all conversations
  const deleteAllConversations = useCallback(async () => {
    try {
      // Delete all chats from the backend at once
      const response = await deleteAllChats();
      
      // Display success message from backend
      if (response && response.data) {
        console.log(response.data);
      }
      
      // Then update the UI state
      setConversations([]);
      setCurrentConversationId(null);
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      alert(error.response?.data || 'Failed to delete all chats. Please try again.');
    }
  }, [setConversations, setCurrentConversationId]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (conversationId, newTitle) => {
    try {
      // Update the title in the backend
      await updateConversationTitleInDatabase(conversationId, newTitle);
      
      // Update the title in the frontend state
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              title: newTitle
            };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('Error updating chat title:', error);
      // Still update the UI even if the backend update fails
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              title: newTitle
            };
          }
          return conv;
        })
      );
    }
  }, [setConversations, updateConversationTitleInDatabase]);

  // Update conversation title with message
  const updateTitleWithMessage = useCallback((conversationId, message) => {
    if (message.role === 'user') {
      const newTitle = message.content.substring(0, 30) + 
        (message.content.length > 30 ? '...' : '');
      
      // Clear any existing timeout
      if (titleUpdateTimeoutRef.current) {
        clearTimeout(titleUpdateTimeoutRef.current);
      }
      
      // Update title in database after state update
      titleUpdateTimeoutRef.current = setTimeout(() => {
        updateConversationTitleInDatabase(conversationId, newTitle);
      }, 0);
      
      return newTitle;
    }
    return null;
  }, [updateConversationTitleInDatabase]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (titleUpdateTimeoutRef.current) {
        clearTimeout(titleUpdateTimeoutRef.current);
      }
    };
  }, []);

  return {
    createNewConversation,
    createNewConversationWithMessage,
    deleteConversation,
    deleteAllConversations,
    updateConversationTitle,
    updateTitleWithMessage
  };
};

export default ConversationOperations; 