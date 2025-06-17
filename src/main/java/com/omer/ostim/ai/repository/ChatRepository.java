package com.omer.ostim.ai.repository;

import com.omer.ostim.ai.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> findTopByOrderByChatIdDesc();
    
    /**
     * Find all chats belonging to a specific user.
     * 
     * @param userId the ID of the user
     * @return a list of chats belonging to the user
     */
    List<Chat> findByUserId(Long userId);
    
    /**
     * Find a chat by its share token.
     * 
     * @param shareToken the share token to search for
     * @return the chat if found
     */
    Optional<Chat> findByShareToken(String shareToken);
}