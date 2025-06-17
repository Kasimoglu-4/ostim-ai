import React from 'react';

const NewChatButton = ({ collapsed, onNewChat }) => {
  if (collapsed) {
    return (
      <div className="collapsed-item">
        <button 
          className="new-chat-button collapsed" 
          onClick={onNewChat}
          title="New Chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H5V22L9 18H12C13.1 18 14 17.1 14 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 9V3M14 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="new-chat-button-container">
      <button 
        className="new-chat-button" 
        onClick={onNewChat}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H5V22L9 18H12C13.1 18 14 17.1 14 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 9V3M14 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>New Chat</span>
      </button>
    </div>
  );
};

export default NewChatButton; 