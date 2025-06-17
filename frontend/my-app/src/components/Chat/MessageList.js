import React, { useEffect, useRef, useState, useCallback } from 'react';
import Message from './Message/index';
import '../../styles/MessageList.css';

const MessageList = ({ 
  messages, 
  onEditMessage, 
  onRegenerateMessage, 
  onNavigateResponse, 
  selectedModel, 
  showThinkSections, 
  onCreateNewChat, 
  onSelect,
  searchContext,
  onClearSearchContext 
}) => {
  const listRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messageRefs = useRef({}); // Refs for individual messages
  
  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (listRef.current) {
      const scrollHeight = listRef.current.scrollHeight;
      const height = listRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      
      // Instant scroll to the bottom - no animation
      listRef.current.scrollTop = maxScrollTop;
    }
  };

  // Function to check if user is at the bottom of the chat
  const checkIfAtBottom = () => {
    if (!listRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const threshold = 50; // 50px threshold for "at bottom"
    return scrollHeight - scrollTop - clientHeight <= threshold;
  };

  // Handle scroll events - memoized to prevent infinite re-renders
  const handleScroll = useCallback(() => {
    setIsAtBottom(checkIfAtBottom());
  }, []);

  // Expose scroll function globally for ChatArea to use
  useEffect(() => {
    window.scrollMessagesToBottom = scrollToBottom;
    return () => {
      window.scrollMessagesToBottom = undefined;
    };
  }, []);

  // Auto-scroll when messages change or component mounts
  useEffect(() => {
    // Don't auto-scroll if we have search context (let search scroll to specific message)
    if (messages && messages.length > 0 && !searchContext) {
      // Immediate scroll with no delays for instant appearance
      scrollToBottom();
      
      // One additional attempt after a minimal delay to ensure DOM is ready
      setTimeout(() => {
        scrollToBottom();
        setIsAtBottom(true); // Set to true after auto-scroll (we're at bottom)
      }, 10);
    }
  }, [messages, searchContext]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = listRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle new chat button click - go to welcome screen instead of creating new chat
  const handleNewChatClick = () => {
    if (onSelect) {
      onSelect(null); // Go to welcome screen
    }
  };

  // Effect to scroll to specific message from search results
  useEffect(() => {
    if (searchContext && searchContext.messageId && messages.length > 0) {
      // Add delay to ensure messages are fully rendered
      setTimeout(() => {
        // Find the message by ID - try both id and messageId
        const targetMessage = messages.find(msg => 
          msg.id === searchContext.messageId || 
          msg.messageId?.toString() === searchContext.messageId ||
          msg.id === searchContext.messageId.toString() ||
          msg.messageId === parseInt(searchContext.messageId)
        );
        
        if (targetMessage) {
          const messageElement = messageRefs.current[targetMessage.id];
          if (messageElement) {
            console.log('Scrolling to search result message:', targetMessage.id, searchContext);
            // Scroll to the message
            messageElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            
            // Set isAtBottom to false since we're scrolling to a specific message
            setIsAtBottom(false);
            
            // Clear search context after scrolling
            setTimeout(() => {
              if (onClearSearchContext) {
                onClearSearchContext();
              }
            }, 3000); // Clear after 3 seconds
          } else {
            console.warn('Message element not found for ID:', targetMessage.id, 'Available refs:', Object.keys(messageRefs.current));
          }
        } else {
          console.warn('Target message not found for search ID:', searchContext.messageId, 'Available message IDs:', messages.map(m => ({ id: m.id, messageId: m.messageId })));
        }
      }, 500); // Increased delay to ensure messages are fully rendered
    }
  }, [searchContext, messages, onClearSearchContext]);

  if (!messages || messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="welcome-container">
        </div>
      </div>
    );
  }

  return (
    <div className="message-list-container">
      <div className={`message-list ${messages && messages.length > 0 ? 'active-chat' : ''}`} ref={listRef}>
        {messages.map(message => (
          <div 
            key={message.id} 
            className="message-wrapper shared-width-container"
            ref={(el) => {
              messageRefs.current[message.id] = el;
            }}
          >
            <Message 
              message={message} 
              onEditMessage={onEditMessage} 
              onRegenerateMessage={onRegenerateMessage}
              onNavigateResponse={onNavigateResponse}
              selectedModel={selectedModel}
              showThinkSections={showThinkSections}
              searchContext={searchContext}
              onClearSearchContext={onClearSearchContext}
            />
          </div>
        ))}
      </div>
      
      {/* Floating New Chat Button - only show when AT bottom (viewing latest messages) */}
      {isAtBottom && messages && messages.length > 0 && (
        <div className="floating-new-chat-button" onClick={handleNewChatClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H5V22L9 18H12C13.1 18 14 17.1 14 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 9V3M14 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>New chat</span>
        </div>
      )}
    </div>
  );
};

export default MessageList; 