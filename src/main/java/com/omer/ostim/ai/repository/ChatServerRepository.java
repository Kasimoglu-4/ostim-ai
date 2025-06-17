package com.omer.ostim.ai.repository;

import com.omer.ostim.ai.model.ChatServer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatServerRepository extends JpaRepository<ChatServer, Long> {
    // Add any custom query methods here if needed in the future
}
