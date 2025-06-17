package com.omer.ostim.ai.repository;

import com.omer.ostim.ai.model.ChatVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatVoteRepository extends JpaRepository<ChatVote, Long> {
    // Find all votes by chatId
    List<ChatVote> findByChatId(Long chatId);
    
    // Find all votes by messageId
    List<ChatVote> findByMessageId(Long messageId);
}
