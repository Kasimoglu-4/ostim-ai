package com.omer.ostim.ai.controller;

import com.omer.ostim.ai.model.ChatMessages;
import com.omer.ostim.ai.model.Chat;
import com.omer.ostim.ai.model.User;
import com.omer.ostim.ai.service.ChatMessagesService;
import com.omer.ostim.ai.service.ChatService;
import com.omer.ostim.ai.repository.UserRepository;
import com.omer.ostim.ai.util.ResponseProcessingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/message")
@RequiredArgsConstructor
public class ChatMessagesController {

    private final ChatMessagesService chatMessagesService;
    private final ChatService chatService;
    private final UserRepository userRepository;
    private final ResponseProcessingUtil responseProcessingUtil;

    @PostMapping
    public ResponseEntity<?> createMessage(@RequestBody MessageCreateRequest request, Authentication authentication) {
        if (request == null || request.getMessageContent() == null || request.getMessageContent().isEmpty()) {
            return ResponseEntity.badRequest().body("Message content is required");
        }
        
        if (request.getChatId() == null) {
            return ResponseEntity.badRequest().body("Chat ID is required");
        }
        
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if this chat belongs to the authenticated user
            Chat chat = chatService.getChatById(request.getChatId());
            if (chat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found");
            }
            
            if (!chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to add messages to this chat");
            }
            
            // Create the message object
            ChatMessages message = new ChatMessages();
            message.setMessageContent(request.getMessageContent());
            message.setChatId(request.getChatId());
            message.setMessageType(request.getMessageType());
            message.setCreatedTime(request.getCreatedTime());
            message.setUserId(user.getId());
            
            // Process the message content to remove <think> tags from bot messages
            String processedContent = responseProcessingUtil.processMessageContent(
                message.getMessageContent(), 
                message.getMessageType()
            );
            message.setMessageContent(processedContent);
            
            // Save the message with file IDs if provided
            chatMessagesService.saveMessage(message, request.getFileIds());
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create message: " + e.getMessage());
        }
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<ChatMessages>> getMessagesByChatId(@PathVariable Long chatId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if this chat belongs to the authenticated user
            Chat chat = chatService.getChatById(chatId);
            if (chat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            
            if (!chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
            
            List<ChatMessages> messages = chatMessagesService.getMessagesByChatId(chatId);
            if (messages.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(messages);
            }
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<ChatMessages> getMessageById(@PathVariable Long messageId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ChatMessages message = chatMessagesService.getMessageById(messageId);
            if (message == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            
            // Check if this message belongs to a chat owned by the authenticated user
            Chat chat = chatService.getChatById(message.getChatId());
            if (chat == null || !chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
            
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<String> deleteMessage(@PathVariable Long messageId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ChatMessages message = chatMessagesService.getMessageById(messageId);
            
            // Check if this message belongs to a chat owned by the authenticated user
            Chat chat = chatService.getChatById(message.getChatId());
            if (chat == null || !chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to delete this message");
            }
            
            chatMessagesService.deleteMessage(messageId);
            return ResponseEntity.ok("Message deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Message not found");
        }
    }

    // DTO for message creation request
    public static class MessageCreateRequest {
        private String messageContent;
        private Long chatId;
        private String messageType;
        private LocalDateTime createdTime;
        private List<Long> fileIds;

        // Getters and setters
        public String getMessageContent() {
            return messageContent;
        }

        public void setMessageContent(String messageContent) {
            this.messageContent = messageContent;
        }

        public Long getChatId() {
            return chatId;
        }

        public void setChatId(Long chatId) {
            this.chatId = chatId;
        }

        public String getMessageType() {
            return messageType;
        }

        public void setMessageType(String messageType) {
            this.messageType = messageType;
        }

        public LocalDateTime getCreatedTime() {
            return createdTime;
        }

        public void setCreatedTime(LocalDateTime createdTime) {
            this.createdTime = createdTime;
        }

        public List<Long> getFileIds() {
            return fileIds;
        }

        public void setFileIds(List<Long> fileIds) {
            this.fileIds = fileIds;
        }
    }
}
