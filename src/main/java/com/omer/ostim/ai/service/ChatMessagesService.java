package com.omer.ostim.ai.service;

import com.omer.ostim.ai.model.ChatMessages;
import com.omer.ostim.ai.exception.MessageNotFoundException;
import com.omer.ostim.ai.repository.ChatMessagesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatMessagesService {

    private final ChatMessagesRepository messagesRepository;
    private final ChatFileService chatFileService;

    public ChatMessagesService(ChatMessagesRepository messagesRepository, ChatFileService chatFileService) {
        this.messagesRepository = messagesRepository;
        this.chatFileService = chatFileService;
    }

    @Transactional
    public void saveMessage(ChatMessages message) {
        saveMessage(message, null);
    }

    @Transactional
    public void saveMessage(ChatMessages message, List<Long> fileIds) {
        // Set default values for required fields if not provided
        
        // Ensure message content is not null
        if (message.getMessageContent() == null || message.getMessageContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
        
        // Set default message type if not provided
        if (message.getMessageType() == null) {
            message.setMessageType("user");
        }
        
        // Set default user ID if not provided
        if (message.getUserId() == null) {
            message.setUserId(1L); // Default user ID
        }
        
        // Check that chatId is set
        if (message.getChatId() == null) {
            throw new IllegalArgumentException("Chat ID cannot be null");
        }
        
        // Save the message to get the generated messageId
        ChatMessages savedMessage = messagesRepository.save(message);
        
        // Link specific files if provided
        if (fileIds != null && !fileIds.isEmpty() && savedMessage.getMessageId() != null) {
            for (Long fileId : fileIds) {
                try {
                    chatFileService.updateFileMessageId(fileId, savedMessage.getMessageId());
                } catch (Exception e) {
                    System.err.println("Error linking file " + fileId + " to message " + savedMessage.getMessageId() + ": " + e.getMessage());
                    // Don't fail the message save if file linking fails
                }
            }
        } else if (savedMessage.getMessageId() != null && savedMessage.getChatId() != null) {
            // Fallback: Update any files that were uploaded for this chat but don't have a messageId yet
            // This links recently uploaded files to this message (for backward compatibility)
            try {
                chatFileService.updateFilesMessageIdByChatId(savedMessage.getChatId(), savedMessage.getMessageId());
            } catch (Exception e) {
                System.err.println("Error linking files to message " + savedMessage.getMessageId() + ": " + e.getMessage());
                // Don't fail the message save if file linking fails
            }
        }
    }

    public List<ChatMessages> getMessagesByChatId(Long chatId) {
        return messagesRepository.findByChatId(chatId);
    }

    public ChatMessages getMessageById(Long messageId) {
        Optional<ChatMessages> message = messagesRepository.findById(messageId);
        return message.orElseThrow(() -> new MessageNotFoundException("Message with ID " + messageId + " not found"));
    }

    @Transactional
    public void deleteMessage(Long messageId) {
        if (!messagesRepository.existsById(messageId)) {
            throw new MessageNotFoundException("Message with ID " + messageId + " not found");
        }
        messagesRepository.deleteById(messageId);
    }

    // Add method to check if a message exists
    public boolean messageExists(Long messageId) {
        return messagesRepository.existsById(messageId);
    }

    // Add method to find a message by both chat ID and message ID
    public Optional<ChatMessages> findByChatIdAndMessageId(Long chatId, Long messageId) {
        return messagesRepository.findByChatIdAndMessageId(chatId, messageId);
    }
}
