package com.omer.ostim.ai.repository;

import com.omer.ostim.ai.model.ChatMessages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessagesRepository extends JpaRepository<ChatMessages, Long> {
    List<ChatMessages> findByMessageId(Long messageId);
    
    List<ChatMessages> findByChatId(Long chatId);
    
    boolean existsByMessageId(Long messageId);
    
    Optional<ChatMessages> findByChatIdAndMessageId(Long chatId, Long messageId);
}
