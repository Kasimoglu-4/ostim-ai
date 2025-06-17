package com.omer.ostim.ai.controller;

import com.omer.ostim.ai.model.ChatVote;
import com.omer.ostim.ai.model.Chat;
import com.omer.ostim.ai.model.User;
import com.omer.ostim.ai.model.ChatMessages;
import com.omer.ostim.ai.service.ChatVoteService;
import com.omer.ostim.ai.service.ChatService;
import com.omer.ostim.ai.service.ChatMessagesService;
import com.omer.ostim.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vote")
@RequiredArgsConstructor
public class ChatVoteController {

    private final ChatVoteService chatVoteService;
    private final ChatService chatService;
    private final ChatMessagesService chatMessagesService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ChatVote> createVote(@RequestBody ChatVote chatVote, Authentication authentication) {
        // Log input data
        System.out.println("Received vote submission: chatId=" + chatVote.getChatId() + ", messageId=" + chatVote.getMessageId() + ", voteInt=" + chatVote.getVoteInt());
        
        // Validate required fields
        if (chatVote.getChatId() == null) {
            System.out.println("Validation failed: chatId is null");
            return ResponseEntity.badRequest().body(null);
        }
        
        // Add validation for messageId
        if (chatVote.getMessageId() == null) {
            System.out.println("Validation failed: messageId is null");
            return ResponseEntity.badRequest().body(null);
        }

        try {
            // Get authenticated user
            String username = authentication.getName();
            System.out.println("User: " + username);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if this chat belongs to the authenticated user
            try {
                Chat chat = chatService.getChatById(chatVote.getChatId());
                if (chat == null) {
                    System.out.println("Chat not found with ID: " + chatVote.getChatId());
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
                }
                
                if (!chat.getUserId().equals(user.getId())) {
                    System.out.println("Access denied: Chat " + chatVote.getChatId() + " does not belong to user " + user.getId());
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
                }
            } catch (Exception e) {
                System.err.println("Error validating chat: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
            }
            
            // Check if the messageId exists
            try {
                // First check if message exists at all
                boolean messageExists = chatMessagesService.messageExists(chatVote.getMessageId());
                
                if (messageExists) {
                    System.out.println("Found message with ID: " + chatVote.getMessageId());
                } else {
                    System.out.println("Message with ID " + chatVote.getMessageId() + " not found in database");
                    
                    // Try to find the message in the specific chat
                    Optional<ChatMessages> chatMessage = chatMessagesService.findByChatIdAndMessageId(
                        chatVote.getChatId(), chatVote.getMessageId());
                    
                    if (chatMessage.isPresent()) {
                        System.out.println("Found message with ID " + chatVote.getMessageId() + " in chat " + chatVote.getChatId());
                    } else {
                        // Get all messages for the chat to log them
                        List<ChatMessages> messagesForChat = chatMessagesService.getMessagesByChatId(chatVote.getChatId());
                        System.out.println("Found " + messagesForChat.size() + " messages for chat " + chatVote.getChatId());
                        
                        if (!messagesForChat.isEmpty()) {
                            System.out.println("Available message IDs: " + 
                                messagesForChat.stream()
                                    .map(msg -> msg.getMessageId().toString())
                                    .collect(java.util.stream.Collectors.joining(", ")));
                        }
                        
                        System.out.println("No message with ID " + chatVote.getMessageId() + " found for this chat");
                        
                        // Try to auto-correct the message ID to the last message if possible
                        if (!messagesForChat.isEmpty()) {
                            ChatMessages lastMessage = messagesForChat.get(messagesForChat.size() - 1);
                            if (lastMessage.getMessageType().equalsIgnoreCase("bot")) {
                                System.out.println("Auto-correcting to last bot message ID: " + lastMessage.getMessageId());
                                chatVote.setMessageId(lastMessage.getMessageId());
                            } else {
                                // Find the last bot message if possible
                                Optional<ChatMessages> lastBotMessage = messagesForChat.stream()
                                    .filter(msg -> msg.getMessageType().equalsIgnoreCase("bot"))
                                    .reduce((first, second) -> second);
                                
                                if (lastBotMessage.isPresent()) {
                                    System.out.println("Auto-correcting to last bot message ID: " + lastBotMessage.get().getMessageId());
                                    chatVote.setMessageId(lastBotMessage.get().getMessageId());
                                } else {
                                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(null);
                                }
                            }
                        } else {
                            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(null);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error validating message ID: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
            }

            // Ensure createdTime is set
            if (chatVote.getCreatedTime() == null) {
                chatVote.setCreatedTime(LocalDateTime.now());
            }

            chatVoteService.saveVote(chatVote);
            System.out.println("Vote successfully created with ID: " + chatVote.getVoteId());
            return ResponseEntity.status(HttpStatus.CREATED).body(chatVote);
        } catch (Exception e) {
            // Log the specific error for debugging
            System.err.println("Error creating vote: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<ChatVote>> getAllVotesForChat(@PathVariable Long chatId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if this chat belongs to the authenticated user
            Chat chat = chatService.getChatById(chatId);
            if (chat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            if (!chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            List<ChatVote> votes = chatVoteService.getVotesByChatId(chatId);
            if (votes.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(votes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{voteId}")
    public ResponseEntity<ChatVote> getVoteById(@PathVariable Long voteId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ChatVote vote = chatVoteService.getVoteById(voteId);
            
            // Check if this vote belongs to a chat owned by the authenticated user
            Chat chat = chatService.getChatById(vote.getChatId());
            if (chat == null || !chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(vote);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{voteId}")
    public ResponseEntity<Void> deleteVote(@PathVariable Long voteId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ChatVote vote = chatVoteService.getVoteById(voteId);
            
            // Check if this vote belongs to a chat owned by the authenticated user
            Chat chat = chatService.getChatById(vote.getChatId());
            if (chat == null || !chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            chatVoteService.deleteVote(voteId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
