package com.omer.ostim.ai.service;

import com.omer.ostim.ai.model.ChatServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@EnableScheduling
public class ServerMonitoringService {
    
    private static final Logger log = LoggerFactory.getLogger(ServerMonitoringService.class);
    
    private final ChatServerService chatServerService;
    private final OllamaConnectionService ollamaConnectionService;
    
    public ServerMonitoringService(ChatServerService chatServerService, OllamaConnectionService ollamaConnectionService) {
        this.chatServerService = chatServerService;
        this.ollamaConnectionService = ollamaConnectionService;
    }
    
    /**
     * Scheduled task that runs every 2 min to check the status of all Ollama servers
     * and update their status in the database.
     */
    @Scheduled(fixedRate = 120000) // 2 min to check the server status
    public void monitorServerStatus() {
        try {
            log.debug("Running scheduled server status check");
            List<ChatServer> servers = chatServerService.getAllChatServers();
            
            if (servers.isEmpty()) {
                log.debug("No servers configured for monitoring");
                return;
            }
            
            for (ChatServer server : servers) {
                boolean isReachable = ollamaConnectionService.isServerReachable(server.getServerId());
                String currentStatus = server.getStatus();
                String newStatus = isReachable ? "active" : "offline";
                
                // Only update if the status has changed
                if (!newStatus.equals(currentStatus)) {
                    log.info("Server {} status changed from {} to {}", 
                            server.getServerId(), currentStatus, newStatus);
                    
                    chatServerService.updateServerStatus(server.getServerId(), newStatus);
                }
            }
        } catch (Exception e) {
            log.error("Error in server monitoring: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Manual trigger to check all servers immediately
     */
    public void checkAllServersNow() {
        monitorServerStatus();
    }
} 