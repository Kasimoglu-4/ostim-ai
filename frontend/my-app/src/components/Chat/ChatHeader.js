import React, { useState, useRef, useEffect } from 'react';
import '../../styles/ChatHeader.css';

/**
 * ChatHeader Component - Displays the chat header with title editing and share functionality
 * @param {Object} props - Component props
 * @param {Object} props.conversation - Current conversation object
 * @param {Function} props.onUpdateTitle - Callback to update conversation title
 * @param {Function} props.onShareClick - Callback for share button click
 */
const ChatHeader = ({ conversation, onUpdateTitle, onShareClick }) => {
  const [titleState, setTitleState] = useState({
    isEditing: false,
    value: '',
    inputWidth: 0
  });
  
  const titleInputRef = useRef(null);
  const titleDisplayRef = useRef(null);

  // Update title state helper
  const updateTitleState = (updates) => {
    setTitleState(prev => ({ ...prev, ...updates }));
  };

  // Start editing title
  const handleTitleClick = () => {
    updateTitleState({
      isEditing: true,
      value: conversation.title || ''
    });
  };

  // Save edited title
  const handleTitleSave = () => {
    if (titleState.value.trim()) {
      updateConversationTitle(titleState.value.trim());
    }
    updateTitleState({ isEditing: false });
  };

  // Handle title input changes
  const handleTitleChange = (e) => {
    const newValue = e.target.value;
    updateTitleState({
      value: newValue,
      inputWidth: adjustInputWidth(newValue)
    });
  };

  // Adjust input width based on content
  const adjustInputWidth = (text) => {
    return Math.max(100, Math.min(text.length * 10 + 40, 600));
  };

  // Handle key press in title input
  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      updateTitleState({ isEditing: false });
    }
  };

  // Function to update conversation title
  const updateConversationTitle = (newTitle) => {
    if (conversation?.id && onUpdateTitle) {
      onUpdateTitle(conversation.id, newTitle);
    }
  };

  // Focus input when editing starts and adjust width
  useEffect(() => {
    if (titleState.isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      if (conversation?.title) {
        updateTitleState({
          inputWidth: adjustInputWidth(conversation.title)
        });
      }
    }
  }, [titleState.isEditing, conversation?.title]);

  if (!conversation) return null;

  return (
    <div className="chat-header">
      <div className="chat-title-container">
        {titleState.isEditing ? (
          <input
            ref={titleInputRef}
            type="text"
            className="chat-title-input"
            value={titleState.value}
            onChange={handleTitleChange}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyPress}
            style={{ width: `${titleState.inputWidth}px` }}
            autoFocus
          />
        ) : (
          <h1 
            ref={titleDisplayRef}
            className="chat-title" 
            onClick={handleTitleClick}
            title="Click to edit chat title"
          >
            {conversation.title || 'New Chat'}
          </h1>
        )}
        <div className="chat-header-actions">
          <button 
            className="share-button"
            onClick={onShareClick}
            title="Share this chat"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="" className="icon-sm">
              <path d="M6.66669 6.66671L10 3.33337L13.3334 6.66671M10 3.75004V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M3.33331 11.6666V11.8666C3.33331 13.5468 3.33331 14.3869 3.66029 15.0286C3.94791 15.5931 4.40686 16.052 4.97134 16.3396C5.61308 16.6666 6.45316 16.6666 8.13331 16.6666H11.8666C13.5468 16.6666 14.3869 16.6666 15.0286 16.3396C15.5931 16.052 16.052 15.5931 16.3397 15.0286C16.6666 14.3869 16.6666 13.5468 16.6666 11.8666V11.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader; 