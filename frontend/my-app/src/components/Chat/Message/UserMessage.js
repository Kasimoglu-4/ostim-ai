import React, { useState } from 'react';
import MessageContent from './MessageContent';
import FileAttachments from './FileAttachments';
import MessageActions from './MessageActions';

/**
 * UserMessage Component
 * 
 * Handles rendering and editing of user messages
 */
const UserMessage = ({ 
  message, 
  onEditMessage,
  onLike,
  onDislike,
  searchContext,
  onClearSearchContext
}) => {
  const { content, timestamp, id, attachments } = message;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  // Edit handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEditMessage && editedContent.trim() !== '') {
      onEditMessage(id, editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleInputChange = (e) => {
    setEditedContent(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        console.log('Message copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy message: ', err);
      });
  };

  // Edit mode UI
  if (isEditing) {
    return (
      <div className="message-container user">
        <div className="edit-container">
          <textarea 
            value={editedContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            autoFocus
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button onClick={handleCancel} className="edit-button cancel">
              Cancel
            </button>
            <button onClick={handleSave} className="edit-button save">
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal display mode
  return (
    <div className="message-container user">
      <MessageActions 
        onEdit={handleEdit}
        onCopy={handleCopy}
      />
      
      <div className="message-content">
        <MessageContent content={content} searchContext={searchContext} />
        <FileAttachments attachments={attachments} />
      </div>
      
      <span className="message-time">{formattedTime}</span>
    </div>
  );
};

export default React.memo(UserMessage); 