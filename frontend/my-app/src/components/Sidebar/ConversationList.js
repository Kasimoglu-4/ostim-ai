import React, { useState, useEffect, useRef } from 'react';
import '../../styles/ConversationList.css';

const ConversationList = ({ 
  conversations, 
  currentConversationId, 
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  highlightedConversationId = null
}) => {
  const [contextMenuState, setContextMenuState] = useState({
    isOpen: false,
    conversationId: null,
    menuPosition: { top: 0, left: 0 }
  });
  
  const [renamingState, setRenamingState] = useState({
    isRenaming: false,
    conversationId: null,
    currentTitle: ''
  });

  const [highlightedId, setHighlightedId] = useState(null);
  
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);
  const conversationRefs = useRef({}); // Refs for individual conversation items
  
  // Effect to handle clicks outside the menu to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          !(event.target.classList.contains('delete-button') && 
            event.target.closest('.conversation-item')?.dataset.id === contextMenuState.conversationId)) {
        closeContextMenu();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenuState.conversationId]);
  
  // Focus the rename input when it becomes visible
  useEffect(() => {
    if (renamingState.isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingState.isRenaming]);

  // Effect to handle highlighting from search results
  useEffect(() => {
    if (highlightedConversationId) {
      setHighlightedId(highlightedConversationId);
      
      // Scroll to the highlighted conversation
      const conversationElement = conversationRefs.current[highlightedConversationId];
      if (conversationElement) {
        conversationElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      // Remove highlight after animation
      const timeout = setTimeout(() => {
        setHighlightedId(null);
      }, 2000); // Highlight for 2 seconds

      return () => clearTimeout(timeout);
    }
  }, [highlightedConversationId]);

  if (!conversations || conversations.length === 0) {
    return (
      <div className="conversation-list-empty">
        <p>No conversations yet</p>
        <p className="hint">Click "New Chat" to start</p>
      </div>
    );
  }

  // Handle opening context menu
  const handleContextMenu = (e, conversationId) => {
    e.stopPropagation();
    
    // If the menu is already open for this conversation, close it
    if (contextMenuState.isOpen && contextMenuState.conversationId === conversationId) {
      closeContextMenu();
      return;
    }
    
    // Get position of the conversation item
    const conversationItem = e.currentTarget.closest('.conversation-item');
    const itemRect = conversationItem.getBoundingClientRect();
    
    setContextMenuState({
      isOpen: true,
      conversationId,
      menuPosition: { 
        top: (itemRect.top - 2) + 'px', 
        left: (itemRect.right + 8) + 'px'
      }
    });
  };

  // Handle closing context menu
  const closeContextMenu = () => {
    setContextMenuState({
      isOpen: false,
      conversationId: null,
      menuPosition: { top: 0, left: 0 }
    });
  };

  // Start the rename process
  const handleRename = (e, conversationId) => {
    e.stopPropagation();
    closeContextMenu();
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setRenamingState({
        isRenaming: true, 
        conversationId: conversationId,
        currentTitle: conversation.title
      });
    }
  };
  
  // Handle title change in the input
  const handleTitleChange = (e) => {
    setRenamingState({
      ...renamingState,
      currentTitle: e.target.value
    });
  };
  
  // Handle submission of the new title
  const handleRenameSubmit = (e) => {
    e.preventDefault();
    
    if (renamingState.currentTitle.trim()) {
      // Call the parent component method to update the title
      if (onRenameConversation) {
        onRenameConversation(renamingState.conversationId, renamingState.currentTitle);
      }
    }
    
    // Reset the renaming state
    setRenamingState({
      isRenaming: false,
      conversationId: null,
      currentTitle: ''
    });
  };
  
  // Cancel renaming
  const handleRenameCancel = () => {
    setRenamingState({
      isRenaming: false,
      conversationId: null,
      currentTitle: ''
    });
  };
  
  // Handle key presses during rename
  const handleRenameKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  // Handle delete with context menu close
  const handleDelete = (e, conversationId) => {
    e.stopPropagation();
    closeContextMenu();
    onDeleteConversation(conversationId);
  };

  // Determine the date category for a conversation
  const getDateCategory = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    // Calculate difference in days
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } 
    // Check if the date is yesterday
    else if (diffDays === 1) {
      return "Yesterday";
    }
    // Check if the date is within the last 7 days
    else if (diffDays < 7) {
      return "Last 7 Days";
    } 
    // Check if the date is within the last 30 days
    else if (diffDays < 30) {
      return "Last 30 Days";
    } 
    // For older dates, use year-month
    else {
      const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
      const year = date.getFullYear();
      return `${month} ${year}`;
    }
  };
  
  // Group conversations by date category
  const groupedConversations = conversations.reduce((groups, conversation) => {
    const category = getDateCategory(conversation.timestamp);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(conversation);
    return groups;
  }, {});

  // Sort categories in the order: TODAY, LAST 7 DAYS, LAST 30 DAYS, then chronologically for month-year
  const sortedCategories = Object.keys(groupedConversations).sort((a, b) => {
    const order = { "Today": 0, "Yesterday": 1, "Last 7 Days": 2, "Last 30 Days": 3 };
    if (order[a] !== undefined && order[b] !== undefined) {
      return order[a] - order[b];
    } else if (order[a] !== undefined) {
      return -1;
    } else if (order[b] !== undefined) {
      return 1;
    } else {
      // For year-month categories, sort in reverse (newest first)
      return new Date(b.split(' ')[1] + '-' + b.split(' ')[0]) - new Date(a.split(' ')[1] + '-' + a.split(' ')[0]);
    }
  });
  
  return (
    <div className="conversation-list">
      <div className="conversations-by-date">
        {sortedCategories.map(category => (
          <div key={category} className="conversation-date-group">
            <h3 className="date-header">{category}</h3>
            <ul className="conversations">
              {groupedConversations[category].map(conversation => (
                <li 
                  key={conversation.id}
                  data-id={conversation.id}
                  className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''} ${highlightedId === conversation.id ? 'highlighted' : ''}`}
                  onClick={() => onSelectConversation(conversation.id)}
                  ref={(el) => {
                    conversationRefs.current[conversation.id] = el;
                  }}
                >
                  <div className="conversation-info">
                    {renamingState.isRenaming && renamingState.conversationId === conversation.id ? (
                      <form onSubmit={handleRenameSubmit} className="rename-form" onClick={e => e.stopPropagation()}>
                        <input
                          ref={renameInputRef}
                          type="text"
                          className="rename-input"
                          value={renamingState.currentTitle}
                          onChange={handleTitleChange}
                          onKeyDown={handleRenameKeyDown}
                          onBlur={handleRenameSubmit}
                        />
                      </form>
                    ) : (
                      <div className="conversation-title">{conversation.title}</div>
                    )}
                    <div className="conversation-meta">
                      <span className="model-name">{conversation.model}</span>
                    </div>
                  </div>
                  <button 
                    className="delete-button" 
                    onClick={(e) => handleContextMenu(e, conversation.id)}
                    aria-label="Open menu"
                  >
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {contextMenuState.isOpen && (
        <div 
          ref={menuRef}
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenuState.menuPosition.top,
            left: contextMenuState.menuPosition.left
          }}
        >
          <button 
            className="context-menu-item"
            onClick={(e) => handleRename(e, contextMenuState.conversationId)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 3.5C18.3284 2.67157 19.6716 2.67157 20.5 3.5C21.3284 4.32843 21.3284 5.67157 20.5 6.5L12 15L8 16L9 12L17.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Rename</span>
          </button>
          <button 
            className="context-menu-item delete"
            onClick={(e) => handleDelete(e, contextMenuState.conversationId)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 7L9.6445 3.16795C9.87546 2.70577 10.3509 2.4 10.8685 2.4H13.1315C13.6491 2.4 14.1245 2.70577 14.3555 3.16795L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationList; 