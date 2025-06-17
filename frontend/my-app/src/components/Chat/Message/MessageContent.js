import React, { lazy, Suspense } from 'react';
import ContentFormatter from './ContentFormatter';

// Lazy load syntax highlighter
const LazyCodeBlock = lazy(() => 
  Promise.all([
    import('react-syntax-highlighter'),
    import('react-syntax-highlighter/dist/esm/styles/prism')
  ]).then(([syntaxModule, themeModule]) => {
    const SyntaxHighlighter = syntaxModule.Prism;
    const oneDark = themeModule.oneDark;
    
    return {
      default: ({ language, content, customStyle }) => (
        <SyntaxHighlighter
          language={language || 'text'}
          style={oneDark}
          customStyle={customStyle}
          showLineNumbers={true}
        >
          {content}
        </SyntaxHighlighter>
      )
    };
  })
);

/**
 * MessageContent Component
 * 
 * Handles content parsing and rendering with support for:
 * - Code blocks with syntax highlighting
 * - Mathematical expressions
 * - Think sections
 * - Rich text formatting
 * - Search term highlighting
 */
const MessageContent = ({ content, showThinkSections = false, searchContext, onClearSearchContext }) => {
  // Function to highlight search terms in text
  const highlightSearchTerms = (text) => {
    if (!searchContext || !searchContext.searchTerms || searchContext.searchTerms.length === 0) {
      return text;
    }

    let highlightedText = text;
    
    // Apply highlighting for each search term
    searchContext.searchTerms.forEach(term => {
      if (term.length < 2) return; // Skip very short terms
      
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        const regex = new RegExp(`\\b(${escapedTerm})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
      } catch (e) {
        console.warn('Regex error highlighting term:', term, e);
      }
    });
    
    return highlightedText;
  };

  // Parse content with code blocks
  const parseContentWithCodeBlocks = (text) => {
    if (typeof text !== 'string') return text;

    const codeBlockPattern = /```(\w*)\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockPattern.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        parts.push({ type: 'text', content: beforeText });
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2];
      parts.push({ 
        type: 'codeblock', 
        language: language, 
        content: code 
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push({ type: 'text', content: remainingText });
    }

    // If no code blocks were found, treat entire content as text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return parts;
  };

  // Code block wrapper component
  const CodeBlockWrapper = ({ language, content, customStyle }) => {
    return (
      <Suspense fallback={<div className="code-loading">Loading code block...</div>}>
        <LazyCodeBlock language={language} content={content} customStyle={customStyle} />
      </Suspense>
    );
  };

  // Render code block with header and copy functionality
  const renderCodeBlock = (part, index) => (
    <div key={index} className="code-block-container">
      <div className="code-block-header">
        <span className="code-language">{part.language || 'text'}</span>
        <button 
          className="code-copy-button"
          onClick={() => navigator.clipboard.writeText(part.content)}
          title="Copy code"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>
      <CodeBlockWrapper 
        language={part.language || 'text'} 
        content={part.content} 
        customStyle={{ 
          margin: 0, 
          borderRadius: '0 0 8px 8px', 
          fontSize: '14px', 
          lineHeight: '1.4' 
        }} 
      />
    </div>
  );

  // Check if content has think tags and handle them
  if (typeof content === 'string' && content.includes('<think>') && content.includes('</think>')) {
    const parts = content.split(/<\/?think>/);
    
    if (parts.length > 1) {
      const cleanContent = parts.filter((_, index) => index % 2 === 0).join('').trim();
      const thinkContent = parts.filter((part, index) => index % 2 === 1 && part.trim().length > 0);
      
      return (
        <>
          <div className="clean-content">
            {parseContentWithCodeBlocks(cleanContent).map((part, index) => {
              if (part.type === 'codeblock') {
                return renderCodeBlock(part, index);
              } else {
                return (
                  <span 
                    key={index} 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightSearchTerms(ContentFormatter.processFormatting(part.content)) 
                    }}
                  />
                );
              }
            })}
          </div>
          
          {showThinkSections && thinkContent.length > 0 && (
            <div className="thinking-section">
              <div className="thinking-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                  <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Thinking Process
              </div>
              {thinkContent.map((thought, index) => (
                <div key={index} className="think-content">
                  {parseContentWithCodeBlocks(thought.trim()).map((part, partIndex) => {
                    if (part.type === 'codeblock') {
                      return renderCodeBlock(part, partIndex);
                    } else {
                      return (
                        <span 
                          key={partIndex} 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightSearchTerms(ContentFormatter.processFormatting(part.content)) 
                          }}
                        />
                      );
                    }
                  })}
                </div>
              ))}
            </div>
          )}
        </>
      );
    }
  }

  // Regular content without think tags
  return (
    <div className="message-content-parsed">
      {parseContentWithCodeBlocks(content).map((part, index) => {
        if (part.type === 'codeblock') {
          return renderCodeBlock(part, index);
        } else {
          return (
            <span 
              key={index} 
              dangerouslySetInnerHTML={{ 
                __html: highlightSearchTerms(ContentFormatter.processFormatting(part.content)) 
              }}
            />
          );
        }
      })}
    </div>
  );
};

export default React.memo(MessageContent); 