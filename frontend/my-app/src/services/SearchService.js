import { getAllChats, getMessagesForChat } from './api';

/**
 * SearchService - Handles search operations through database
 */
class SearchService {
  // Cache for conversations to avoid repeated API calls
  static conversationCache = new Map();
  static cacheExpiry = 5 * 60 * 1000; // 5 minutes
  static lastCacheUpdate = 0;

  /**
   * Get conversations from cache or fetch from database
   * @returns {Promise<Array>} Array of conversations with messages
   */
  static async getCachedConversations() {
    const now = Date.now();
    
    // Check if cache is still valid
    if (this.conversationCache.size > 0 && (now - this.lastCacheUpdate) < this.cacheExpiry) {
      console.log('Using cached conversations for search');
      return Array.from(this.conversationCache.values());
    }

    console.log('Fetching fresh conversations from database...');
    
    try {
      // Get all conversations from database
      const chatsResponse = await getAllChats();
      const chats = chatsResponse.data || [];
      
      if (chats.length === 0) {
        console.log('No chats found in database');
        return [];
      }

      // Clear old cache
      this.conversationCache.clear();
      
      // Load messages for each conversation and cache
      const conversationsWithMessages = [];
      
      for (const chat of chats) {
        try {
          const messagesResponse = await getMessagesForChat(chat.chatId);
          const messages = messagesResponse.data || [];
          
          const conversationData = {
            ...chat,
            messages: messages.map(msg => ({
              ...msg,
              role: msg.messageType === 'bot' ? 'assistant' : 'user'
            }))
          };
          
          // Cache the conversation
          this.conversationCache.set(chat.chatId.toString(), conversationData);
          conversationsWithMessages.push(conversationData);
          
        } catch (messageError) {
          console.warn(`Failed to load messages for chat ${chat.chatId}:`, messageError);
          // Still cache the conversation without messages
          const conversationData = { ...chat, messages: [] };
          this.conversationCache.set(chat.chatId.toString(), conversationData);
          conversationsWithMessages.push(conversationData);
        }
      }

      this.lastCacheUpdate = now;
      console.log(`Cached ${conversationsWithMessages.length} conversations`);
      return conversationsWithMessages;
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Clear the conversation cache
   */
  static clearCache() {
    this.conversationCache.clear();
    this.lastCacheUpdate = 0;
    console.log('Conversation cache cleared');
  }

  /**
   * Search through all conversations and messages in the database
   * @param {string} query - The search query
   * @param {string} currentConversationId - ID of current conversation to exclude
   * @returns {Promise} Search results with conversation and message data
   */
  static async searchConversations(query, currentConversationId = null) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      console.log('Searching database conversations for:', query);
      
      // Get conversations (cached or fresh)
      const conversations = await this.getCachedConversations();
      
      if (conversations.length === 0) {
        return [];
      }

      const queryLower = query.toLowerCase().trim();
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 1);
      
      if (queryWords.length === 0) return [];

      const searchResults = [];

      // Process each conversation
      conversations.forEach(conversation => {
        const conversationId = conversation.chatId.toString();
        
        // Skip current conversation
        if (conversationId === currentConversationId) return;

        // Process each message in the conversation
        conversation.messages.forEach((message, messageIndex) => {
          if (!message || !message.messageContent) return;

          const content = message.messageContent.toLowerCase();
          const title = (conversation.title || '').toLowerCase();
          
          let score = 0;
          let matchType = 'content';
          
          // Exact phrase match (highest score)
          if (content.includes(queryLower)) {
            score += 100;
            matchType = 'exact';
          }
          
          // Title match (high score)
          if (title.includes(queryLower)) {
            score += 80;
            matchType = 'title';
          }
          
          // Word-based semantic matching
          queryWords.forEach(word => {
            if (word.length < 2) return;
            
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            try {
              const wordMatches = (content.match(new RegExp(escapedWord, 'g')) || []).length;
              score += wordMatches * 8;
              
              if (content.match(new RegExp(`\\b${escapedWord}`, 'g'))) {
                score += 5;
              }
              
              if (title.includes(word)) {
                score += 15;
              }
            } catch (e) {
              console.warn('Regex error for word:', word, e);
            }
          });

          // Generate snippet
          const snippet = this.extractRelevantSnippet(message.messageContent, queryWords, 150);
          
          if (score > 3) {
            searchResults.push({
              conversationId: conversationId,
              conversationTitle: conversation.title || 'Untitled Conversation',
              messageIndex,
              message: {
                id: message.messageId.toString(),
                content: message.messageContent,
                role: message.role,
                timestamp: new Date(message.createdTime),
                snippet
              },
              score,
              matchType,
              timestamp: new Date(conversation.createdTime)
            });
          }
        });
      });

      // Sort by relevance and match type
      const sortedResults = searchResults.sort((a, b) => {
        const typeOrder = { exact: 3, title: 2, content: 1 };
        const typeA = typeOrder[a.matchType] || 0;
        const typeB = typeOrder[b.matchType] || 0;
        
        if (typeA !== typeB) {
          return typeB - typeA;
        }
        
        return b.score - a.score;
      }).slice(0, 12);

      console.log(`Search completed: ${sortedResults.length} results found`);
      return sortedResults;

    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  /**
   * Extract relevant snippet around search terms
   * @param {string} content - The message content
   * @param {Array} queryWords - Array of search words
   * @param {number} maxLength - Maximum snippet length
   * @returns {string} HTML snippet with highlighted terms
   */
  static extractRelevantSnippet(content, queryWords, maxLength) {
    if (!content || !queryWords || queryWords.length === 0) return '';
    
    // Remove think tags and other markdown for cleaner snippets
    let cleanContent = content
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/```[\s\S]*?```/g, '[code block]')
      .replace(/#{1,6}\s+/g, '')  // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1')  // Remove italic formatting
      .replace(/\n{2,}/g, ' ')  // Replace multiple newlines with space
      .trim();
    
    if (!cleanContent) return '';
    
    // Find the best position to start the snippet
    let bestIndex = -1;
    let bestScore = 0;
    
    queryWords.forEach(word => {
      if (word.length < 2) return;
      
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        const regex = new RegExp(`\\b${escapedWord}`, 'gi');
        let match;
        while ((match = regex.exec(cleanContent)) !== null) {
          const index = match.index;
          let score = 1;
          
          // Prefer matches that are not at the very beginning
          if (index > 0 && index < cleanContent.length * 0.8) {
            score += 2;
          }
          
          // Prefer matches near sentence boundaries
          const beforeChar = index > 0 ? cleanContent[index - 1] : '';
          if (beforeChar === '.' || beforeChar === '!' || beforeChar === '?' || beforeChar === '\n') {
            score += 3;
          }
          
          if (score > bestScore || bestIndex === -1) {
            bestScore = score;
            bestIndex = index;
          }
        }
      } catch (e) {
        console.warn('Regex error in snippet extraction:', e);
      }
    });
    
    let snippet;
    if (bestIndex === -1) {
      // No matches found, return beginning of content
      snippet = cleanContent.substring(0, maxLength);
    } else {
      // Extract snippet around the best match
      const start = Math.max(0, bestIndex - 50);
      const end = Math.min(cleanContent.length, start + maxLength);
      snippet = cleanContent.substring(start, end);
      
      // Add ellipsis if truncated
      if (start > 0) snippet = '...' + snippet;
      if (end < cleanContent.length) snippet = snippet + '...';
    }
    
    // Highlight search terms in the snippet
    queryWords.forEach(word => {
      if (word.length < 2) return;
      
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        const regex = new RegExp(`\\b(${escapedWord})`, 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');
      } catch (e) {
        console.warn('Regex error in snippet highlighting:', e);
      }
    });
    
    return snippet;
  }
}

export default SearchService; 