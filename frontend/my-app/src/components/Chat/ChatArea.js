import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageList from './MessageList';
import TextAreaInput from './TextAreaInput';
import ShareModal from './ShareModal';
import WelcomeScreen from './WelcomeScreen';
import ChatHeader from './ChatHeader';
import '../../styles/ChatArea.css';
import { sendMessage } from '../../services/api';
import { uploadChatFile } from '../../services/api';
// import Sidebar from '../Sidebar/Sidebar';

/**
 * ChatArea Component - The main chat interface 
 * @param {Object} props - Component props
 * @param {Object} props.conversation - The current conversation object
 * @param {Function} props.onSendMessage - Callback function to handle sending messages (may be async)
 * @param {string} props.selectedModel - The currently selected model
 * @param {Function} props.onChangeModel - Callback to change the current model
 * @param {Function} props.onEditMessage - Callback to edit a message
 * @param {Function} props.onRegenerateMessage - Callback to regenerate a message
 * @param {Function} props.onNavigateResponse - Callback to navigate between responses
 * @param {Function} props.onUpdateTitle - Callback to update conversation title
 * @param {Function} props.onCreateNewChat - Callback to create a new chat
 * @param {Function} props.onCreateNewChatWithMessage - Callback to create a new chat with a message
 * @param {Function} props.onSelect - Callback to select a message
 * @param {string} props.searchContext - The current search context
 * @param {Function} props.onClearSearchContext - Callback to clear the search context
 */
const ChatArea = ({ 
  conversation, 
  onSendMessage, 
  selectedModel, 
  onChangeModel, 
  onEditMessage, 
  onRegenerateMessage, 
  onNavigateResponse, 
  onUpdateTitle, 
  onCreateNewChat,
  onCreateNewChatWithMessage,
  onSelect,
  searchContext,
  onClearSearchContext
}) => {
  // Consolidated state for better organization
  const [uiState, setUiState] = useState({
    isLoading: false,
    isEditingTitle: false,
    titleValue: '',
    inputWidth: 0,
    shareModalOpen: false,
    showThinkSections: false
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const messagesEndRef = useRef(null);

  // Available models configuration
  const [availableModels] = useState([
    { id: 'deepseek-r1:1.5b', name: 'DeepSeek R1 1.5B', description: 'General purpose AI model' },
    { id: 'deepseek-coder:latest', name: 'DeepSeek Coder', description: 'Code-specialized AI model' }
  ]);

  // Update UI state helper
  const updateUiState = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (window.scrollMessagesToBottom) {
      window.scrollMessagesToBottom();
      return;
    }
    
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'auto',
        block: 'end'
      });
    }
    
    // Fallback methods
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, []);

  // Scroll effects
  useEffect(() => {
    // Don't auto-scroll if we have search context (let search scroll to specific message)
    if (!searchContext) {
      scrollToBottom();
    }
  }, [conversation?.messages, scrollToBottom, searchContext]);

  useEffect(() => {
    // Don't auto-scroll if we have search context (let search scroll to specific message)
    if (conversation?.id && !searchContext) {
      scrollToBottom();
      setTimeout(scrollToBottom, 10);
    }
  }, [conversation, scrollToBottom, searchContext]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  // Message processing helper
  const processMessage = useCallback(async (content, attachedFiles, conversationId) => {
    const userMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      chatId: conversationId
    };

    // Handle file attachments
    if (attachedFiles?.length > 0) {
      try {
        const attachedFile = attachedFiles[0];
        const fileData = await uploadChatFile(
          attachedFile.file, 
          conversationId,
          null
        );
        userMessage.attachments = [fileData];
      } catch (error) {
        console.error('Error uploading file:', error);
        userMessage.attachments = [{
          fileId: 'error',
          fileName: attachedFiles[0].fileName || 'file',
          size: attachedFiles[0].fileSize || 'Unknown',
          fileType: attachedFiles[0].fileType || 'document',
          error: true,
          errorMessage: error.message
        }];
      }
    }

    return userMessage;
  }, []);

  // AI response handler
  const handleAIResponse = useCallback(async (message, model, fileData, conversationId) => {
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const response = await sendMessage(message, model, fileData, controller.signal);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: processResponseContent(response.message || response.response || response.answer || "I processed your request."),
        role: 'assistant',
        timestamp: new Date(),
        chatId: conversationId,
        responses: [
          {
            content: processResponseContent(response.message || response.response || response.answer || "I processed your request."),
            timestamp: new Date()
          }
        ],
        currentResponseIndex: 0
      };
      
      await onSendMessage(aiMessage);
      return aiMessage;
    } catch (error) {
      if (error.name === 'AbortError') {
        const stoppedMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Generation stopped by user.',
          role: 'system',
          timestamp: new Date()
        };
        await onSendMessage(stoppedMessage);
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, there was an error processing your request. Please try again.',
          role: 'error',
          timestamp: new Date()
        };
        await onSendMessage(errorMessage);
      }
      throw error;
    } finally {
      setAbortController(null);
    }
  }, [onSendMessage]);

  // Welcome message handler
  const handleWelcomeSendMessage = useCallback(async (content, attachedFiles) => {
    if (!content.trim() && (!attachedFiles || attachedFiles.length === 0)) return;
    
    updateUiState({ isLoading: true });
    
    try {
      // Create conversation if needed
      let conversationId = conversation?.id;
      if (!conversationId) {
        conversationId = await onCreateNewChatWithMessage(content.trim());
      }
      
      // Process and send user message
      const userMessage = await processMessage(content, attachedFiles, conversationId);
      await onSendMessage(userMessage);
      
      // Handle AI response
      const fileData = userMessage.attachments?.[0] || null;
      await handleAIResponse(content.trim(), selectedModel, fileData, conversationId);
      
    } catch (error) {
      console.error('Error in welcome message:', error);
    } finally {
      updateUiState({ isLoading: false });
    }
  }, [conversation?.id, onCreateNewChatWithMessage, onSendMessage, processMessage, handleAIResponse, selectedModel, updateUiState]);

  // Regular message handler
  const handleSendMessage = useCallback(async (message, attachedFiles) => {
    updateUiState({ isLoading: true });
    
    try {
      // Process and send user message
      const userMessage = await processMessage(message, attachedFiles, conversation.id);
      await onSendMessage(userMessage);
      scrollToBottom();
      
      // Handle AI response
      const fileData = userMessage.attachments?.[0] || null;
      await handleAIResponse(message, selectedModel, fileData, conversation.id);
      scrollToBottom();
      
    } catch (error) {
      console.error('Error sending message:', error);
      scrollToBottom();
    } finally {
      updateUiState({ isLoading: false });
    }
  }, [conversation?.id, onSendMessage, processMessage, handleAIResponse, selectedModel, scrollToBottom, updateUiState]);

  // Edit message handler
  const handleEditMessage = useCallback(async (messageId, newContent) => {
    if (!onEditMessage) return;
    
    onEditMessage(messageId, newContent);
    
    const editedMessage = conversation.messages.find(msg => msg.id === messageId);
    if (editedMessage?.role === 'user') {
      updateUiState({ isLoading: true });
      
      try {
        const fileData = editedMessage.attachments?.[0] || null;
        await handleAIResponse(newContent, selectedModel, fileData, conversation.id);
        scrollToBottom();
      } catch (error) {
        console.error('Error processing edited message:', error);
        scrollToBottom();
      } finally {
        updateUiState({ isLoading: false });
      }
    }
  }, [onEditMessage, conversation, handleAIResponse, selectedModel, scrollToBottom, updateUiState]);

  // Event handlers
  const handleShareClick = useCallback(() => {
    updateUiState({ shareModalOpen: true });
  }, [updateUiState]);

  const handleShareModalClose = useCallback(() => {
    updateUiState({ shareModalOpen: false });
  }, [updateUiState]);

  const handleFileUpload = useCallback((file) => {
    if (!file) return;
    setUploadedFile(file);
  }, []);

  const handleModelChange = useCallback((modelId, showThink) => {
    if (onChangeModel) {
      onChangeModel(modelId);
    }
    if (showThink !== undefined) {
      updateUiState({ showThinkSections: showThink });
    }
  }, [onChangeModel, updateUiState]);

  const handleStopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    updateUiState({ isLoading: false });
  }, [abortController, updateUiState]);

  // Show welcome screen if no conversation
  if (!conversation) {
    return (
      <div className="chat-area">
        <WelcomeScreen
          onSendMessage={handleWelcomeSendMessage}
          isLoading={uiState.isLoading}
          selectedModel={selectedModel}
          onChangeModel={handleModelChange}
          availableModels={availableModels}
          uploadedFile={uploadedFile}
          onFileUpload={handleFileUpload}
          onStopGeneration={handleStopGeneration}
        />
      </div>
    );
  }

  return (
    <div className="chat-area-wrapper">
      <div className="chat-area">
        <ChatHeader
          conversation={conversation}
          onUpdateTitle={onUpdateTitle}
          onShareClick={handleShareClick}
        />
        
        <div className="messages-container">
          <MessageList 
            messages={conversation.messages || []} 
            onEditMessage={handleEditMessage}
            onRegenerateMessage={onRegenerateMessage}
            onNavigateResponse={onNavigateResponse}
            onCreateNewChat={onCreateNewChat}
            onSelect={onSelect}
            selectedModel={selectedModel}
            showThinkSections={uiState.showThinkSections}
            searchContext={searchContext}
            onClearSearchContext={onClearSearchContext}
          />
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <TextAreaInput 
            onSendMessage={handleSendMessage}
            isLoading={uiState.isLoading}
            selectedModel={selectedModel}
            onChangeModel={handleModelChange}
            availableModels={availableModels}
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            onStopGeneration={handleStopGeneration}
          />
        </div>
      </div>
      
      <ShareModal 
        isOpen={uiState.shareModalOpen}
        onClose={handleShareModalClose}
        chatId={conversation?.id}
        chatTitle={conversation?.title}
      />
    </div>
  );
};

// Function to process response content and clean empty think tags
export const processResponseContent = (content) => {
  if (typeof content === 'string' && content.includes('<think>') && content.includes('</think>')) {
    const parts = content.split(/<\/?think>/);
    
    if (parts.length > 1) {
      const thinkContent = parts.filter((part, index) => index % 2 === 1);
      const allThinkContentEmpty = thinkContent.every(part => part.trim() === '');
      
      if (allThinkContentEmpty) {
        return parts.filter((_, index) => index % 2 === 0).join('').trim();
      }
    }
  }
  
  return content;
};

export default ChatArea; 