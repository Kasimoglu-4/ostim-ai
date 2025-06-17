import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchService from '../../services/SearchService';
import '../../styles/SmartSearch.css';

/**
 * SmartSearch Component
 * 
 * Provides semantic search through all conversations to find similar past questions and answers
 */
const SmartSearch = ({ currentConversationId, onSelectConversation, collapsed = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);

  // Database-based search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      console.log('Performing database search for:', query);
      const results = await SearchService.searchConversations(query, currentConversationId);
      setSearchResults(results);
      setShowResults(results.length > 0);
      console.log(`Search completed: ${results.length} results found`);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [currentConversationId]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle result selection
  const handleResultClick = (result) => {
    setIsExpanded(false);
    setSearchQuery('');
    setShowResults(false);
    // Pass both conversation ID and search context
    onSelectConversation(result.conversationId, {
      searchQuery: searchQuery,
      messageId: result.message.id,
      messageIndex: result.messageIndex,
      searchTerms: searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 1)
    });
  };

  // Handle search focus
  const handleFocus = () => {
    setIsExpanded(true);
    if (searchQuery && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  // Handle search blur (with delay to allow clicking on results)
  const handleBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setSearchQuery('');
      setShowResults(false);
      searchInputRef.current?.blur();
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500); // Increased delay for database queries

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // For collapsed sidebar, show just the search icon
  if (collapsed) {
    return (
      <>
        <button 
          className="smart-search-collapsed"
          onClick={() => setIsExpanded(!isExpanded)}
          title="Smart Search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        {isExpanded && (
          <div className="smart-search-modal-overlay" onClick={() => setIsExpanded(false)}>
            <div className="smart-search-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Smart Search</h3>
                <button 
                  className="modal-close"
                  onClick={() => setIsExpanded(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="modal-search-container">
                <div className="search-input-container">
                  <div className="search-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    className="search-input"
                    autoFocus
                  />
                  
                  {isSearching && (
                    <div className="search-loading">
                      <div className="loading-spinner"></div>
                    </div>
                  )}
                  
                  {searchQuery && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="modal-search-results">
                    <div className="results-header">
                      <span className="results-count">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                    
                    <div className="results-list">
                      {searchResults.map((result, index) => (
                        <div 
                          key={`${result.conversationId}-${result.messageIndex}-${index}`}
                          className="search-result-item"
                          onClick={() => {
                            handleResultClick(result);
                            setIsExpanded(false);
                          }}
                        >
                          <div className="result-header">
                            <span className="conversation-title">
                              {result.conversationTitle}
                            </span>
                            <span className="result-timestamp">
                              {formatTimestamp(result.timestamp)}
                            </span>
                          </div>
                          
                          <div className="result-content">
                            <div className="message-role">
                              {result.message.role === 'user' ? 'Question' : 'Answer'}
                            </div>
                            <div 
                              className="message-snippet"
                              dangerouslySetInnerHTML={{ __html: result.message.snippet }}
                            />
                          </div>
                          
                          <div className="result-footer">
                            <span className={`match-type ${result.matchType}`}>
                              {result.matchType === 'exact' ? 'Exact match' : 
                               result.matchType === 'title' ? 'Title match' : 
                               'Content match'}
                            </span>
                            <span className="relevance-score">
                              {Math.round(result.score / 10)} relevance
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {isSearching && searchQuery && (
                  <div className="modal-loading-results">
                    <div className="loading-spinner"></div>
                    <div className="search-loading-text">Searching all conversations in database...</div>
                  </div>
                )}
                
                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className="search-no-results">
                    <p>No results found</p>
                    <p className="no-results-hint">Try different keywords</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`smart-search ${isExpanded ? 'expanded' : ''}`}>
      <div className="search-input-container">
        <div className="search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        
        {isSearching && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={() => {
              setSearchQuery('');
              setShowResults(false);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {showResults && (
        <div className="search-results">
          <div className="results-header">
            <span className="results-count">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          <div className="results-list">
            {searchResults.map((result, index) => (
              <div 
                key={`${result.conversationId}-${result.messageIndex}-${index}`}
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <div className="result-header">
                  <span className="conversation-title">
                    {result.conversationTitle}
                  </span>
                  <span className="result-timestamp">
                    {formatTimestamp(result.timestamp)}
                  </span>
                </div>
                
                <div className="result-content">
                  <div className="message-role">
                    {result.message.role === 'user' ? 'Question' : 'Answer'}
                  </div>
                  <div 
                    className="message-snippet"
                    dangerouslySetInnerHTML={{ __html: result.message.snippet }}
                  />
                </div>
                
                <div className="result-footer">
                  <span className={`match-type ${result.matchType}`}>
                    {result.matchType === 'exact' ? 'Exact match' : 
                     result.matchType === 'title' ? 'Title match' : 
                     'Content match'}
                  </span>
                  <span className="relevance-score">
                    {Math.round(result.score / 10)} relevance
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isSearching && searchQuery && (
        <div className="search-loading-results">
          <div className="loading-spinner"></div>
          <div className="search-loading-text">Searching all conversations...</div>
        </div>
      )}
      
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="search-no-results">
          <p>No results found</p>
          <p className="no-results-hint">Try different keywords</p>
        </div>
      )}
    </div>
  );
};

export default SmartSearch; 