package com.omer.ostim.ai.service;

import com.omer.ostim.ai.model.ChatServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaConnectionService {
    
    private static final Logger log = LoggerFactory.getLogger(OllamaConnectionService.class);
    private final RestTemplate restTemplate;
    private final ChatServerService chatServerService;
    
    // Cache for RestTemplate instances by server ID
    private final Map<Long, RestTemplate> serverConnections = new HashMap<>();
    
    public OllamaConnectionService(RestTemplate restTemplate, ChatServerService chatServerService) {
        this.restTemplate = restTemplate;
        this.chatServerService = chatServerService;
    }
    
    /**
     * Gets a connection to a specific Ollama server by ID.
     * 
     * @param serverId The ID of the server to connect to
     * @return RestTemplate configured for the specified server
     */
    public RestTemplate getServerConnection(Long serverId) {
        // Return cached connection if available
        if (serverConnections.containsKey(serverId)) {
            return serverConnections.get(serverId);
        }
        
        // Get server details
        ChatServer server = chatServerService.getChatServerById(serverId);
        
        // Generate base URL for the server
        String baseUrl = formatServerUrl(server);
        log.info("Creating connection to Ollama server: {}", baseUrl);
        
        // Create a RestTemplate with the server-specific settings
        RestTemplate serverTemplate = new RestTemplate(restTemplate.getRequestFactory());
        
        // Cache the connection
        serverConnections.put(serverId, serverTemplate);
        
        return serverTemplate;
    }
    
    /**
     * Gets a connection to the default Ollama server (first active one).
     * 
     * @return RestTemplate configured for the default server
     */
    public RestTemplate getDefaultServerConnection() {
        // Get all servers
        var servers = chatServerService.getAllChatServers();
        
        // Find the first active server
        ChatServer defaultServer = servers.stream()
            .filter(s -> "active".equals(s.getStatus()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No active Ollama server found"));
        
        return getServerConnection(defaultServer.getServerId());
    }
    
    /**
     * Creates HTTP headers for an Ollama API request, including auth token if needed.
     * 
     * @param serverId The ID of the server to create headers for
     * @return HttpHeaders configured for the server
     */
    public HttpHeaders createHeaders(Long serverId) {
        ChatServer server = chatServerService.getChatServerById(serverId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        
        // Add authentication if token is present
        if (server.getToken() != null && !server.getToken().isEmpty()) {
            headers.set("Authorization", "Bearer " + server.getToken());
        }
        
        return headers;
    }
    
    /**
     * Get the full URL for a specific API endpoint on a server.
     * 
     * @param serverId The server ID
     * @param endpoint The API endpoint (e.g., "/api/generate")
     * @return The full URL
     */
    public String getApiUrl(Long serverId, String endpoint) {
        ChatServer server = chatServerService.getChatServerById(serverId);
        return formatServerUrl(server) + endpoint;
    }
    
    /**
     * Get the full URL for a specific API endpoint on the default server.
     * 
     * @param endpoint The API endpoint (e.g., "/api/generate")
     * @return The full URL
     */
    public String getDefaultApiUrl(String endpoint) {
        var servers = chatServerService.getAllChatServers();
        
        // Find the first active server
        ChatServer defaultServer = servers.stream()
            .filter(s -> "active".equals(s.getStatus()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No active Ollama server found"));
        
        return formatServerUrl(defaultServer) + endpoint;
    }
    
    /**
     * Formats the server URL from a ChatServer object.
     */
    private String formatServerUrl(ChatServer server) {
        return "http://" + server.getEndpointUrl() + ":" + server.getEndpointPort();
    }
    
    /**
     * Checks if a server is reachable by sending a test request to the Ollama API.
     * Uses the /api/tags endpoint which lists available models.
     * 
     * @param serverId The ID of the server to test
     * @return true if the server is reachable, false otherwise
     */
    public boolean isServerReachable(Long serverId) {
        try {
            ChatServer server = chatServerService.getChatServerById(serverId);
            String url = formatServerUrl(server) + "/api/tags";
            
            log.debug("Testing connection to Ollama server at: {}", url);
            
            // Set a shorter timeout for these connection tests
            RestTemplate testTemplate = new RestTemplate();
            
            // Make the request to the Ollama API
            ResponseEntity<String> response = testTemplate.getForEntity(url, String.class);
            
            // Check if response is successful
            boolean isSuccess = response.getStatusCode().is2xxSuccessful();
            
            log.debug("Ollama server connection test result for {}: {}", url, isSuccess ? "SUCCESSFUL" : "FAILED");
            return isSuccess;
            
        } catch (ResourceAccessException e) {
            // This exception occurs when there's a connection issue
            log.debug("Connection refused to Ollama server: {}", e.getMessage());
            return false;
        } catch (RestClientException e) {
            // This covers other REST client exceptions
            log.debug("Failed to connect to Ollama server: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.warn("Unexpected error checking Ollama server: {}", e.getMessage());
            return false;
        }
    }
} 