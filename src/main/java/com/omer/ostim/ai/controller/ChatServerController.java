package com.omer.ostim.ai.controller;

import com.omer.ostim.ai.model.ChatServer;
import com.omer.ostim.ai.service.ChatServerService;
import com.omer.ostim.ai.service.OllamaConnectionService;
import com.omer.ostim.ai.service.ServerMonitoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/server")
@RequiredArgsConstructor
public class ChatServerController {

    private final ChatServerService chatServerService;
    private final OllamaConnectionService ollamaConnectionService;
    private final ServerMonitoringService serverMonitoringService;

    @PostMapping
    public ResponseEntity<?> createChatServer(@Valid @RequestBody ChatServer chatServer) {
        // Generate a default token if none provided
        if (chatServer.getToken() == null) {
            chatServer.setToken(UUID.randomUUID().toString());
        }

        // Set default status if none provided
        if (chatServer.getStatus() == null) {
            chatServer.setStatus("active");
        }

        ChatServer savedServer = chatServerService.saveServer(chatServer);
        return ResponseEntity.status(201).body(savedServer);
    }

    @GetMapping
    public List<ChatServer> getAllChatServers() {
        return chatServerService.getAllChatServers();
    }

    @GetMapping("/{serverId}")
    public ResponseEntity<ChatServer> getChatServerById(@PathVariable Long serverId) {
        ChatServer chatServer = chatServerService.getChatServerById(serverId);
        return ResponseEntity.ok(chatServer);
    }

    @DeleteMapping("/{serverId}")
    public ResponseEntity<Void> deleteChatServer(@PathVariable Long serverId) {
        chatServerService.deleteChatServer(serverId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{serverId}/status")
    public ResponseEntity<Void> updateChatServerStatus(@PathVariable Long serverId, @RequestBody String status) {
        String cleanStatus = status.replaceAll("[\\{\\}\\r\\n\\s\"']", "");
        chatServerService.updateServerStatus(serverId, cleanStatus);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{serverId}/token")
    public ResponseEntity<?> updateServerToken(@PathVariable Long serverId, @RequestBody(required = false) String token) {
        String newToken = token != null ? token.replaceAll("[\\{\\}\\r\\n\\s\"']", "") : UUID.randomUUID().toString();
        chatServerService.updateServerToken(serverId, newToken);
        return ResponseEntity.ok().body(new TokenResponse(newToken));
    }

    @PostMapping("/{serverId}/token/regenerate")
    public ResponseEntity<?> regenerateToken(@PathVariable Long serverId) {
        String newToken = UUID.randomUUID().toString();
        chatServerService.updateServerToken(serverId, newToken);
        return ResponseEntity.ok().body(new TokenResponse(newToken));
    }
    
    @GetMapping("/{serverId}/status/check")
    public ResponseEntity<?> checkServerStatus(@PathVariable Long serverId) {
        try {
            boolean isReachable = ollamaConnectionService.isServerReachable(serverId);
            Map<String, Object> response = new HashMap<>();
            response.put("serverId", serverId);
            response.put("reachable", isReachable);
            response.put("status", isReachable ? "online" : "offline");
            
            if (isReachable) {
                // If server is reachable, update its status to active
                chatServerService.updateServerStatus(serverId, "active");
            } else {
                // If server is not reachable, update its status to offline
                chatServerService.updateServerStatus(serverId, "offline");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "serverId", serverId,
                    "reachable", false,
                    "status", "error",
                    "error", e.getMessage()
                ));
        }
    }
    
    @GetMapping("/default/status/check")
    public ResponseEntity<?> checkDefaultServerStatus() {
        try {
            // Get all servers
            var servers = chatServerService.getAllChatServers();
            
            // Find the first active server
            ChatServer defaultServer = servers.stream()
                .filter(s -> "active".equals(s.getStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active Ollama server found"));
            
            // Check if it's reachable
            return checkServerStatus(defaultServer.getServerId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "reachable", false,
                    "status", "error",
                    "error", e.getMessage()
                ));
        }
    }
    
    @PostMapping("/status/check-all")
    public ResponseEntity<?> checkAllServersNow() {
        try {
            // Trigger an immediate status check of all servers
            serverMonitoringService.checkAllServersNow();
            
            // Get all servers with updated status
            List<ChatServer> servers = chatServerService.getAllChatServers();
            
            // Build response with summary of all servers
            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", System.currentTimeMillis());
            response.put("serverCount", servers.size());
            
            Map<String, Integer> statusSummary = new HashMap<>();
            statusSummary.put("active", 0);
            statusSummary.put("offline", 0);
            
            // Count servers by status
            for (ChatServer server : servers) {
                String status = server.getStatus();
                statusSummary.put(status, statusSummary.getOrDefault(status, 0) + 1);
            }
            
            response.put("statusSummary", statusSummary);
            response.put("message", "Status check completed for all servers");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", "error",
                    "error", e.getMessage()
                ));
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

    private static class TokenResponse {
        private final String token;

        public TokenResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
        }
    }
}
