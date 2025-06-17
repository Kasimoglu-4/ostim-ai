import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/SharedChatViewer.css';

// Lazy load syntax highlighter to reduce initial bundle size
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

const SharedChatViewer = () => {
    const { shareToken } = useParams();
    const [chatData, setChatData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Apply theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = `${savedTheme}-theme`;
    }, []);

    const fetchSharedChat = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`http://localhost:9191/api/share/${shareToken}`);
            
            if (response.ok) {
                const data = await response.json();
                setChatData(data);
            } else if (response.status === 404) {
                setError('This shared chat was not found or may have been removed.');
            } else {
                setError('Failed to load the shared chat. Please try again later.');
            }
        } catch (err) {
            setError('Network error occurred. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [shareToken]);

    useEffect(() => {
        if (shareToken) {
            fetchSharedChat();
        }
    }, [shareToken, fetchSharedChat]);

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    // Complete content rendering logic from Message component
    const renderContent = (content) => {
        // Helper function to parse code blocks and render components
        const parseContentWithCodeBlocks = (text) => {
            if (typeof text !== 'string') return text;

            // Split by code blocks (```language...code...```)
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

        // Function to process regular text formatting (everything except code blocks)
        const processFormatting = (text) => {
            let processedText = text;

            // First, normalize whitespace and reduce excessive newlines
            processedText = processedText.replace(/\n{3,}/g, '\n\n'); // Replace 3+ newlines with 2
            processedText = processedText.replace(/^\s+|\s+$/g, ''); // Trim start and end
            
            // Process LaTeX mathematical expressions before other formatting
            processedText = processMathematicalExpressions(processedText);
            
            // Split text by numbered sections first to handle them properly
            const numberedSectionPattern = /(?:^|\n)(\d+)\.\s+(\*\*[^*]+\*\*:)/gm;
            const sections = [];
            const matches = [...processedText.matchAll(numberedSectionPattern)];
            
            if (matches.length > 0) {
                // Add text before first numbered section
                if (matches[0].index > 0) {
                    const beforeText = processedText.slice(0, matches[0].index).trim();
                    if (beforeText) {
                        sections.push({ type: 'text', content: beforeText });
                    }
                }
                
                // Process each numbered section
                for (let i = 0; i < matches.length; i++) {
                    const match = matches[i];
                    const nextMatch = matches[i + 1];
                    
                    const number = match[1];
                    const title = match[2].replace(/\*\*/g, ''); // Remove ** markers
                    
                    // Get the content for this section (everything until the next numbered section)
                    const sectionStart = match.index + match[0].length;
                    const sectionEnd = nextMatch ? nextMatch.index : processedText.length;
                    const sectionContent = processedText.slice(sectionStart, sectionEnd).trim();
                    
                    // Build HTML for this numbered section
                    let listHtml = '<div class="custom-ordered-list">';
                    listHtml += '<div class="custom-list-item">';
                    listHtml += `<span class="item-number">${number}.</span>`;
                    listHtml += `<div class="item-content"><strong>${title}</strong>`;
                    
                    // Process bullet points in this section
                    if (sectionContent) {
                        const bulletPoints = sectionContent.split(/\n\s*-\s+/).filter(item => item.trim() && !item.match(/^\d+\./));
                        if (bulletPoints.length > 0) {
                            // Remove any content before the first bullet point (usually empty)
                            const filteredBullets = bulletPoints.slice(bulletPoints[0].trim() === '' ? 1 : 0);
                            
                            if (filteredBullets.length > 0) {
                                listHtml += '<ul class="message-ul">';
                                filteredBullets.forEach(bullet => {
                                    const cleanBullet = bullet.trim();
                                    if (cleanBullet && !cleanBullet.match(/^\d+\./)) {
                                        listHtml += `<li class="message-li">${cleanBullet}</li>`;
                                    }
                                });
                                listHtml += '</ul>';
                            }
                        }
                    }
                    
                    listHtml += '</div></div></div>';
                    sections.push({ type: 'list', content: listHtml });
                }
                
                // Add any remaining text after the last numbered section
                const lastMatch = matches[matches.length - 1];
                const lastSectionEnd = lastMatch.index + lastMatch[0].length;
                
                // Find content after the last numbered section's bullet points
                const remainingContent = processedText.slice(lastSectionEnd);
                const afterBullets = remainingContent.split(/\n(?=\d+\.\s)/)[0]; // Stop at next numbered item
                const finalText = remainingContent.slice(afterBullets.length).trim();
                
                if (finalText && !finalText.match(/^\d+\./)) {
                    sections.push({ type: 'text', content: finalText });
                }
                
                // Rebuild the processed text
                processedText = sections.map(section => section.content).join('\n');
            } else {
                // Fallback: process simpler numbered lists if no bold titles found
                const simpleNumberedPattern = /(\d+)\.\s+([^\n]+(?:\n\s*-\s+[^\n]+)*)/g;
                
                processedText = processedText.replace(simpleNumberedPattern, (match, number, content) => {
                    const lines = content.split('\n');
                    const mainItem = lines[0];
                    
                    let listHtml = '<div class="custom-ordered-list">';
                    const subItems = lines.slice(1).filter(line => line.trim().startsWith('-'));
                    
                    if (subItems.length > 0) {
                        const parts = content.split(/\n\s*-\s+/);
                        const mainText = parts[0];
                        
                        let ulHtml = '<ul class="message-ul">';
                        for (let i = 1; i < parts.length; i++) {
                            const nestedItem = parts[i].replace(/^-\s+/, '');
                            ulHtml += `<li class="message-li">${nestedItem}</li>`;
                        }
                        ulHtml += '</ul>';
                        
                        listHtml += `<div class="custom-list-item"><span class="item-number">${number}.</span><div class="item-content">${mainText}${ulHtml}</div></div>`;
                    } else {
                        listHtml += `<div class="custom-list-item"><span class="item-number">${number}.</span><div class="item-content">${mainItem}</div></div>`;
                    }
                    
                    listHtml += '</div>';
                    return listHtml;
                });
            }
            
            // Process standalone unordered lists (not within ordered lists)
            const unorderedListPattern = /(?:^|\n)(\s*-\s+[^\n]+)+/g;
            
            processedText = processedText.replace(unorderedListPattern, (match) => {
                if (match.includes('<li class="message-li">')) {
                    return match;
                }
                
                const items = match.split(/\n\s*-\s+/).filter(item => item.trim());
                let ulHtml = '<ul class="message-ul">';
                items.forEach(item => {
                    ulHtml += `<li class="message-li">${item}</li>`;
                });
                ulHtml += '</ul>';
                return ulHtml;
            });
            
            // Process inline code (text between single backticks) - but not code blocks
            processedText = processedText.replace(/(?<!`)`([^`\n]+)`(?!`)/g, function(match, code) {
                code = code.trim();
                return '<code class="code-inline">' + code + '</code>';
            });
            
            // Process bold text
            processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Final cleanup: ensure single newlines between HTML blocks
            processedText = processedText.replace(/(<\/div>)\s*\n{2,}\s*(<div)/g, '$1\n$2');
            processedText = processedText.replace(/\n{2,}/g, '\n');
            
            // Clean up spacing around mathematical expressions
            processedText = processedText.replace(/\n\s*<div class="latex-display-equation">/g, '<div class="latex-display-equation">');
            processedText = processedText.replace(/<\/div>\s*\n\s*/g, '</div>');
            
            return processedText;
        };

        // Function to detect and format mathematical expressions with LaTeX
        const processMathematicalExpressions = (text) => {
            let processedText = text;
            
            // Process display equations (block-level math) first
            // Pattern for \[ ... \] or $$ ... $$
            processedText = processedText.replace(/\\\[([\s\S]*?)\\\]/g, (match, equation) => {
                const formattedEquation = formatMathematicalExpression(equation.trim());
                return `<div class="latex-display-equation">${formattedEquation}</div>`;
            });
            
            processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
                const formattedEquation = formatMathematicalExpression(equation.trim());
                return `<div class="latex-display-equation">${formattedEquation}</div>`;
            });
            
            // Process inline equations \( ... \) or $ ... $
            processedText = processedText.replace(/\\\((.*?)\\\)/g, (match, equation) => {
                const formattedEquation = formatMathematicalExpression(equation.trim());
                return `<span class="latex-inline-equation">${formattedEquation}</span>`;
            });
            
            processedText = processedText.replace(/\$([^$\n]+)\$/g, (match, equation) => {
                const formattedEquation = formatMathematicalExpression(equation.trim());
                return `<span class="latex-inline-equation">${formattedEquation}</span>`;
            });
            
            // Detect and format common mathematical patterns that aren't already in LaTeX
            // Pattern for expressions like "(50 + 90) = 140"
            processedText = processedText.replace(/\(\s*(\d+)\s*\+\s*(\d+)\s*\)\s*=\s*(\d+)/g, (match, num1, num2, result) => {
                return `<span class="latex-inline-equation">(${num1} + ${num2}) = ${result}</span>`;
            });
            
            // Pattern for expressions like "148 / 2 = 70" or "148/2 = 70" - INLINE not display
            processedText = processedText.replace(/(\d+)\s*\/\s*(\d+)\s*=\s*(\d+)/g, (match, numerator, denominator, result) => {
                return `<span class="latex-inline-equation"><span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span> = ${result}</span>`;
            });
            
            // Pattern for "70 + 30 = 100" - INLINE not display
            processedText = processedText.replace(/(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/g, (match, num1, num2, result) => {
                return `<span class="latex-inline-equation">${num1} + ${num2} = ${result}</span>`;
            });
            
            // Pattern for "90 - 50 = 40" - INLINE not display
            processedText = processedText.replace(/(\d+)\s*-\s*(\d+)\s*=\s*(\d+)/g, (match, num1, num2, result) => {
                return `<span class="latex-inline-equation">${num1} - ${num2} = ${result}</span>`;
            });
            
            return processedText;
        };

        // Function to format mathematical expressions
        const formatMathematicalExpression = (expression) => {
            let formatted = expression;
            
            // Replace * with × for multiplication
            formatted = formatted.replace(/\*/g, '×');
            
            // Replace \div with ÷ for division
            formatted = formatted.replace(/\\div/g, '÷');
            
            // Format fractions
            formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, numerator, denominator) => {
                return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
            });
            
            // Format simple fractions (number/number)
            formatted = formatted.replace(/(\d+)\/(\d+)/g, (match, numerator, denominator) => {
                return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
            });
            
            // Format boxed expressions
            formatted = formatted.replace(/\\boxed\{([^}]+)\}/g, (match, content) => {
                return `<span class="boxed-result">${content}</span>`;
            });
            
            // Format square roots
            formatted = formatted.replace(/\\sqrt\{([^}]+)\}/g, (match, content) => {
                return `<span class="sqrt">√<span class="sqrt-content">${content}</span></span>`;
            });
            
            // Format superscripts
            formatted = formatted.replace(/\^(\d+)/g, (match, exponent) => {
                return `<sup>${exponent}</sup>`;
            });
            
            // Format subscripts
            formatted = formatted.replace(/_(\d+)/g, (match, subscript) => {
                return `<sub>${subscript}</sub>`;
            });
            
            return formatted;
        };

        // Check if content has <think> tags
        if (typeof content === 'string' && content.includes('<think>') && content.includes('</think>')) {
            const parts = content.split(/<\/?think>/);
            
            if (parts.length > 1) {
                const cleanContent = parts.filter((_, index) => index % 2 === 0).join('').trim();
                
                return (
                    <div className="clean-content">
                        {parseContentWithCodeBlocks(cleanContent).map((part, index) => {
                            if (part.type === 'codeblock') {
                                return (
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
                                        <CodeBlockWrapper language={part.language || 'text'} content={part.content} customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '14px', lineHeight: '1.4' }} />
                                    </div>
                                );
                            } else {
                                return (
                                    <span 
                                        key={index} 
                                        dangerouslySetInnerHTML={{ __html: processFormatting(part.content) }}
                                    />
                                );
                            }
                        })}
                    </div>
                );
            }
        }

        // If no think tags, parse content for code blocks
        return (
            <div className="message-content-parsed">
                {parseContentWithCodeBlocks(content).map((part, index) => {
                    if (part.type === 'codeblock') {
                        return (
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
                                <CodeBlockWrapper language={part.language || 'text'} content={part.content} customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '14px', lineHeight: '1.4' }} />
                            </div>
                        );
                    } else {
                        return (
                            <span 
                                key={index} 
                                dangerouslySetInnerHTML={{ __html: processFormatting(part.content) }}
                            />
                        );
                    }
                })}
            </div>
        );
    };

    const renderMessage = (message, index) => {
        const isUser = message.messageType === 'user';
        const messageContent = message.messageContent || message.content || '';
        const messageTime = message.createdTime || message.timestamp;
        
        // Function to handle copying message content
        const handleCopy = () => {
            let textToCopy = messageContent;
            
            // Check if content has think tags and extract only the clean content
            if (typeof textToCopy === 'string' && textToCopy.includes('<think>') && textToCopy.includes('</think>')) {
                const parts = textToCopy.split(/<\/?think>/);
                if (parts.length > 1) {
                    // Join all non-think parts to make a clean message
                    textToCopy = parts.filter((_, index) => index % 2 === 0).join('').trim();
                }
            }
            
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    console.log('Message copied to clipboard');
                })
                .catch(err => {
                    console.error('Failed to copy message: ', err);
                });
        };
        
        if (isUser) {
            return (
                <div key={index} className="message-wrapper shared-width-container">
                    <div className="message-container user">
                        <div className="message-content">
                            <div className="message-text">
                                {renderContent(messageContent)}
                            </div>
                        </div>
                        <div className="message-time">
                            {formatMessageTime(messageTime)}
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div key={index} className="message-wrapper shared-width-container">
                    <div className="message-container assistant left-edge">
                        <div className="avatar-content-wrapper">
                            <div className="message-avatar">
                                <div className="avatar">
                                    <img src="https://www.bizimlebasvur.com/wp-content/uploads/2023/07/Ostim-Teknik-Universitesi.webp" alt="AI Logo" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                                </div>
                            </div>
                            <div className="message-content">
                                <div className="message-text">
                                    {renderContent(messageContent)}
                                </div>
                                <div className="assistant-controls">
                                    <div className="message-feedback">
                                        <button className="feedback-button" onClick={handleCopy} title="Copy">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="assistant-time">
                                        {formatMessageTime(messageTime)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    // Show a loading state if still loading
    if (loading) {
        return (
            <div className="chat-interface">
                <div className="chat-area">
                    <div className="chat-header">
                        <div className="chat-title-container">
                            <h1 className="chat-title">Loading...</h1>
                        </div>
                    </div>
                    
                    <div className="messages-container">
                        <div className="message-list-container">
                            <div className="message-list">
                                <div className="loading-indicator">
                                    <div className="loading-spinner"></div>
                                    <p>Loading shared chat...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="chat-interface">
                <div className="chat-area">

                    
                    <div className="messages-container">
                        <div className="message-list-container">
                            <div className="message-list">
                                <div className="error-container">
                                    <div className="error-icon">⚠️</div>
                                    <h2>Chat Not Available</h2>
                                    <p>{error}</p>
                                    <button 
                                        className="error-back-button"
                                        onClick={() => window.location.href = '/'}
                                    >
                                        Go to Ostim AI
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show empty state
    if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        return (
            <div className="chat-interface">
                <div className="chat-area">
                    <div className="chat-header">
                        <div className="chat-title-container">
                            <h1 className="chat-title">Empty Chat</h1>
                        </div>
                    </div>
                    
                    <div className="messages-container">
                        <div className="message-list-container">
                            <div className="message-list">
                                <div className="empty-chat">
                                    <p>This shared chat is empty.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main render with chat data - full width without sidebar or input
    return (
        <div className="chat-interface">
            <div className="chat-area">
                <div className="chat-header">
                    <div className="chat-title-container">
                        <div className="app-title">
                            <h2 className="app-brand">OSTIM AI</h2>
                        </div>
                        <h1 className="chat-title">{chatData.chat.title}</h1>
                    </div>
                </div>
                
                <div className="messages-container">
                    <div className="message-list-container">
                        <div className="message-list active-chat">
                            {chatData.messages.map((message, index) => renderMessage(message, index))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Code block component with lazy loading
const CodeBlockWrapper = ({ language, content, customStyle }) => {
    return (
        <Suspense fallback={<div className="code-loading">Loading code block...</div>}>
            <LazyCodeBlock language={language} content={content} customStyle={customStyle} />
        </Suspense>
    );
};

export default SharedChatViewer; 