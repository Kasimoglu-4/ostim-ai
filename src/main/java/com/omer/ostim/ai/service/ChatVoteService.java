package com.omer.ostim.ai.service;

import com.omer.ostim.ai.model.ChatVote;
import com.omer.ostim.ai.repository.ChatVoteRepository;
import org.springframework.stereotype.Service;

// import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatVoteService {

    private final ChatVoteRepository chatVoteRepository;

    public ChatVoteService(ChatVoteRepository chatVoteRepository) {
        this.chatVoteRepository = chatVoteRepository;
    }

    public void saveVote(ChatVote chatVote) {
        // Set default values for required fields if not provided
        
        // Ensure chatId is not null
        if (chatVote.getChatId() == null) {
            throw new IllegalArgumentException("Chat ID cannot be null");
        }
        
        // Ensure messageId is not null
        if (chatVote.getMessageId() == null) {
            throw new IllegalArgumentException("Message ID cannot be null");
        }
        
        // Ensure voteInt is not null and within valid range
        if (chatVote.getVoteInt() == null) {
            throw new IllegalArgumentException("Vote value cannot be null");
        }
        
        chatVoteRepository.save(chatVote);
    }

    public List<ChatVote> getVotesByChatId(Long chatId) {
        return chatVoteRepository.findByChatId(chatId);  
    }

    public ChatVote getVoteById(Long voteId) {
        Optional<ChatVote> vote = chatVoteRepository.findById(voteId);
        return vote.orElseThrow(() -> new RuntimeException("Vote not found"));
    }

    public void deleteVote(Long voteId) {
        chatVoteRepository.deleteById(voteId);
    }
}
