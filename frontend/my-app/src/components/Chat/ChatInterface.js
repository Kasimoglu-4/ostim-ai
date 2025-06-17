import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ChatArea from './ChatArea';
import ConversationOperations from './ConversationOperations';
import MessageOperations from './MessageOperations';
import { useConversations } from './hooks/useConversations';
import { useMessageManagement } from './hooks/useMessageManagement';
import '../../styles/ChatInterface.css';
import { openGlobalFeedbackModal } from './GlobalFeedbackModal';

/**
 * ChatInterface - Main component orchestrating the chat interface
 * Now properly separated into smaller, focused components
 */
const ChatInterface = () => {
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:1.5b');
  const [searchContext, setSearchContext] = useState(null);
  
  // Use custom hooks for state management
  const {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    loadUserChats,
    getCurrentConversation
  } = useConversations();

  const {
    processMessageContent,
    saveMessageToDatabase,
    updateConversationTitleInDatabase
  } = useMessageManagement(conversations, setConversations, currentConversationId);

  // Load chats on mount
  useEffect(() => {
    loadUserChats();
  }, [loadUserChats]);

  // Conversation operations component
  const conversationOps = ConversationOperations({
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    selectedModel,
    saveMessageToDatabase,
    updateConversationTitleInDatabase
  });

  // Message operations component  
  const messageOps = MessageOperations({
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    processMessageContent,
    saveMessageToDatabase,
    updateTitleWithMessage: conversationOps.updateTitleWithMessage,
    selectedModel,
    searchContext,
    setSearchContext
  });

  // Enhanced addMessageToConversation that handles new conversation creation
  const addMessageToConversationWithNewChat = async (message) => {
    const targetConversationId = message.chatId || currentConversationId;
    
    if (!targetConversationId) {
      try {
        const newId = await conversationOps.createNewConversationWithMessage();
        console.log("Created new conversation with ID:", newId);
        
        // Set the chatId on the message
        message.chatId = newId;
        
        // Update currentConversationId to the new conversation
        setCurrentConversationId(newId);
        
        // Save message to database
        await saveMessageToDatabase(message, newId);
        
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.id === newId) {
              const updatedConv = {
                ...conv,
                messages: [...conv.messages, message]
              };
              
              // Update title based on first user message if this is a user message
              if (message.role === 'user') {
                const newTitle = conversationOps.updateTitleWithMessage(conv.id, message);
                if (newTitle) {
                  updatedConv.title = newTitle;
                }
              }
              
              return updatedConv;
            }
            return conv;
          });
        });
      } catch (error) {
        console.error("Error creating new conversation:", error);
      }
    } else {
      // Use existing message operations
      await messageOps.addMessageToConversation(message);
    }
  };

  // Switch to a different model
  const changeModel = (modelName) => {
    setSelectedModel(modelName);
    
    // Also update the model in the current conversation if one exists
    if (currentConversationId) {
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              model: modelName
            };
          }
          return conv;
        })
      );
    }
  };

  // Test function to open the feedback modal
  const testFeedbackModal = useCallback(() => {
    console.log('Opening feedback modal for testing');
    openGlobalFeedbackModal((feedback) => {
      console.log('Test feedback submitted:', feedback);
    });
  }, []);

  // Enhanced onSelect function to handle search context
  const handleSelectConversation = useCallback((conversationId, searchCtx = null) => {
    setSearchContext(searchCtx);
    messageOps.selectConversation(conversationId);
  }, [messageOps]);

  // Memoize sidebar props to prevent unnecessary re-renders
  const sidebarProps = useMemo(() => ({
    conversations: conversations,
    currentConversationId: currentConversationId,
    onSelect: handleSelectConversation,
    onDelete: conversationOps.deleteConversation,
    onDeleteAll: conversationOps.deleteAllConversations,
    onNewChat: conversationOps.createNewConversation,
    onEditTitle: conversationOps.updateConversationTitle,
    onTestFeedback: testFeedbackModal
  }), [
    conversations,
    currentConversationId,
    handleSelectConversation,
    conversationOps.deleteConversation,
    conversationOps.deleteAllConversations,
    conversationOps.createNewConversation,
    conversationOps.updateConversationTitle,
    testFeedbackModal
  ]);

  return (
    <div className="chat-interface">
      <Sidebar {...sidebarProps} />
      <ChatArea 
        conversation={getCurrentConversation()}
        onSendMessage={addMessageToConversationWithNewChat}
        selectedModel={selectedModel}
        onChangeModel={changeModel}
        onEditMessage={messageOps.editMessage}
        onRegenerateMessage={messageOps.handleRegenerateMessage}
        onNavigateResponse={messageOps.handleNavigateResponse}
        onUpdateTitle={conversationOps.updateConversationTitle}
        onCreateNewChat={conversationOps.createNewConversation}
        onCreateNewChatWithMessage={conversationOps.createNewConversationWithMessage}
        onSelect={messageOps.selectConversation}
        searchContext={searchContext}
        onClearSearchContext={() => setSearchContext(null)}
      />
    </div>
  );
};

export default ChatInterface; 