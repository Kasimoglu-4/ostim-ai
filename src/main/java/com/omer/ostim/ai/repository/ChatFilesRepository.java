package com.omer.ostim.ai.repository;

import com.omer.ostim.ai.model.ChatFiles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatFilesRepository extends JpaRepository<ChatFiles, Long> {
    
    List<ChatFiles> findByChatId(Long chatId);
    List<ChatFiles> findByFileId(Long fileId);
    List<ChatFiles> findByMessageId(Long messageId);
    List<ChatFiles> findByUserId(Long userId);
    List<ChatFiles> findByChatIdAndMessageIdIsNull(Long chatId);
}

