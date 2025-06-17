import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/GlobalFeedbackModal.css';
import { createVote } from '../../services/api';

// This is a singleton modal that will be used across the application
const GlobalFeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [comment, setComment] = useState('');
  const [onSubmitCallback, setOnSubmitCallback] = useState(null);
  const [messageId, setMessageId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const resetState = () => {
    setIsOpen(false);
    setSelectedOption('');
    setComment('');
    setSubmitError(null);
    setMessageId(null);
    setChatId(null);
  };

  const handleClose = useCallback(() => {
    resetState();
  }, []);

  // For handling positive feedback without showing the modal
  const handleSilentFeedback = useCallback(async (feedbackType, directMessageId = null, directChatId = null, directCallback = null) => {
    try {
      // Use direct parameters if provided, otherwise fall back to state
      const effectiveMessageId = directMessageId !== null ? directMessageId : messageId;
      const effectiveChatId = directChatId !== null ? directChatId : chatId;
      const effectiveCallback = directCallback || onSubmitCallback;
      
      setIsSubmitting(true);
      
      // Positive feedback gets a +1, negative gets a -1
      const voteInt = feedbackType === "positive" ? 1 : -1;
      let voteId = null;
      
      if (effectiveChatId) {
        // Validate that we have both chatId and messageId
        if (!effectiveMessageId) {
          if (effectiveCallback) {
            effectiveCallback({ 
              type: feedbackType, 
              error: "Message ID is missing" 
            });
          }
          setIsSubmitting(false);
          handleClose();
          return;
        }
        
        // Send to backend via API
        const voteData = {
          chatId: parseInt(effectiveChatId, 10),
          messageId: parseInt(effectiveMessageId, 10), // Add messageId to the payload
          voteInt: voteInt,
          comment: feedbackType === "positive" ? "" : "", // Empty comment for positive feedback
          createdTime: new Date().toISOString() // Add timestamp for backend
        };
        
        try {
          const response = await createVote(effectiveChatId, voteData);
          
          if (response && response.data) {
            voteId = response.data.voteId; // Use the correct field name
          }
        } catch (apiError) {
          throw apiError; // Re-throw to be caught by outer catch
        }
      } else {
        if (effectiveCallback) {
          effectiveCallback({ 
            type: feedbackType, 
            error: "Chat ID is missing" 
          });
        }
      }
      
      // Report back the result (especially the voteId for potential deletion later)
      if (effectiveCallback) {
        effectiveCallback({ 
          type: feedbackType, 
          voteId: voteId
        });
      }
      
      setIsSubmitting(false);
      handleClose();
    } catch (error) {
      setIsSubmitting(false);
      
      // Still close the modal and notify of failure
      handleClose();
      
      // Report error back to caller
      const effectiveCallback = directCallback || onSubmitCallback;
      if (effectiveCallback) {
        effectiveCallback({ 
          type: feedbackType, 
          error: error.message || "Failed to submit feedback" 
        });
      }
    }
  }, [messageId, chatId, onSubmitCallback, handleClose]);

  // Add global event listeners when the component mounts
  useEffect(() => {
    // Listen for custom events to open the modal
    const openModal = (event) => {
      if (event.detail) {
        if (event.detail.onSubmit) {
          setOnSubmitCallback(() => event.detail.onSubmit);
        }
        
        // Extract messageId and chatId from event detail
        let parsedMessageId = null;
        let parsedChatId = null;
        
        // Validate and set messageId
        if (event.detail.messageId !== undefined) {
          // Try to ensure it's a number
          try {
            parsedMessageId = parseInt(event.detail.messageId, 10);
            if (isNaN(parsedMessageId)) {
              parsedMessageId = null;
            } else {
              setMessageId(parsedMessageId);
            }
          } catch (e) {
            // Error parsing messageId
          }
        }
        
        // Validate and set chatId
        if (event.detail.chatId) {
          try {
            parsedChatId = parseInt(event.detail.chatId, 10);
            if (isNaN(parsedChatId)) {
              parsedChatId = null;
            } else {
              setChatId(parsedChatId);
            }
          } catch (e) {
            // Error parsing chatId
          }
        }
        
        // Check if we should skip showing the modal (for positive feedback)
        if (event.detail.skipModal) {
          // For positive feedback (like), submit automatically without showing modal
          // Pass the parsed values directly to avoid race condition with state
          handleSilentFeedback("positive", parsedMessageId, parsedChatId, event.detail.onSubmit);
        } else {
          // For negative feedback, show the modal
          setIsOpen(true);
          setSelectedOption(''); // Reset selection when opening
        }
      }
    };

    // Add event listener
    window.addEventListener('openFeedbackModal', openModal);

    // Cleanup
    return () => {
      window.removeEventListener('openFeedbackModal', openModal);
    };
  }, [handleSilentFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOption) return;
    
    // Create vote data object for the callback
    const feedbackData = {
      type: selectedOption,
      comment: comment,
      messageId: messageId
    };
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // For feedback modal submissions, always use negative vote (-1)
      const voteInt = -1;
      let voteId = null;
      
      if (chatId) {
        // Validate that we have both chatId and messageId
        if (!messageId) {
          setSubmitError("Cannot submit feedback: messageId is missing");
          setIsSubmitting(false);
          return;
        }
        
        // Send to backend via API
        const voteData = {
          chatId: parseInt(chatId, 10),
          messageId: parseInt(messageId, 10), // Add messageId to the payload
          voteInt: voteInt,
          comment: `${selectedOption}: ${comment}`,
          createdTime: new Date().toISOString() // Add timestamp for backend
        };
        
        const response = await createVote(chatId, voteData);
        
        // Extract voteId from response if available
        if (response && response.data) {
          voteId = response.data.voteId || response.data.id; // Try both field names
          feedbackData.voteId = voteId; // Add voteId to feedback data
        }
      } else {
        setSubmitError("Cannot submit feedback: chatId is missing");
        return;
      }
      
      // Call the callback if it exists
      if (onSubmitCallback) {
        onSubmitCallback(feedbackData);
      }
      
      handleClose();
    } catch (error) {
      if (error.response) {
        setSubmitError(`Failed to submit feedback: ${error.response.status} ${error.response.statusText}`);
      } else {
        setSubmitError("Failed to submit feedback. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not open, don't render anything
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="feedback-modal-overlay" onClick={(e) => {
      // Close when clicking outside the modal
      if (e.target.className === 'feedback-modal-overlay') {
        handleClose();
      }
    }}>
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <h3>Feedback</h3>
          <button className="close-button" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="feedback-options">
            <button
              type="button"
              className={`feedback-option ${selectedOption === 'harmful' ? 'active' : ''}`}
              onClick={() => setSelectedOption('harmful')}
            >
              Harmful / Unsafe
            </button>
            <button
              type="button"
              className={`feedback-option ${selectedOption === 'fake' ? 'active' : ''}`}
              onClick={() => setSelectedOption('fake')}
            >
              Fake
            </button>
            <button
              type="button"
              className={`feedback-option ${selectedOption === 'unhelpful' ? 'active' : ''}`}
              onClick={() => setSelectedOption('unhelpful')}
            >
              Unhelpful
            </button>

            <button
              type="button"
              className={`feedback-option ${selectedOption === 'other' ? 'active' : ''}`}
              onClick={() => setSelectedOption('other')}
            >
              Others
            </button>

          </div>
          <textarea
            className="feedback-textarea"
            placeholder="We appreciate your feedback. Please share any comments or suggestions that you have to help us improve."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {submitError && <div className="feedback-error">{submitError}</div>}
          <div className="feedback-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={!selectedOption || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function to open the modal from anywhere in the application
export const openGlobalFeedbackModal = (options = {}) => {
  setTimeout(() => {
    const event = new CustomEvent('openFeedbackModal', {
      detail: options
    });
    window.dispatchEvent(event);
  }, 10);
};

export default GlobalFeedbackModal; 