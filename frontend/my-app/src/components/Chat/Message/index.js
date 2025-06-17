import React, { useState, useEffect } from 'react';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import { deleteVote } from '../../../services/api';
import { openGlobalFeedbackModal } from '../GlobalFeedbackModal';
import '../../../styles/Message.css';

/**
 * Main Message Component - Entry point for all message types
 * 
 * Handles message-level state and delegates rendering to specialized components
 */
const Message = ({ 
  message, 
  onEditMessage, 
  onRegenerateMessage, 
  onNavigateResponse, 
  selectedModel, 
  showThinkSections,
  searchContext,
  onClearSearchContext
}) => {
  const { role, id } = message;
  
  // Shared state for feedback functionality
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeVoteId, setLikeVoteId] = useState(null);
  const [dislikeVoteId, setDislikeVoteId] = useState(null);
  
  // Debug logging
  useEffect(() => {
    console.log(`Message component initialized with ID ${id}`, {
      messageObject: message,
      availableProperties: Object.keys(message),
      messageId: message.messageId,
      id: id,
      chatId: message.chatId
    });
  }, [id, message]);
  
  // Get database message ID
  const dbMessageId = message.messageId || id;
  
  // Shared feedback handlers
  const handleLike = () => {
    console.log('Like button clicked for message:', id, 'DB message ID:', dbMessageId);
    
    if (isDisliked) {
      console.log('Removing dislike state before setting like');
      setIsDisliked(false);
      if (dislikeVoteId) {
        deleteVote(dislikeVoteId)
          .then(response => {
            console.log('Successfully deleted dislike vote:', response);
            setDislikeVoteId(null);
          })
          .catch(error => {
            console.error("API error deleting dislike vote:", error);
          });
      }
    }
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    if (newLikedState) {
      if (!message.chatId) {
        console.warn("Cannot send like feedback: chatId is missing from message", message);
        return;
      }
      
      openGlobalFeedbackModal({
        messageId: dbMessageId,
        chatId: message.chatId,
        skipModal: true,
        onSubmit: (feedback) => {
          if (feedback.voteId) {
            setLikeVoteId(feedback.voteId);
          } else if (feedback.error) {
            console.error('Error recording like:', feedback.error);
            setIsLiked(false);
          }
        }
      });
    } else {
      if (likeVoteId) {
        deleteVote(likeVoteId)
          .then(response => {
            console.log('Successfully deleted like vote:', response);
            setLikeVoteId(null);
          })
          .catch(error => {
            console.error("API error deleting like vote:", error);
            setIsLiked(true);
          });
      }
    }
  };

  const handleDislike = () => {
    console.log('Dislike button clicked for message:', id, 'DB message ID:', dbMessageId);
    
    if (isLiked) {
      setIsLiked(false);
      if (likeVoteId) {
        deleteVote(likeVoteId);
        setLikeVoteId(null);
      }
    }
    
    const newDislikedState = !isDisliked;
    setIsDisliked(newDislikedState);
    
    if (!newDislikedState && dislikeVoteId) {
      deleteVote(dislikeVoteId)
        .then(response => {
          console.log('Successfully deleted dislike vote:', response);
          setDislikeVoteId(null);
        })
        .catch(error => {
          console.error("API error deleting dislike vote:", error);
        });
      return;
    }
    
    if (newDislikedState) {
      if (!message.chatId) {
        console.warn("Cannot send dislike feedback: chatId is missing from message", message);
        return;
      }
      
      openGlobalFeedbackModal({
        messageId: dbMessageId,
        chatId: message.chatId,
        onSubmit: (feedback) => {
          if (feedback.voteId) {
            setDislikeVoteId(feedback.voteId);
          } else if (feedback.error) {
            console.error('Error recording dislike:', feedback.error);
            setIsDisliked(false);
          }
        }
      });
    }
  };

  // Shared props for all message types
  const sharedProps = {
    message,
    dbMessageId,
    isLiked,
    isDisliked,
    onLike: handleLike,
    onDislike: handleDislike,
    searchContext,
    onClearSearchContext,
  };

  // Render appropriate message component based on role
  switch (role) {
    case 'user':
      return (
        <UserMessage 
          {...sharedProps}
          onEditMessage={onEditMessage}
        />
      );
    
    case 'assistant':
      return (
        <AssistantMessage 
          {...sharedProps}
          onRegenerateMessage={onRegenerateMessage}
          onNavigateResponse={onNavigateResponse}
          showThinkSections={showThinkSections}
        />
      );
    
    default:
      return null;
  }
};

export default React.memo(Message); 