import { useCallback } from 'react';
import { getMessagesForChat, getFilesForMessage } from '../../services/api';
import '../../styles/MessageOperations.css';

/**
 * MessageOperations - Handles message-related operations
 * Separated for better organization and single responsibility
 */
const MessageOperations = ({
  conversations,
  setConversations,
  currentConversationId,
  setCurrentConversationId,
  processMessageContent,
  saveMessageToDatabase,
  updateTitleWithMessage,
  selectedModel,
  searchContext,
  setSearchContext
}) => {

  // Add a message to the current conversation
  const addMessageToConversation = useCallback(async (message) => {
    console.log("addMessageToConversation called with:", message);
    
    // Process the message content if it's a bot message
    const processedMessage = processMessageContent(message);
    
    // Use message.chatId if provided, otherwise fall back to currentConversationId
    const targetConversationId = processedMessage.chatId || currentConversationId;
    
    if (!targetConversationId) {
      // Handle new conversation creation here - this would need to be passed from parent
      console.error("No target conversation ID available");
      return;
    }

    // Set the chatId on the message if not already set
    if (!processedMessage.chatId) {
      processedMessage.chatId = targetConversationId;
    }
    
    // If this is a message for a conversation that's not currently selected, select it
    if (targetConversationId !== currentConversationId) {
      setCurrentConversationId(targetConversationId);
    }
    
    // Save message to database
    await saveMessageToDatabase(processedMessage, targetConversationId);
    
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === targetConversationId) {
          // Update title based on first user message if it's still "New Chat"
          let updatedConv = {
            ...conv,
            messages: [...conv.messages, processedMessage]
          };
          
          if (updatedConv.title === 'New Chat' && processedMessage.role === 'user') {
            const newTitle = updateTitleWithMessage(conv.id, processedMessage);
            if (newTitle) {
              updatedConv.title = newTitle;
            }
          }
          
          return updatedConv;
        }
        return conv;
      });
    });
  }, [
    processMessageContent,
    currentConversationId,
    setCurrentConversationId,
    saveMessageToDatabase,
    setConversations,
    updateTitleWithMessage
  ]);

  // Edit a message in the current conversation
  const editMessage = useCallback((messageId, newContent) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId ? { ...msg, content: newContent } : msg
            )
          };
        }
        return conv;
      })
    );
  }, [currentConversationId, setConversations]);

  // Handle response navigation for multiple AI responses
  const handleNavigateResponse = useCallback((messageId, newIndex) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => {
              if (msg.id === messageId && msg.responses) {
                return {
                  ...msg,
                  currentResponseIndex: newIndex
                };
              }
              return msg;
            })
          };
        }
        return conv;
      })
    );
  }, [currentConversationId, setConversations]);

  // Handle regenerating a message
  const handleRegenerateMessage = useCallback(async (messageId) => {
    const conversation = conversations.find(conv => conv.id === currentConversationId);
    if (!conversation) return;

    // Find the AI message to regenerate
    const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex < 0) return;

    const aiMessage = conversation.messages[messageIndex];
    if (aiMessage.role !== 'assistant') return;

    // Find the preceding user message
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && conversation.messages[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }

    if (userMessageIndex < 0) return;

    const userMessage = conversation.messages[userMessageIndex];

    try {
      // Make API call to regenerate response
      const { sendMessage } = await import('../../services/api');
      const fileData = userMessage.attachments && userMessage.attachments.length > 0 ? userMessage.attachments[0] : null;
      const response = await sendMessage(userMessage.content, selectedModel, fileData);

      // Process the response content
      const { processResponseContent } = await import('./ChatArea');
      const newResponseContent = processResponseContent(response.message || response.response || response.answer || "I processed your request again.");

      // Save the new response to the database
      await saveMessageToDatabase({
        content: newResponseContent,
        role: 'assistant',
        timestamp: new Date()
      }, currentConversationId);

      // Update the conversation to add the new response
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg => {
                if (msg.id === messageId) {
                  // Initialize responses array if it doesn't exist
                  let responses = msg.responses;
                  if (!responses) {
                    responses = [
                      {
                        content: msg.content,
                        timestamp: msg.timestamp
                      }
                    ];
                  }

                  // Add the new response
                  const newResponse = {
                    content: newResponseContent,
                    timestamp: new Date()
                  };

                  const updatedResponses = [...responses, newResponse];

                  return {
                    ...msg,
                    responses: updatedResponses,
                    currentResponseIndex: updatedResponses.length - 1 // Set to the new response
                  };
                }
                return msg;
              })
            };
          }
          return conv;
        })
      );

    } catch (error) {
      console.error('Error regenerating response:', error);
    }
  }, [conversations, currentConversationId, selectedModel, saveMessageToDatabase, setConversations]);

  // Select a conversation and load its messages
  const selectConversation = useCallback(async (conversationId) => {
    setCurrentConversationId(conversationId);
    
    // Load messages from backend for this conversation
    try {
      const response = await getMessagesForChat(conversationId);
      console.log("Retrieved messages from database:", response.data);
      
      // If there are messages in the database but not in the frontend state, update the frontend state
      if (response.data && response.data.length > 0) {
        const conversation = conversations.find(conv => conv.id === conversationId);
        
        // Only update if we have fewer messages in the frontend than in the database
        if (conversation && conversation.messages.length < response.data.length) {
          console.log("Updating conversation with messages from database");
          
          // Convert the backend message format to frontend format
          let rawMessages = [];
          
          // Process each message and load its file attachments
          for (const msg of response.data) {
            const messageData = {
              id: msg.messageId.toString(),
              content: msg.messageContent,
              role: msg.messageType === 'bot' ? 'assistant' : 'user',
              timestamp: new Date(msg.createdTime),
              chatId: msg.chatId.toString(),
              messageId: msg.messageId // Keep the database messageId for file retrieval
            };
            
            // Load file attachments for this message
            try {
              const filesResponse = await getFilesForMessage(msg.messageId);
              if (filesResponse && filesResponse.length > 0) {
                console.log(`Found ${filesResponse.length} file(s) for message ${msg.messageId}`);
                messageData.attachments = filesResponse.map(file => ({
                  fileId: file.fileId,
                  fileName: file.fileName,
                  size: file.size,
                  fileType: file.fileType || 'document',
                  contentType: file.contentType
                }));
              }
            } catch (fileError) {
              console.error(`Error loading files for message ${msg.messageId}:`, fileError);
              // Continue without attachments if there's an error
            }
            
            rawMessages.push(messageData);
          }
          
          // Sort messages by timestamp
          rawMessages.sort((a, b) => a.timestamp - b.timestamp);
          
          // Group consecutive bot messages as multiple responses
          const formattedMessages = [];
          for (let i = 0; i < rawMessages.length; i++) {
            const currentMessage = rawMessages[i];
            
            if (currentMessage.role === 'assistant') {
              // Check if this is the first occurrence of consecutive bot messages
              const prevMessage = formattedMessages[formattedMessages.length - 1];
              const isFirstBotAfterUser = !prevMessage || prevMessage.role !== 'assistant';
              
              if (isFirstBotAfterUser) {
                // This is the first bot response, create a new message with responses array
                const responses = [
                  {
                    content: currentMessage.content,
                    timestamp: currentMessage.timestamp
                  }
                ];
                
                // Look ahead for more consecutive bot messages
                let j = i + 1;
                while (j < rawMessages.length && rawMessages[j].role === 'assistant') {
                  responses.push({
                    content: rawMessages[j].content,
                    timestamp: rawMessages[j].timestamp
                  });
                  j++;
                }
                
                // Create the grouped message
                formattedMessages.push({
                  ...currentMessage,
                  responses: responses,
                  currentResponseIndex: responses.length - 1 // Default to the latest response
                });
                
                // Skip the processed consecutive bot messages
                i = j - 1;
              }
            } else {
              // User message, add as-is
              formattedMessages.push(currentMessage);
            }
          }
          
          // Update the conversation with the formatted messages
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === conversationId 
                ? { ...conv, messages: formattedMessages }
                : conv
            )
          );
          
          // Force scroll to bottom after messages are loaded
          if (!searchContext) {
            setTimeout(() => {
              if (window.scrollMessagesToBottom) {
                window.scrollMessagesToBottom();
              }
            }, 10);
          }
        } else {
          // Even if no new messages to load, scroll to bottom
          if (!searchContext) {
            setTimeout(() => {
              if (window.scrollMessagesToBottom) {
                window.scrollMessagesToBottom();
              }
            }, 10);
          }
        }
      } else {
        // No messages in database, but still scroll to bottom
        if (!searchContext) {
          setTimeout(() => {
            if (window.scrollMessagesToBottom) {
              window.scrollMessagesToBottom();
            }
          }, 10);
        }
      }
    } catch (error) {
      console.error("Error loading messages from database:", error);
      // Even on error, try to scroll to bottom
      if (!searchContext) {
        setTimeout(() => {
          if (window.scrollMessagesToBottom) {
            window.scrollMessagesToBottom();
          }
        }, 10);
      }
    }
  }, [setCurrentConversationId, conversations, setConversations, searchContext]);

  return {
    addMessageToConversation,
    editMessage,
    handleNavigateResponse,
    handleRegenerateMessage,
    selectConversation
  };
};

export default MessageOperations; 