package com.omer.ostim.ai.config;

import com.omer.ostim.ai.model.ChatServer;
import com.omer.ostim.ai.repository.ChatServerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.UUID;

@Configuration
public class OllamaConfig {
    
    private static final Logger log = LoggerFactory.getLogger(OllamaConfig.class);
    
    @Value("${spring.ai.ollama.base-url:http://localhost:11434/}")
    private String ollamaBaseUrl;
    
    @Bean
    public CommandLineRunner initializeDefaultOllamaServer(ChatServerRepository chatServerRepository) {
        return args -> {
            // Check if we already have any servers configured
            if (chatServerRepository.count() == 0) {
                log.info("No Ollama server configured. Creating default connection to: {}", ollamaBaseUrl);
                
                // Parse the URL to extract host and port
                String url = ollamaBaseUrl.replaceAll("/$", ""); // Remove trailing slash if present
                String host;
                Integer port;
                
                if (url.startsWith("http://")) {
                    host = url.substring(7).split(":")[0]; // Remove http:// and get host part
                    try {
                        port = Integer.parseInt(url.substring(url.lastIndexOf(":") + 1));
                    } catch (Exception e) {
                        // Default Ollama port if not specified
                        port = 11434;
                    }
                } else {
                    host = "localhost";
                    port = 11434;
                }
                
                // Create and save the default server
                ChatServer defaultServer = new ChatServer();
                defaultServer.setEndpointUrl(host);
                defaultServer.setEndpointPort(port);
                defaultServer.setStatus("active");
                defaultServer.setToken(UUID.randomUUID().toString());
                
                chatServerRepository.save(defaultServer);
                log.info("Default Ollama server created: {}:{} with status: {}", 
                         host, port, defaultServer.getStatus());
            } else {
                log.info("Ollama server(s) already configured. Skipping default server creation.");
            }
        };
    }
} 