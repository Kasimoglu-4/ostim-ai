package com.omer.ostim.ai.controller;

import com.omer.ostim.ai.model.Chat;
import com.omer.ostim.ai.model.ChatMessages;
import com.omer.ostim.ai.service.ChatService;
import com.omer.ostim.ai.service.ChatMessagesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class ShareController {

    private final ChatService chatService;
    private final ChatMessagesService chatMessagesService;

    /**
     * Get shared chat by share token - PUBLIC endpoint (no authentication required)
     */
    @GetMapping("/{shareToken}")
    public ResponseEntity<?> getSharedChat(@PathVariable String shareToken) {
        try {
            Chat chat = chatService.getChatByShareToken(shareToken);
            
            if (chat == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Get messages for this chat using the correct field name
            List<ChatMessages> messages = chatMessagesService.getMessagesByChatId(chat.getChatId());
            
            // Create response with chat details and messages
            Map<String, Object> response = new HashMap<>();
            response.put("chat", createPublicChatView(chat));
            response.put("messages", messages);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to retrieve shared chat: " + e.getMessage()));
        }
    }

    /**
     * Generate share URL for a chat (authenticated endpoint)
     */
    @PostMapping("/generate/{chatId}")
    public ResponseEntity<?> generateShareUrl(@PathVariable Long chatId) {
        try {
            Chat chat = chatService.getChatById(chatId);
            
            if (chat == null) {
                return ResponseEntity.status(404)
                    .body(Map.of("error", "Chat not found"));
            }
            
            // Generate new share token if needed
            if (chat.getShareToken() == null || chat.getShareToken().equals("default-token")) {
                chat.setShareToken(null); // This will trigger new token generation
                chat = chatService.saveChat(chat);
            }
            
            String shareUrl = generateShareUrl(chat.getShareToken());
            
            Map<String, Object> response = new HashMap<>();
            response.put("shareToken", chat.getShareToken());
            response.put("shareUrl", shareUrl);
            response.put("chatTitle", chat.getTitle());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to generate share URL: " + e.getMessage()));
        }
    }

    /**
     * Disable sharing for a chat (remove share token)
     */
    @DeleteMapping("/disable/{chatId}")
    public ResponseEntity<?> disableSharing(@PathVariable Long chatId) {
        try {
            Chat chat = chatService.getChatById(chatId);
            
            if (chat == null) {
                return ResponseEntity.status(404)
                    .body(Map.of("error", "Chat not found"));
            }
            
            // Generate a new token to invalidate old share URLs
            chat.setShareToken(null); // This will trigger new token generation
            chatService.saveChat(chat);
            
            return ResponseEntity.ok(Map.of("message", "Sharing disabled successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to disable sharing: " + e.getMessage()));
        }
    }

    /**
     * Create a public view of the chat (without sensitive information)
     */
    private Map<String, Object> createPublicChatView(Chat chat) {
        Map<String, Object> publicChat = new HashMap<>();
        publicChat.put("title", chat.getTitle());
        publicChat.put("createdTime", chat.getCreatedTime());
        publicChat.put("lmmType", chat.getLmmType());
        // Note: We deliberately exclude userId and other sensitive info
        return publicChat;
    }

    /**
     * Generate the full share URL
     */
    private String generateShareUrl(String shareToken) {
        // You can configure this base URL via application properties
        String baseUrl = "http://localhost:3000"; // Frontend URL
        return baseUrl + "/share/" + shareToken;
    }
} 