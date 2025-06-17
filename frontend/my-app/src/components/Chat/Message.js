// import React, { useState, useEffect, lazy, Suspense } from 'react';
// import '../../styles/Message.css';
// import { openGlobalFeedbackModal } from './GlobalFeedbackModal';
// import { deleteVote } from '../../services/api';
// import mathUtils from '../../utils/mathUtils';

// // Lazy load syntax highlighter to reduce initial bundle size
// const LazyCodeBlock = lazy(() => 
//   Promise.all([
//     import('react-syntax-highlighter'),
//     import('react-syntax-highlighter/dist/esm/styles/prism')
//   ]).then(([syntaxModule, themeModule]) => {
//     const SyntaxHighlighter = syntaxModule.Prism;
//     const oneDark = themeModule.oneDark;
    
//     return {
//       default: ({ language, content, customStyle }) => (
//         <SyntaxHighlighter
//           language={language || 'text'}
//           style={oneDark}
//           customStyle={customStyle}
//           showLineNumbers={true}
//         >
//           {content}
//         </SyntaxHighlighter>
//       )
//     };
//   })
// );

// /**
//  * Message Component
//  * 
//  * Renders a chat message with the following features:
//  * - Support for different roles (user, assistant, system)
//  * - Ability to edit user messages
//  * - Special handling for <think> tags in AI responses
//  * - Copy message functionality
//  * - Timestamps for all messages
//  * - Multiple response support for assistant messages with navigation controls
//  * 
//  * Recent changes:
//  * - Added support for multiple responses in assistant messages
//  * - Added navigation controls (left/right arrows) to switch between responses
//  * - Added response counter display (e.g., "2 / 3")
//  * - Modified regenerate functionality to add new responses instead of replacing
//  */
// const Message = ({ message, onEditMessage, onRegenerateMessage, onNavigateResponse, selectedModel, showThinkSections }) => {
//   const { content, role, timestamp, id, responses, currentResponseIndex } = message;
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContent, setEditedContent] = useState(content);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isDisliked, setIsDisliked] = useState(false);
//   const [likeVoteId, setLikeVoteId] = useState(null);
//   const [dislikeVoteId, setDislikeVoteId] = useState(null);
  
//   // Log message object on init to debug
//   useEffect(() => {
//     console.log(`Message component initialized with ID ${id}`, {
//       messageObject: message,
//       availableProperties: Object.keys(message),
//       messageId: message.messageId,
//       id: id,
//       chatId: message.chatId
//     });
//   }, [id, message]);
  
//   // Get the actual database messageId - if not available use the UI id
//   const dbMessageId = message.messageId || id;
  
//   // For assistant messages, get the current response content
//   const getCurrentContent = () => {
//     if (role === 'assistant' && responses && responses.length > 0) {
//       const index = currentResponseIndex || 0;
//       return responses[index]?.content || content;
//     }
//     return content;
//   };
  
//   // Get current response timestamp for assistant messages
//   const getCurrentTimestamp = () => {
//     if (role === 'assistant' && responses && responses.length > 0) {
//       const index = currentResponseIndex || 0;
//       return responses[index]?.timestamp || timestamp;
//     }
//     return timestamp;
//   };
  
//   // Format the timestamp - handle both regular timestamp and current response timestamp
//   const formattedTime = new Date(getCurrentTimestamp()).toLocaleTimeString([], { 
//     hour: '2-digit', 
//     minute: '2-digit'
//   });

//   // Handle navigation between responses
//   const handlePreviousResponse = () => {
//     if (role === 'assistant' && responses && responses.length > 1 && onNavigateResponse) {
//       const currentIndex = currentResponseIndex || 0;
//       const newIndex = currentIndex > 0 ? currentIndex - 1 : responses.length - 1;
//       onNavigateResponse(id, newIndex);
//     }
//   };

//   const handleNextResponse = () => {
//     if (role === 'assistant' && responses && responses.length > 1 && onNavigateResponse) {
//       const currentIndex = currentResponseIndex || 0;
//       const newIndex = currentIndex < responses.length - 1 ? currentIndex + 1 : 0;
//       onNavigateResponse(id, newIndex);
//     }
//   };

//   // Function to handle copying message content
//   const handleCopy = () => {
//     let textToCopy = getCurrentContent();
    
//     // Check if content has think tags and extract only the clean content
//     if (typeof textToCopy === 'string' && textToCopy.includes('<think>') && textToCopy.includes('</think>')) {
//       const parts = textToCopy.split(/<\/?think>/);
//       if (parts.length > 1) {
//         // Join all non-think parts to make a clean message
//         textToCopy = parts.filter((_, index) => index % 2 === 0).join('').trim();
//       }
//     }
    
//     navigator.clipboard.writeText(textToCopy)
//       .then(() => {
//         console.log('Clean message copied to clipboard');
//       })
//       .catch(err => {
//         console.error('Failed to copy message: ', err);
//       });
//   };

//   // Function to handle regenerating a response
//   const handleRegenerate = () => {
//     // This would typically call back to a parent component to regenerate the message
//     console.log('Regenerate response for message:', id);
//     if (onRegenerateMessage) {
//       onRegenerateMessage(id);
//     }
//   };

//   // Function to handle liking a message
//   const handleLike = () => {
//     console.log('Like button clicked for message:', id, 'DB message ID:', dbMessageId);
    
//     // Clear any dislike state if like is clicked
//     if (isDisliked) {
//       console.log('Removing dislike state before setting like');
//       setIsDisliked(false);
//       // Delete dislike vote if it exists
//       if (dislikeVoteId) {
//         try {
//           console.log('Deleting previous dislike vote with ID:', dislikeVoteId);
//           deleteVote(dislikeVoteId)
//             .then(response => {
//               console.log('Successfully deleted dislike vote:', response);
//               setDislikeVoteId(null);
//             })
//             .catch(error => {
//               console.error("API error deleting dislike vote:", error);
//             });
//         } catch (error) {
//           console.error("Error deleting dislike vote:", error);
//         }
//       }
//     }
    
//     // Toggle liked state
//     const newLikedState = !isLiked;
//     console.log('Setting like state to:', newLikedState);
//     setIsLiked(newLikedState);
    
//     if (newLikedState) {
//       // Creating a new like vote
//       if (!message.chatId) {
//         console.warn("Cannot send like feedback: chatId is missing from message", message);
//         return;
//       }
      
//       console.log('Sending positive feedback to backend for message:', dbMessageId, 'chatId:', message.chatId);
      
//       // Send positive feedback to the backend
//       openGlobalFeedbackModal({
//         messageId: dbMessageId,
//         chatId: message.chatId,
//         skipModal: true, // Don't show the modal for positive feedback
//         onSubmit: (feedback) => {
//           // Store the vote ID returned from the backend
//           if (feedback.voteId) {
//             console.log('Received voteId from backend:', feedback.voteId);
//             setLikeVoteId(feedback.voteId);
//           } else if (feedback.error) {
//             console.error('Error recording like:', feedback.error);
//             // Revert UI state on error
//             setIsLiked(false);
//           } else {
//             console.warn('No voteId returned from backend');
//           }
//           console.log('Positive feedback recorded for message:', dbMessageId);
//         }
//       });
//     } else {
//       // Removing an existing like vote
//       if (likeVoteId) {
//         try {
//           console.log('Deleting like vote with ID:', likeVoteId);
//           deleteVote(likeVoteId)
//             .then(response => {
//               console.log('Successfully deleted like vote:', response);
//               setLikeVoteId(null);
//               console.log('Like vote removed for message:', dbMessageId);
//             })
//             .catch(error => {
//               console.error("API error deleting like vote:", error);
//               // If API call fails, revert the UI state to match the backend
//               setIsLiked(true);
//             });
//         } catch (error) {
//           console.error("Error deleting like vote:", error);
//           // Revert UI state on error
//           setIsLiked(true);
//         }
//       } else {
//         console.warn('No likeVoteId found to delete, skipping API call');
//       }
//     }
//   };

//   // Function to handle disliking a message
//   const handleDislike = () => {
//     console.log('Dislike button clicked for message:', id, 'DB message ID:', dbMessageId);
    
//     if (isLiked) {
//       setIsLiked(false);
//       // Delete like vote if it exists
//       if (likeVoteId) {
//         try {
//           console.log('Deleting like vote with ID:', likeVoteId);
//           deleteVote(likeVoteId);
//           setLikeVoteId(null);
//         } catch (error) {
//           console.error("Error deleting like vote:", error);
//         }
//       }
//     }
    
//     // Toggle disliked state
//     const newDislikedState = !isDisliked;
//     setIsDisliked(newDislikedState);
    
//     // If turning OFF dislike, delete the existing vote
//     if (!newDislikedState && dislikeVoteId) {
//       try {
//         console.log('Deleting dislike vote with ID:', dislikeVoteId);
//         deleteVote(dislikeVoteId)
//           .then(response => {
//             console.log('Successfully deleted dislike vote:', response);
//             setDislikeVoteId(null);
//             console.log('Dislike vote removed for message:', dbMessageId);
//           })
//           .catch(error => {
//             console.error("API error deleting dislike vote:", error);
//           });
//       } catch (error) {
//         console.error("Error deleting dislike vote:", error);
//       }
//       return;
//     }
    
//     // Only open the feedback modal if we're setting to disliked (true)
//     if (newDislikedState) {
//       if (!message.chatId) {
//         console.warn("Cannot send dislike feedback: chatId is missing from message", message);
//         return;
//       }
      
//       // Log details about the message object to debug
//       console.log('Message object details:', {
//         id: id,
//         messageId: message.messageId,
//         dbMessageId: dbMessageId,
//         chatId: message.chatId,
//         fullMessage: message
//       });
      
//       console.log('Opening feedback modal for message:', dbMessageId, 'chatId:', message.chatId);
      
//       // Open the global feedback modal with chatId and messageId
//       openGlobalFeedbackModal({
//         messageId: dbMessageId, // Use the database message ID
//         chatId: message.chatId,
//         onSubmit: (feedback) => {
//           // Store the vote ID returned from the backend
//           if (feedback.voteId) {
//             console.log('Received voteId from backend:', feedback.voteId);
//             setDislikeVoteId(feedback.voteId);
//           } else if (feedback.error) {
//             console.error('Error recording dislike:', feedback.error);
//             // Revert UI state on error
//             setIsDisliked(false);
//           } else {
//             console.warn('No voteId returned from backend for dislike');
//           }
//           console.log('Feedback submitted for message:', dbMessageId, feedback);
//         }
//       });
//     }
//   };

//   // Function to handle editing message
//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   // Function to save edited message
//   const handleSave = () => {
//     if (onEditMessage && editedContent.trim() !== '') {
//       onEditMessage(id, editedContent);
//     }
//     setIsEditing(false);
//   };

//   // Function to cancel editing
//   const handleCancel = () => {
//     setIsEditing(false);
//     setEditedContent(content);
//   };

//   // Handle input change
//   const handleInputChange = (e) => {
//     setEditedContent(e.target.value);
//   };

//   // Handle key press for saving on Enter
//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSave();
//     } else if (e.key === 'Escape') {
//       handleCancel();
//     }
//   };

//   // Function to render message content with proper formatting
//   const renderContent = (content) => {
//     // Helper function to parse code blocks and render components
//     const parseContentWithCodeBlocks = (text) => {
//       if (typeof text !== 'string') return text;

//       // Split by code blocks (```language...code...```)
//       const codeBlockPattern = /```(\w*)\n?([\s\S]*?)```/g;
//       const parts = [];
//       let lastIndex = 0;
//       let match;

//       while ((match = codeBlockPattern.exec(text)) !== null) {
//         // Add text before code block
//         if (match.index > lastIndex) {
//           const beforeText = text.slice(lastIndex, match.index);
//           parts.push({ type: 'text', content: beforeText });
//         }

//         // Add code block
//         const language = match[1] || 'text';
//         const code = match[2];
//         parts.push({ 
//           type: 'codeblock', 
//           language: language, 
//           content: code 
//         });

//         lastIndex = match.index + match[0].length;
//       }

//       // Add remaining text
//       if (lastIndex < text.length) {
//         const remainingText = text.slice(lastIndex);
//         parts.push({ type: 'text', content: remainingText });
//       }

//       // If no code blocks were found, treat entire content as text
//       if (parts.length === 0) {
//         parts.push({ type: 'text', content: text });
//       }

//       return parts;
//     };

//     // Function to process regular text formatting (everything except code blocks)
//     const processFormatting = (text) => {
//       let processedText = text;

//       // First, normalize whitespace and reduce excessive newlines
//       processedText = processedText.replace(/\n{3,}/g, '\n\n'); // Replace 3+ newlines with 2
//       processedText = processedText.replace(/^\s+|\s+$/g, ''); // Trim start and end
      
//       // Process LaTeX mathematical expressions before other formatting
//       processedText = processMathematicalExpressions(processedText);
      
//       // Split text by numbered sections first to handle them properly
//       const numberedSectionPattern = /(?:^|\n)(\d+)\.\s+(\*\*[^*]+\*\*:)/gm;
//       const sections = [];
//       const matches = [...processedText.matchAll(numberedSectionPattern)];
      
//       if (matches.length > 0) {
//         // Add text before first numbered section
//         if (matches[0].index > 0) {
//           const beforeText = processedText.slice(0, matches[0].index).trim();
//           if (beforeText) {
//             sections.push({ type: 'text', content: beforeText });
//           }
//         }
        
//         // Process each numbered section
//         for (let i = 0; i < matches.length; i++) {
//           const match = matches[i];
//           const nextMatch = matches[i + 1];
          
//           const number = match[1];
//           const title = match[2].replace(/\*\*/g, ''); // Remove ** markers
          
//           // Get the content for this section (everything until the next numbered section)
//           const sectionStart = match.index + match[0].length;
//           const sectionEnd = nextMatch ? nextMatch.index : processedText.length;
//           const sectionContent = processedText.slice(sectionStart, sectionEnd).trim();
          
//           // Build HTML for this numbered section
//           let listHtml = '<div class="custom-ordered-list">';
//           listHtml += '<div class="custom-list-item">';
//           listHtml += `<span class="item-number">${number}.</span>`;
//           listHtml += `<div class="item-content"><strong>${title}</strong>`;
          
//           // Process bullet points in this section
//           if (sectionContent) {
//             const bulletPoints = sectionContent.split(/\n\s*-\s+/).filter(item => item.trim() && !item.match(/^\d+\./));
//             if (bulletPoints.length > 0) {
//               // Remove any content before the first bullet point (usually empty)
//               const filteredBullets = bulletPoints.slice(bulletPoints[0].trim() === '' ? 1 : 0);
              
//               if (filteredBullets.length > 0) {
//                 listHtml += '<ul class="message-ul">';
//                 filteredBullets.forEach(bullet => {
//                   const cleanBullet = bullet.trim();
//                   if (cleanBullet && !cleanBullet.match(/^\d+\./)) {
//                     listHtml += `<li class="message-li">${cleanBullet}</li>`;
//                   }
//                 });
//                 listHtml += '</ul>';
//               }
//             }
//           }
          
//           listHtml += '</div></div></div>';
//           sections.push({ type: 'list', content: listHtml });
//         }
        
//         // Add any remaining text after the last numbered section
//         const lastMatch = matches[matches.length - 1];
//         const lastSectionEnd = lastMatch.index + lastMatch[0].length;
        
//         // Find content after the last numbered section's bullet points
//         const remainingContent = processedText.slice(lastSectionEnd);
//         const afterBullets = remainingContent.split(/\n(?=\d+\.\s)/)[0]; // Stop at next numbered item
//         const finalText = remainingContent.slice(afterBullets.length).trim();
        
//         if (finalText && !finalText.match(/^\d+\./)) {
//           sections.push({ type: 'text', content: finalText });
//         }
        
//         // Rebuild the processed text
//         processedText = sections.map(section => section.content).join('\n');
//       } else {
//         // Fallback: process simpler numbered lists if no bold titles found
//         const simpleNumberedPattern = /(\d+)\.\s+([^\n]+(?:\n\s*-\s+[^\n]+)*)/g;
        
//         processedText = processedText.replace(simpleNumberedPattern, (match, number, content) => {
//           const lines = content.split('\n');
//           const mainItem = lines[0];
          
//           let listHtml = '<div class="custom-ordered-list">';
//           const subItems = lines.slice(1).filter(line => line.trim().startsWith('-'));
          
//           if (subItems.length > 0) {
//             const parts = content.split(/\n\s*-\s+/);
//             const mainText = parts[0];
            
//             let ulHtml = '<ul class="message-ul">';
//             for (let i = 1; i < parts.length; i++) {
//               const nestedItem = parts[i].replace(/^-\s+/, '');
//               ulHtml += `<li class="message-li">${nestedItem}</li>`;
//             }
//             ulHtml += '</ul>';
            
//             listHtml += `<div class="custom-list-item"><span class="item-number">${number}.</span><div class="item-content">${mainText}${ulHtml}</div></div>`;
//           } else {
//             listHtml += `<div class="custom-list-item"><span class="item-number">${number}.</span><div class="item-content">${mainItem}</div></div>`;
//           }
          
//           listHtml += '</div>';
//           return listHtml;
//         });
//       }
      
//       // Process standalone unordered lists (not within ordered lists)
//       const unorderedListPattern = /(?:^|\n)(\s*-\s+[^\n]+)+/g;
      
//       processedText = processedText.replace(unorderedListPattern, (match) => {
//         if (match.includes('<li class="message-li">')) {
//           return match;
//         }
        
//         const items = match.split(/\n\s*-\s+/).filter(item => item.trim());
//         let ulHtml = '<ul class="message-ul">';
//         items.forEach(item => {
//           ulHtml += `<li class="message-li">${item}</li>`;
//         });
//         ulHtml += '</ul>';
//         return ulHtml;
//       });
      
//       // Process inline code (text between single backticks) - but not code blocks
//       processedText = processedText.replace(/(?<!`)`([^`\n]+)`(?!`)/g, function(match, code) {
//         code = code.trim();
//         return '<code class="code-inline">' + code + '</code>';
//       });
      
//       // Process bold text
//       processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
//       // Final cleanup: ensure single newlines between HTML blocks
//       processedText = processedText.replace(/(<\/div>)\s*\n{2,}\s*(<div)/g, '$1\n$2');
//       processedText = processedText.replace(/\n{2,}/g, '\n');
      
//       // Clean up spacing around mathematical expressions
//       processedText = processedText.replace(/\n\s*<div class="latex-display-equation">/g, '<div class="latex-display-equation">');
//       processedText = processedText.replace(/<\/div>\s*\n\s*/g, '</div>');
      
//       return processedText;
//     };

//     // Function to detect and format mathematical expressions with LaTeX
//     const processMathematicalExpressions = (text) => {
//       let processedText = text;
      
//       // Process display equations (block-level math) first
//       // Pattern for \[ ... \] or $$ ... $$
//       processedText = processedText.replace(/\\\[([\s\S]*?)\\\]/g, (match, equation) => {
//         const formattedEquation = formatMathematicalExpression(equation.trim());
//         return `<div class="latex-display-equation">${formattedEquation}</div>`;
//       });
      
//       processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
//         const formattedEquation = formatMathematicalExpression(equation.trim());
//         return `<div class="latex-display-equation">${formattedEquation}</div>`;
//       });
      
//       // Process inline equations \( ... \) or $ ... $
//       processedText = processedText.replace(/\\\((.*?)\\\)/g, (match, equation) => {
//         const formattedEquation = formatMathematicalExpression(equation.trim());
//         return `<span class="latex-inline-equation">${formattedEquation}</span>`;
//       });
      
//       processedText = processedText.replace(/\$([^$\n]+)\$/g, (match, equation) => {
//         const formattedEquation = formatMathematicalExpression(equation.trim());
//         return `<span class="latex-inline-equation">${formattedEquation}</span>`;
//       });
      
//       // Detect and format common mathematical patterns that aren't already in LaTeX
//       // Pattern for expressions like "(50 + 90) = 140"
//       processedText = processedText.replace(/\(\s*(\d+)\s*\+\s*(\d+)\s*\)\s*=\s*(\d+)/g, (match, num1, num2, result) => {
//         return `<span class="latex-inline-equation">(${num1} + ${num2}) = ${result}</span>`;
//       });
      
//       // Pattern for expressions like "148 / 2 = 70" or "148/2 = 70"
//       processedText = processedText.replace(/(\d+)\s*\/\s*(\d+)\s*=\s*(\d+)/g, (match, numerator, denominator, result) => {
//         return `<span class="latex-inline-equation"><span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span> = ${result}</span>`;
//       });
      
//       // Pattern for "70 + 30 = 100"
//       processedText = processedText.replace(/(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/g, (match, num1, num2, result) => {
//         return `<span class="latex-inline-equation">${num1} + ${num2} = ${result}</span>`;
//       });
      
//       // Pattern for "90 - 50 = 40"
//       processedText = processedText.replace(/(\d+)\s*-\s*(\d+)\s*=\s*(\d+)/g, (match, num1, num2, result) => {
//         return `<span class="latex-inline-equation">${num1} - ${num2} = ${result}</span>`;
//       });
      
//       // Pattern for multiplication "5 * 6 = 30" or "5 × 6 = 30"
//       processedText = processedText.replace(/(\d+)\s*[*×]\s*(\d+)\s*=\s*(\d+)/g, (match, num1, num2, result) => {
//         return `<span class="latex-inline-equation">${num1} × ${num2} = ${result}</span>`;
//       });
      
//       // Pattern for fractions in the format \frac{num}{den}
//       processedText = processedText.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, (match, numerator, denominator) => {
//         return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
//       });
      
//       // Pattern for standalone fractions like "140/2" (without equals)
//       processedText = processedText.replace(/(?<![=\s])(\d+)\/(\d+)(?![=\s\d])/g, (match, numerator, denominator) => {
//         return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
//       });
      
//       // Pattern for boxed final answers
//       processedText = processedText.replace(/\\boxed\{([^}]+)\}/g, (match, content) => {
//         return `<span class="boxed-result">${content}</span>`;
//       });
      
//       // Pattern for mathematical expressions in numbered steps format
//       // Like "1. Add 50 and 90: 50 + 90 = 140"
//       processedText = processedText.replace(/(\d+)\.\s*([^:]+):\s*([^\n]*(?:\d+\s*[+\-*/×÷=]\s*\d+[^\n]*))/g, (match, stepNum, description, expression) => {
//         if (mathUtils.containsMathematicalExpressions(expression)) {
//           // Convert the mathematical expression to HTML format instead of LaTeX
//           const formattedExpression = formatMathematicalExpression(expression);
//           return `${stepNum}. **${description}:**<div class="latex-display-equation">${formattedExpression}</div>`;
//         }
//         return match;
//       });
      
//       // Pattern for Final Answer sections
//       processedText = processedText.replace(/Final Answer:\s*([^\n]+)/gi, (match, answer) => {
//         if (mathUtils.containsMathematicalExpressions(answer)) {
//           const formattedAnswer = formatMathematicalExpression(answer);
//           return `**Final Answer:**<div class="latex-display-equation">${formattedAnswer}</div>`;
//         }
//         return match;
//       });
      
//       return processedText;
//     };

//     // Function to format mathematical expressions
//     const formatMathematicalExpression = (expression) => {
//       let formatted = expression;
      
//       // Replace * with × for multiplication
//       formatted = formatted.replace(/\*/g, '×');
      
//       // Replace \div with ÷ for division
//       formatted = formatted.replace(/\\div/g, '÷');
      
//       // Format fractions
//       formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, numerator, denominator) => {
//         return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
//       });
      
//       // Format simple fractions (number/number)
//       formatted = formatted.replace(/(\d+)\/(\d+)/g, (match, numerator, denominator) => {
//         return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
//       });
      
//       // Format boxed expressions
//       formatted = formatted.replace(/\\boxed\{([^}]+)\}/g, (match, content) => {
//         return `<span class="boxed-result">${content}</span>`;
//       });
      
//       // Format square roots
//       formatted = formatted.replace(/\\sqrt\{([^}]+)\}/g, (match, content) => {
//         return `<span class="sqrt">√<span class="sqrt-content">${content}</span></span>`;
//       });
      
//       // Format superscripts
//       formatted = formatted.replace(/\^(\d+)/g, (match, exponent) => {
//         return `<sup>${exponent}</sup>`;
//       });
      
//       // Format subscripts
//       formatted = formatted.replace(/_(\d+)/g, (match, subscript) => {
//         return `<sub>${subscript}</sub>`;
//       });
      
//       return formatted;
//     };

//     // Check if content has <think> tags
//     if (typeof content === 'string' && content.includes('<think>') && content.includes('</think>')) {
//       const parts = content.split(/<\/?think>/);
      
//       if (parts.length > 1) {
//         const cleanContent = parts.filter((_, index) => index % 2 === 0).join('').trim();
//         const thinkContent = parts.filter((part, index) => index % 2 === 1 && part.trim().length > 0);
        
//         return (
//           <>
//             <div className="clean-content">
//               {parseContentWithCodeBlocks(cleanContent).map((part, index) => {
//                 if (part.type === 'codeblock') {
//                   return (
//                     <div key={index} className="code-block-container">
//                       <div className="code-block-header">
//                         <span className="code-language">{part.language || 'text'}</span>
//                         <button 
//                           className="code-copy-button"
//                           onClick={() => navigator.clipboard.writeText(part.content)}
//                           title="Copy code"
//                         >
//                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                             <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
//                             <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//                           </svg>
//                         </button>
//                       </div>
//                       <CodeBlockWrapper language={part.language || 'text'} content={part.content} customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '14px', lineHeight: '1.4' }} />
//                     </div>
//                   );
//                 } else {
//                   return (
//                     <span 
//                       key={index} 
//                       dangerouslySetInnerHTML={{ __html: processFormatting(part.content) }}
//                     />
//                   );
//                 }
//               })}
//             </div>
            
//             {showThinkSections && thinkContent.length > 0 && (
//               <div className="thinking-section">
//                 <div className="thinking-header">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
//                     <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                     <path d="M12 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                     <path d="M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                   </svg>
//                   Thinking Process
//                 </div>
//                 {thinkContent.map((thought, index) => (
//                   <div key={index} className="think-content">
//                     {parseContentWithCodeBlocks(thought.trim()).map((part, partIndex) => {
//                       if (part.type === 'codeblock') {
//                         return (
//                           <div key={partIndex} className="code-block-container">
//                             <div className="code-block-header">
//                               <span className="code-language">{part.language || 'text'}</span>
//                               <button 
//                                 className="code-copy-button"
//                                 onClick={() => navigator.clipboard.writeText(part.content)}
//                                 title="Copy code"
//                               >
//                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                                   <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
//                                   <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//                                 </svg>
//                               </button>
//                             </div>
//                             <CodeBlockWrapper language={part.language || 'text'} content={part.content} customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '14px', lineHeight: '1.4' }} />
//                           </div>
//                         );
//                       } else {
//                         return (
//                           <span 
//                             key={partIndex} 
//                             dangerouslySetInnerHTML={{ __html: processFormatting(part.content) }}
//                           />
//                         );
//                       }
//                     })}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         );
//       }
//     }

//     // If no think tags, parse content for code blocks
//     return (
//       <div className="message-content-parsed">
//         {parseContentWithCodeBlocks(content).map((part, index) => {
//           if (part.type === 'codeblock') {
//             return (
//               <div key={index} className="code-block-container">
//                 <div className="code-block-header">
//                   <span className="code-language">{part.language || 'text'}</span>
//                   <button 
//                     className="code-copy-button"
//                     onClick={() => navigator.clipboard.writeText(part.content)}
//                     title="Copy code"
//                   >
//                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                       <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
//                       <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//                     </svg>
//                   </button>
//                 </div>
//                 <CodeBlockWrapper language={part.language || 'text'} content={part.content} customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '14px', lineHeight: '1.4' }} />
//               </div>
//             );
//           } else {
//             return (
//               <span 
//                 key={index} 
//                 dangerouslySetInnerHTML={{ __html: processFormatting(part.content) }}
//               />
//             );
//           }
//         })}
//       </div>
//     );
//   };

//   // If editing, show only the edit interface
//   if (isEditing && role === 'user') {
//     return (
//       <div className="message-container user">
//         <div className="edit-container">
//           <textarea 
//             value={editedContent}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyPress}
//             autoFocus
//             className="edit-textarea"
//           />
//           <div className="edit-actions">
//             <button onClick={handleCancel} className="edit-button cancel">Cancel</button>
//             <button onClick={handleSave} className="edit-button save">Send</button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // For user messages
//   if (role === 'user') {
//     return (
//       <div className="message-container user">
//         <div className="message-actions">
//           <button className="action-button" onClick={handleEdit} title="Edit message">
//             <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path fill-rule="evenodd" clip-rule="evenodd" d="M11.712 2.79a1.854 1.854 0 0 1 2.623 0l1.673 1.672a1.854 1.854 0 0 1 0 2.623l-9.714 9.714a2.91 2.91 0 0 1-2.058.853H1.945a.8.8 0 0 1-.8-.8v-2.29c0-.773.307-1.513.853-2.058l9.714-9.715zm1.492 1.13c-.1-.1-.261-.1-.361 0l-1.327 1.326 2.035 2.035 1.327-1.326c.1-.1.1-.262 0-.362L13.204 3.92zm-.783 4.491l-2.035-2.034-7.258 7.257a1.31 1.31 0 0 0-.384.927v1.492h1.492c.348 0 .681-.138.927-.384l7.258-7.258z" fill="currentColor"></path>
//               <path fill-rule="evenodd" clip-rule="evenodd" d="M17.772 17.608c.35 0 .633-.283.633-.633v-.492a.633.633 0 0 0-.633-.633H9.858L8.1 17.608h9.672z" fill="currentColor"></path>
//             </svg>
//           </button>
//           <button className="action-button" onClick={handleCopy} title="Copy message">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M3.65169 12.9243C3.68173 13.1045 3.74181 13.2748 3.80189 13.445C3.87198 13.6052 3.96211 13.7654 4.06225 13.9156C4.16238 14.0658 4.27253 14.206 4.4027 14.3362C4.52286 14.4663 4.66306 14.5765 4.81326 14.6766C4.96346 14.7768 5.11366 14.8569 5.28389 14.927C5.44411 14.9971 5.61434 15.0571 5.79459 15.0872C5.97483 15.1272 6.14506 15.1373 6.3253 15.1373V16.9196C6.30739 16.9196 6.28949 16.9195 6.27159 16.9193C5.9991 16.9158 5.72659 16.8859 5.4541 16.8295C5.16371 16.7694 4.88334 16.6893 4.61298 16.5692C4.3326 16.459 4.08226 16.3188 3.83193 16.1586C3.59161 15.9884 3.3613 15.7981 3.15102 15.5878C2.94074 15.3776 2.7605 15.1473 2.59027 14.9069C2.43006 14.6566 2.28986 14.3962 2.17972 14.1259C2.06957 13.8455 1.97944 13.5651 1.91936 13.2747C1.86929 12.9843 1.83926 12.684 1.83926 12.3936V6.26532C1.83926 5.96492 1.86929 5.67456 1.91936 5.38417C1.97944 5.09378 2.06957 4.80338 2.17972 4.53302C2.28986 4.26265 2.43006 4.0023 2.59027 3.75197C2.7605 3.50163 2.94074 3.27132 3.15102 3.06104C3.3613 2.85076 3.59161 2.67052 3.83193 2.50029C4.08226 2.33006 4.3326 2.19987 4.61298 2.07971C4.88334 1.96956 5.16371 1.87943 5.4541 1.81935C5.74449 1.75927 6.03491 1.73926 6.3253 1.73926H12.3934C12.6838 1.73926 12.9842 1.75927 13.2746 1.81935C13.555 1.87943 13.8354 1.96956 14.1158 2.07971C14.3861 2.19987 14.6465 2.33006 14.8868 2.50029C15.1371 2.67052 15.3574 2.85076 15.5677 3.06104C15.778 3.27132 15.9582 3.50163 16.1284 3.75197C16.2887 4.0023 16.4288 4.26265 16.539 4.53302C16.6592 4.80338 16.7393 5.09378 16.7994 5.38417C16.8558 5.65722 16.8858 5.93024 16.8892 6.21161C16.8894 6.22948 16.8895 6.24739 16.8895 6.26532H15.1271C15.1271 6.08508 15.1071 5.90486 15.067 5.72462C15.037 5.55439 14.9869 5.38415 14.9168 5.21392C14.8467 5.04369 14.7566 4.88347 14.6665 4.73327C14.5664 4.58307 14.4462 4.45289 14.326 4.32271C14.1959 4.19254 14.0557 4.08239 13.9055 3.98226C13.7553 3.88212 13.6051 3.79202 13.4348 3.72193C13.2746 3.65184 13.1044 3.60174 12.9242 3.5717C12.7539 3.53165 12.5737 3.51163 12.3934 3.51163H6.3253C6.14506 3.51163 5.97483 3.53165 5.79459 3.5717C5.61434 3.60174 5.44411 3.65184 5.28389 3.72193C5.11366 3.79202 4.96346 3.88212 4.81326 3.98226C4.66306 4.08239 4.52286 4.19254 4.4027 4.32271C4.27253 4.45289 4.16238 4.58307 4.06225 4.73327C3.96211 4.88347 3.87198 5.04369 3.80189 5.21392C3.74181 5.38415 3.68173 5.55439 3.65169 5.72462C3.61164 5.90486 3.60164 6.08508 3.60164 6.26532V12.3936C3.60164 12.5638 3.61164 12.744 3.65169 12.9243Z" fill="currentColor"></path>
//               <path fill-rule="evenodd" clip-rule="evenodd" d="M9.66972 21.6772C9.39936 21.567 9.13902 21.4268 8.8987 21.2566C8.64836 21.0964 8.42804 20.9061 8.21776 20.6959C8.00748 20.4856 7.81723 20.2553 7.65701 20.015C7.4968 19.7646 7.3566 19.5043 7.24646 19.2239C7.12629 18.9535 7.04621 18.6731 6.98613 18.3727C6.92605 18.0823 6.89601 17.792 6.89601 17.4915V11.3733C6.89601 11.0729 6.92605 10.7825 6.98613 10.4922C7.04621 10.1918 7.12629 9.91137 7.24646 9.64101C7.3566 9.36063 7.4968 9.10028 7.65701 8.85996C7.81723 8.60962 8.00748 8.37931 8.21776 8.16903C8.42804 7.95875 8.64836 7.76849 8.8987 7.60828C9.13902 7.43805 9.39936 7.29785 9.66972 7.1877C9.94009 7.07755 10.2205 6.98745 10.5108 6.92737C10.8012 6.86729 11.0916 6.83725 11.392 6.83725H17.4602C17.7506 6.83725 18.041 6.86729 18.3313 6.92737C18.6217 6.98745 18.9021 7.07755 19.1725 7.1877C19.4529 7.29785 19.7032 7.43805 19.9535 7.60828C20.1938 7.76849 20.4242 7.95875 20.6345 8.16903C20.8447 8.37931 21.025 8.60962 21.1952 8.85996C21.3554 9.10028 21.4956 9.36063 21.6058 9.64101C21.7159 9.91137 21.806 10.1918 21.8661 10.4922C21.9162 10.7825 21.9462 11.0729 21.9462 11.3733V17.4915C21.9462 17.6718 21.9262 17.852 21.8861 18.0323C21.846 18.2125 21.786 18.3828 21.7059 18.543C21.6257 18.7132 21.5256 18.8734 21.4054 18.9936C21.2852 19.1138 21.145 19.2039 20.9848 19.2639C20.8246 19.324 20.6444 19.3541 20.4642 19.3541C20.284 19.3541 20.1038 19.324 19.9436 19.2639C19.7834 19.2039 19.6432 19.1138 19.523 18.9936C19.4028 18.8734 19.3127 18.7132 19.2526 18.543C19.1925 18.3828 19.1624 18.2125 19.1624 18.0323C19.1624 17.852 19.1925 17.6718 19.2526 17.4915C19.3127 17.3113 19.4028 17.1511 19.523 17.0309C19.6432 16.9107 19.7834 16.8206 19.9436 16.7605C20.1038 16.7004 20.284 16.6703 20.4642 16.6703C20.6444 16.6703 20.8246 16.7004 20.9848 16.7605C21.145 16.8206 21.2852 16.9107 21.4054 17.0309C21.5256 17.1511 21.6157 17.3113 21.6758 17.4915C21.7359 17.6718 21.766 17.852 21.766 18.0323V18.0323Z" fill="currentColor"></path>
//             </svg>
//           </button>
//         </div>
        
//         <div className="message-content">
//           <div className="message-text">
//             {renderContent(content)}
//           </div>
          
//           {/* Render file attachments if present */}
//           {message.attachments && message.attachments.length > 0 && (
//             <div className="message-attachments">
//               {message.attachments.map((file, index) => (
//                 <div key={index} className="file-attachment" onClick={() => window.open(`/api/files/download/${file.fileId}`, '_blank')}>
//                   <div className="file-icon">
//                     {file.fileType === 'image' ? (
//                       <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M21.4237 7H10.5763C8.04887 7 6 8.94521 6 11.3447V20.6544C6 23.054 8.04887 24.9992 10.5763 24.9992H21.4237C23.9511 24.9992 26 23.054 26 20.6544V11.3447C26 8.94521 23.9511 7 21.4237 7Z" fill="#CDCDCD"></path>
//                         <path d="M11.3448 14.2014C12.3922 14.2014 13.2413 13.3955 13.2413 12.4015C13.2413 11.4074 12.3922 10.6016 11.3448 10.6016C10.2974 10.6016 9.44824 11.4074 9.44824 12.4015C9.44824 13.3955 10.2974 14.2014 11.3448 14.2014Z" fill="white"></path>
//                         <path d="M25.9989 15.4688L21.3278 19.2012C20.7752 19.6428 20.0993 19.9222 19.3825 20.0054C18.6656 20.0886 17.9387 19.972 17.2904 19.6699L13.5988 17.9489C13.0423 17.6896 12.4264 17.5663 11.8069 17.5902C11.1875 17.6141 10.5841 17.7845 10.0516 18.0859L6.00098 20.3788V20.6554C6.00089 21.226 6.11915 21.7909 6.34906 22.318C6.57896 22.8452 6.91598 23.3241 7.34087 23.7276C7.76576 24.131 8.27022 24.4511 8.82541 24.6694C9.38059 24.8878 9.97563 25.0002 10.5766 25.0002H21.4247C22.6381 24.9998 23.8017 24.5419 24.6595 23.7271C25.5173 22.9123 25.9991 21.8074 25.9989 20.6554V15.4688Z" fill="#7A7A7A"></path>
//                       </svg>
//                     ) : (
//                       <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M7 9C7 6.79086 8.79086 5 11 5L18.6383 5C19.1906 5 19.6383 5.44772 19.6383 6V6.92308C19.6383 9.13222 21.4292 10.9231 23.6383 10.9231H24C24.5523 10.9231 25 11.3708 25 11.9231V23C25 25.2091 23.2091 27 21 27H11C8.79086 27 7 25.2091 7 23V9Z" fill="#F8CA27"></path>
//                         <g filter="url(#filter0_d_602_422)">
//                           <path d="M19.6602 6.92458V5.84766L24.4126 10.9246H23.6602C21.451 10.9246 19.6602 9.13372 19.6602 6.92458Z" fill="#F8EDC7"></path>
//                         </g>
//                         <path d="M20.2557 12H11.7443C11.3332 12 11 12.3358 11 12.75C11 13.1642 11.3332 13.5 11.7443 13.5H20.2557C20.6668 13.5 21 13.1642 21 12.75C21 12.3358 20.6668 12 20.2557 12Z" fill="#F8EDC7"></path>
//                         <path d="M20.2557 16L11.7443 16.0017C11.3332 16.0017 11 16.3371 11 16.7509C11 17.1646 11.3332 17.5 11.7443 17.5L20.2557 17.4983C20.6668 17.4983 21 17.1629 21 16.7491C21 16.3354 20.6668 16 20.2557 16Z" fill="#F8EDC7"></path>
//                         <path d="M15.3575 20H11.6425C11.2876 20 11 20.3358 11 20.75C11 21.1642 11.2876 21.5 11.6425 21.5H15.3575C15.7124 21.5 16 21.1642 16 20.75C16 20.3358 15.7124 20 15.3575 20Z" fill="#F8EDC7"></path>
//                         <defs>
//                           <filter id="filter0_d_602_422" x="19.1602" y="5.34766" width="7.75195" height="8.07617" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
//                             <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
//                             <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
//                             <feOffset dx="1" dy="1"></feOffset>
//                             <feGaussianBlur stdDeviation="0.75"></feGaussianBlur>
//                             <feComposite in2="hardAlpha" operator="out"></feComposite>
//                             <feColorMatrix type="matrix" values="0 0 0 0 0.591623 0 0 0 0 0.452482 0 0 0 0 0.0698445 0 0 0 0.25 0"></feColorMatrix>
//                             <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_602_422"></feBlend>
//                             <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_602_422" result="shape"></feBlend>
//                           </filter>
//                         </defs>
//                       </svg>
//                     )}
//                   </div>
//                   <div className="file-info">
//                     <div className="file-name">{file.fileName}</div>
//                     <div className="file-size">{file.size}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <span className="message-time">{formattedTime}</span>
//       </div>
//     );
//   }

//   // For assistant messages
//   return (
//     <div className={`message-container assistant left-edge`}>
//       <div className="avatar-content-wrapper">
//         <div className="message-avatar">
//           <div className="avatar">
//             <img src="https://www.bizimlebasvur.com/wp-content/uploads/2023/07/Ostim-Teknik-Universitesi.webp" alt="AI Logo" style={{ width: 28, height: 28, borderRadius: '50%' }} />
//           </div>
//         </div>
        
//         <div className="message-content">
//           <div className="message-text">
//             {renderContent(getCurrentContent())}
//           </div>
          
//           {/* Horizontal container for assistant controls */}
//           <div className="assistant-controls">
//             <span className="message-time assistant-time">{formattedTime}</span>
            
//             {/* Multiple response navigation controls */}
//             {responses && responses.length > 1 && (
//               <div className="response-navigation">
//                 <button 
//                   className="nav-button nav-previous" 
//                   onClick={handlePreviousResponse}
//                   title="Previous response"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <polyline points="15,18 9,12 15,6"></polyline>
//                   </svg>
//                 </button>
//                 <span className="response-counter">
//                   {(currentResponseIndex || 0) + 1} / {responses.length}
//                 </span>
//                 <button 
//                   className="nav-button nav-next" 
//                   onClick={handleNextResponse}
//                   title="Next response"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <polyline points="9,18 15,12 9,6"></polyline>
//                   </svg>
//                 </button>
//               </div>
//             )}
            
//             <div className="message-feedback">
//               <button className="feedback-button" onClick={handleCopy} title="Copy">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
//                   <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
//                   <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//                 </svg>
//               </button>
//               <button className="feedback-button" onClick={handleRegenerate} title="Regenerate">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M23 4v6h-6" />
//                   <path d="M1 20v-6h6" />
//                   <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
//                   <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
//                 </svg>
//               </button>
//               <button 
//                 className={`feedback-button ${isLiked ? 'active' : ''}`} 
//                 onClick={handleLike} 
//                 title="Like"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
//                 </svg>
//               </button>
//               <button 
//                 className={`feedback-button ${isDisliked ? 'active' : ''}`} 
//                 onClick={handleDislike} 
//                 title="Dislike"
//                 id={`dislike-button-${id}`}
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm10-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Code block component with lazy loading
// const CodeBlockWrapper = ({ language, content, customStyle }) => {
//   return (
//     <Suspense fallback={<div className="code-loading">Loading code block...</div>}>
//       <LazyCodeBlock language={language} content={content} customStyle={customStyle} />
//     </Suspense>
//   );
// };

// export default React.memo(Message); 