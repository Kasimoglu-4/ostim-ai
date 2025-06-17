package com.omer.ostim.ai.service;

import com.omer.ostim.ai.model.Chat;
import com.omer.ostim.ai.repository.ChatRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omer.ostim.ai.dto.OllamaRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final RestTemplate restTemplate;
    private final ChatRepository chatRepository;
    private final ObjectMapper objectMapper;
    private final OllamaService ollamaService;
    private final OllamaConnectionService ollamaConnectionService;

    @Value("${spring.ai.ollama.base-url}")
    private String baseUrl;

    @Autowired
    public ChatService(
        RestTemplate restTemplate, 
        ChatRepository chatRepository, 
        OllamaService ollamaService,
        OllamaConnectionService ollamaConnectionService
    ) {
        this.restTemplate = restTemplate;
        this.chatRepository = chatRepository;
        this.objectMapper = new ObjectMapper();
        this.ollamaService = ollamaService;
        this.ollamaConnectionService = ollamaConnectionService;
    }

    /**
     * Saves a new chat or updates an existing one.
     * Sets default values for null fields.
     * 
     * @param chat the chat to save
     * @return the saved chat
     * @throws IllegalArgumentException if title or user ID is invalid
     */
    public Chat saveChat(Chat chat) {
        // Set default values for fields if they are null
        if (chat.getStatus() == null) {
            chat.setStatus("active");
        }
        if (chat.getLmmType() == null) {
            chat.setLmmType("deepseek-coder");
        }
        if (chat.getShareToken() == null || "default-token".equals(chat.getShareToken())) {
            chat.setShareToken(generateUniqueShareToken());
        }
        
        // Validate that the title is not empty
        if (chat.getTitle() == null || chat.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Chat title cannot be empty");
        }
        
        // Validate that the user ID is set
        if (chat.getUserId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        return chatRepository.save(chat);
    }

    /**
     * Generates a unique share token for chat sharing.
     * 
     * @return a unique share token string
     */
    private String generateUniqueShareToken() {
        return "sh_" + UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * Finds a chat by its share token.
     * 
     * @param shareToken the share token to search for
     * @return the chat if found, null otherwise
     */
    public Chat getChatByShareToken(String shareToken) {
        Optional<Chat> chat = chatRepository.findByShareToken(shareToken);
        return chat.orElse(null);
    }

    /**
     * Updates all chats with "default-token" to have unique share tokens.
     * This is useful for migrating existing data.
     * 
     * @return the number of chats updated
     */
    public int updateAllDefaultTokens() {
        List<Chat> allChats = chatRepository.findAll();
        int updatedCount = 0;
        
        for (Chat chat : allChats) {
            if ("default-token".equals(chat.getShareToken())) {
                chat.setShareToken(generateUniqueShareToken());
                chatRepository.save(chat);
                updatedCount++;
            }
        }
        
        log.info("Updated {} chats with unique share tokens", updatedCount);
        return updatedCount;
    }

    /**
     * Retrieves all chats from the repository.
     * 
     * @return a list of all chats
     */
    public List<Chat> getAllChats() {
        return chatRepository.findAll();
    }

    /**
     * Retrieves chats by user ID.
     * 
     * @param userId the ID of the user whose chats to retrieve
     * @return a list of chats belonging to the specified user
     */
    public List<Chat> getChatsByUserId(Long userId) {
        return chatRepository.findByUserId(userId);
    }

    /**
     * Retrieves a chat by its ID.
     * 
     * @param chatId the ID of the chat to retrieve
     * @return the chat object, or null if not found
     */
    public Chat getChatById(Long chatId) {
        Optional<Chat> chat = chatRepository.findById(chatId);
        return chat.orElse(null);
    }

    /**
     * Deletes a chat by its ID.
     * 
     * @param chatId the ID of the chat to delete
     */
    public void deleteChat(Long chatId) {
        chatRepository.deleteById(chatId);
    }

    /**
     * Deletes all chats from the repository.
     */
    public void deleteAllChats() {
        chatRepository.deleteAll();
    }

    /**
     * Deletes all chats for a specific user.
     * 
     * @param userId the ID of the user whose chats to delete
     */
    public void deleteAllChatsByUserId(Long userId) {
        List<Chat> userChats = getChatsByUserId(userId);
        chatRepository.deleteAll(userChats);
    }

    /**
     * Retrieves the most recent chat.
     * 
     * @return the last saved chat, or null if no chats exist
     */
    public Chat getLastChat() {
        return chatRepository.findTopByOrderByChatIdDesc().orElse(null);
    }

    /**
     * Generates a response using the Ollama API, cached for efficiency.
     * Now uses the default connection from OllamaConnectionService.
     * 
     * @param prompt the input prompt for the Ollama API
     * @return the generated response
     */
    @Cacheable(value = "responses", key = "#prompt")
    public String generateResponse(String prompt) {
        try {
            // Get API endpoint for default server
            String url = ollamaConnectionService.getDefaultApiUrl("/api/generate");
            
            // Get a RestTemplate configured for the default server
            RestTemplate serverTemplate = ollamaConnectionService.getDefaultServerConnection();
            
            // Create OllamaRequest object for the API
            OllamaRequest request = new OllamaRequest();
            request.setModel("deepseek-coder");
            request.setPrompt(prompt);
            request.setStream(false);

            // Get headers for default server
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<OllamaRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = serverTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("response").asText();
            }

            return "No response generated";
        } catch (Exception e) {
            log.error("Error calling Ollama API", e);
            throw new RuntimeException("Error generating response: " + e.getMessage());
        }
    }

    /**
     * Example method for interacting with OllamaService for more complex logic
     */
    public String generateAdvancedResponse(String prompt) {
        return ollamaService.generateResponse(prompt); // Delegating to OllamaService
    }

    /**
     * Generates a response using the specified model.
     * Now uses OllamaConnectionService for server connections.
     * 
     * @param prompt the input prompt
     * @param model the model to use for generating the response
     * @return the generated response
     */
    public String generateResponse(String prompt, String model) {
        try {
            // Get API endpoint for default server
            String url = ollamaConnectionService.getDefaultApiUrl("/api/generate");
            
            // Get a RestTemplate configured for the default server
            RestTemplate serverTemplate = ollamaConnectionService.getDefaultServerConnection();

            // Create headers and request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            OllamaRequest request = new OllamaRequest();
            request.setModel(model != null ? model : "deepseek-r1:1.5b");
            request.setPrompt(prompt);
            request.setStream(false);

            HttpEntity<OllamaRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = serverTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("response").asText();
            }

            return "No response generated";
        } catch (Exception e) {
            log.error("Error calling Ollama API", e);
            throw new RuntimeException("Error generating response: " + e.getMessage());
        }
    }

    /**
     * Generates a response using the specified model with a file attachment.
     * 
     * @param prompt the input prompt
     * @param model the model to use for generating the response
     * @param fileAttachment the file attachment information
     * @return the generated response
     */
    public String generateResponseWithFile(String prompt, String model, Object fileAttachment) {
        try {
            String url = baseUrl + "/api/generate";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Enhance the prompt with file information
            String enhancedPrompt = createPromptWithFileInfo(prompt, fileAttachment);
            
            OllamaRequest request = new OllamaRequest();
            request.setModel(model != null ? model : "deepseek-r1:1.5b");
            request.setPrompt(enhancedPrompt);
            request.setStream(false);

            HttpEntity<OllamaRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("response").asText();
            }

            return "No response generated";
        } catch (Exception e) {
            log.error("Error calling Ollama API with file attachment", e);
            throw new RuntimeException("Error generating response with file: " + e.getMessage());
        }
    }
    
    /**
     * Creates an enhanced prompt that includes file information.
     * 
     * @param originalPrompt the original user prompt
     * @param fileAttachment the file attachment information
     * @return the enhanced prompt
     */
    private String createPromptWithFileInfo(String originalPrompt, Object fileAttachment) {
        StringBuilder enhancedPrompt = new StringBuilder();
        
        // Extract file information using reflection or direct casting
        try {
            // Log the fileAttachment object for debugging
            log.info("File attachment object: {}", fileAttachment);
            
            // Add file information to the prompt
            enhancedPrompt.append("The user has uploaded a file with the following information:\n");
            enhancedPrompt.append("- Filename: ").append(getPropertyValue(fileAttachment, "fileName")).append("\n");
            enhancedPrompt.append("- File type: ").append(getPropertyValue(fileAttachment, "contentType")).append("\n");
            enhancedPrompt.append("- File size: ").append(getPropertyValue(fileAttachment, "fileSize")).append(" bytes\n\n");
            enhancedPrompt.append("The user's prompt is: ").append(originalPrompt);
            
            return enhancedPrompt.toString();
        } catch (Exception e) {
            log.warn("Error creating enhanced prompt with file info: {}", e.getMessage(), e);
            // If there's any issue, just return the original prompt
            return originalPrompt;
        }
    }
    
    /**
     * Helper method to get property value from an object using reflection.
     * 
     * @param obj the object
     * @param propertyName the property name
     * @return the property value as a string
     */
    private String getPropertyValue(Object obj, String propertyName) {
        try {
            // For a Map
            if (obj instanceof java.util.Map) {
                return String.valueOf(((java.util.Map<?, ?>) obj).get(propertyName));
            }
            
            // For JavaBean-style objects
            String getterName = "get" + propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1);
            java.lang.reflect.Method method = obj.getClass().getMethod(getterName);
            Object value = method.invoke(obj);
            return value != null ? value.toString() : "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }

    /**
     * Generates a response using a specific server.
     * 
     * @param prompt the input prompt
     * @param model the model to use
     * @param serverId the ID of the server to use
     * @return the generated response
     */
    public String generateResponseUsingServer(String prompt, String model, Long serverId) {
        try {
            // Get API endpoint for the specified server
            String url = ollamaConnectionService.getApiUrl(serverId, "/api/generate");
            
            // Get a RestTemplate configured for the server
            RestTemplate serverTemplate = ollamaConnectionService.getServerConnection(serverId);

            // Create headers for this server
            HttpHeaders headers = ollamaConnectionService.createHeaders(serverId);

            OllamaRequest request = new OllamaRequest();
            request.setModel(model != null ? model : "deepseek-r1:1.5b");
            request.setPrompt(prompt);
            request.setStream(false);

            HttpEntity<OllamaRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = serverTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("response").asText();
            }

            return "No response generated";
        } catch (Exception e) {
            log.error("Error calling Ollama API on server {}: {}", serverId, e.getMessage());
            throw new RuntimeException("Error generating response: " + e.getMessage());
        }
    }
}
