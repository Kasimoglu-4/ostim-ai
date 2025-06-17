import React from 'react';
import MessageContent from './MessageContent';
import ResponseNavigation from './ResponseNavigation';
import FeedbackButtons from './FeedbackButtons';

/**
 * AssistantMessage Component
 * 
 * Handles rendering of assistant messages with multiple response support
 */
const AssistantMessage = ({ 
  message,
  isLiked,
  isDisliked,
  onLike,
  onDislike,
  onRegenerateMessage,
  onNavigateResponse,
  showThinkSections,
  searchContext,
  onClearSearchContext
}) => {
  const { 
    content, 
    timestamp, 
    id, 
    responses, 
    currentResponseIndex 
  } = message;

  // Get current response content and timestamp
  const getCurrentContent = () => {
    if (responses && responses.length > 0) {
      const index = currentResponseIndex || 0;
      return responses[index]?.content || content;
    }
    return content;
  };
  
  const getCurrentTimestamp = () => {
    if (responses && responses.length > 0) {
      const index = currentResponseIndex || 0;
      return responses[index]?.timestamp || timestamp;
    }
    return timestamp;
  };

  // Format timestamp
  const formattedTime = new Date(getCurrentTimestamp()).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  // Navigation handlers
  const handlePreviousResponse = () => {
    if (responses && responses.length > 1 && onNavigateResponse) {
      const currentIndex = currentResponseIndex || 0;
      const newIndex = currentIndex > 0 ? currentIndex - 1 : responses.length - 1;
      onNavigateResponse(id, newIndex);
    }
  };

  const handleNextResponse = () => {
    if (responses && responses.length > 1 && onNavigateResponse) {
      const currentIndex = currentResponseIndex || 0;
      const newIndex = currentIndex < responses.length - 1 ? currentIndex + 1 : 0;
      onNavigateResponse(id, newIndex);
    }
  };

  // Copy handler - handles think tags cleaning
  const handleCopy = () => {
    let textToCopy = getCurrentContent();
    
    if (typeof textToCopy === 'string' && textToCopy.includes('<think>') && textToCopy.includes('</think>')) {
      const parts = textToCopy.split(/<\/?think>/);
      if (parts.length > 1) {
        textToCopy = parts.filter((_, index) => index % 2 === 0).join('').trim();
      }
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        console.log('Clean message copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy message: ', err);
      });
  };

  // Regenerate handler
  const handleRegenerate = () => {
    console.log('Regenerate response for message:', id);
    if (onRegenerateMessage) {
      onRegenerateMessage(id);
    }
  };

  return (
    <div className="message-container assistant left-edge">
      <div className="avatar-content-wrapper">
        <div className="message-avatar">
          <div className="avatar">
            <img 
              src="https://www.bizimlebasvur.com/wp-content/uploads/2023/07/Ostim-Teknik-Universitesi.webp" 
              alt="AI Logo" 
              style={{ width: 28, height: 28, borderRadius: '50%' }} 
            />
          </div>
        </div>
        
        <div className="message-content">
          <div className="message-text">
            <MessageContent 
              content={getCurrentContent()} 
              showThinkSections={showThinkSections}
              searchContext={searchContext}
              onClearSearchContext={onClearSearchContext}
            />
          </div>
          
          <div className="assistant-controls">
            <span className="message-time assistant-time">{formattedTime}</span>
            
            <ResponseNavigation
              responses={responses}
              currentResponseIndex={currentResponseIndex}
              onPrevious={handlePreviousResponse}
              onNext={handleNextResponse}
            />
            
            <FeedbackButtons
              isLiked={isLiked}
              isDisliked={isDisliked}
              onLike={onLike}
              onDislike={onDislike}
              onCopy={handleCopy}
              onRegenerate={handleRegenerate}
              messageId={id}
              messageContent={getCurrentContent()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AssistantMessage); 