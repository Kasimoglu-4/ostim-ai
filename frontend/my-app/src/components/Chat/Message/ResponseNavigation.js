import React from 'react';

/**
 * ResponseNavigation Component
 * 
 * Handles navigation controls for multiple assistant responses
 */
const ResponseNavigation = ({ 
  responses, 
  currentResponseIndex, 
  onPrevious, 
  onNext 
}) => {
  // Don't render if there's only one or no responses
  if (!responses || responses.length <= 1) {
    return null;
  }

  const currentIndex = currentResponseIndex || 0;

  return (
    <div className="response-navigation">
      <button 
        className="nav-button nav-previous" 
        onClick={onPrevious}
        title="Previous response"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </button>
      
      <span className="response-counter">
        {currentIndex + 1} / {responses.length}
      </span>
      
      <button 
        className="nav-button nav-next" 
        onClick={onNext}
        title="Next response"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>
    </div>
  );
};

export default React.memo(ResponseNavigation); 