package com.omer.ostim.ai.util;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

/**
 * Utility class for processing AI responses before storing them in the database
 */
@Component
public class ResponseProcessingUtil {

    // Pattern to match <think>...</think> tags (including nested tags and multiline content)
    private static final Pattern THINK_TAG_PATTERN = Pattern.compile(
        "<think>.*?</think>", 
        Pattern.DOTALL | Pattern.CASE_INSENSITIVE
    );

    /**
     * Removes <think>...</think> tags from the response content
     * This method handles multiline content and nested tags
     * 
     * @param responseContent The original response content from the AI
     * @return The cleaned response content without <think> tags
     */
    public String removeThinkTags(String responseContent) {
        if (responseContent == null || responseContent.trim().isEmpty()) {
            return responseContent;
        }

        // Remove all <think>...</think> blocks
        String cleaned = THINK_TAG_PATTERN.matcher(responseContent).replaceAll("");
        
        // Clean up any excessive whitespace left after removing think tags
        cleaned = cleaned.replaceAll("\\n\\s*\\n\\s*\\n", "\n\n"); // Replace 3+ newlines with just 2
        cleaned = cleaned.trim(); // Remove leading/trailing whitespace
        
        return cleaned;
    }

    /**
     * Determines if a message should have think tags removed based on message type
     * 
     * @param messageType The type of message (bot, user, etc.)
     * @return true if think tags should be removed, false otherwise
     */
    public boolean shouldRemoveThinkTags(String messageType) {
        return "bot".equalsIgnoreCase(messageType) || "assistant".equalsIgnoreCase(messageType);
    }

    /**
     * Processes the message content by removing think tags if it's a bot message
     * 
     * @param messageContent The original message content
     * @param messageType The type of message
     * @return The processed message content
     */
    public String processMessageContent(String messageContent, String messageType) {
        if (shouldRemoveThinkTags(messageType)) {
            return removeThinkTags(messageContent);
        }
        return messageContent;
    }
} 