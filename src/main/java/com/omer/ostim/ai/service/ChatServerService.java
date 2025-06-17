package com.omer.ostim.ai.service;

import com.omer.ostim.ai.model.ChatServer;
import com.omer.ostim.ai.repository.ChatServerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatServerService {

    private final ChatServerRepository chatServerRepository;

    public ChatServerService(ChatServerRepository chatServerRepository) {
        this.chatServerRepository = chatServerRepository;
    }

    public List<ChatServer> getAllChatServers() {
        return chatServerRepository.findAll();
    }

    public ChatServer getChatServerById(Long serverId) {
        Optional<ChatServer> server = chatServerRepository.findById(serverId);
        return server.orElseThrow(() -> new RuntimeException("Server not found"));
    }

    public void deleteChatServer(Long serverId) {
        if (!chatServerRepository.existsById(serverId)) {
            throw new RuntimeException("Server not found");
        }
        chatServerRepository.deleteById(serverId);
    }

    public void updateServerStatus(Long serverId, String status) {
        ChatServer chatServer = getChatServerById(serverId);
        chatServer.setStatus(status);
        chatServerRepository.save(chatServer);
    }

    public void updateServerToken(Long serverId, String token) {
        ChatServer chatServer = getChatServerById(serverId);
        chatServer.setToken(token);
        chatServerRepository.save(chatServer);
    }

    public ChatServer saveServer(ChatServer chatServer) {
        return chatServerRepository.save(chatServer);
    }

}
