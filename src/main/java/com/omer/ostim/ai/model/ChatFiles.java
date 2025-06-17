package com.omer.ostim.ai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "chat_files")
@Data
public class ChatFiles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long fileId;
    
    @NotBlank(message = "File name is required")
    @Size(min = 1, max = 255, message = "File name must be between 1 and 255 characters")
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "cloud_id")
    private String cloudId;
    
    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @NotNull(message = "Chat ID is required")
    @Column(name = "chat_id", nullable = false)
    private Long chatId;
    
    @Column(name = "message_id")
    private Long messageId;
    
    @NotBlank(message = "Content type is required")
    @Size(min = 1, max = 100, message = "Content type must be between 1 and 100 characters")
    @Column(name = "content_type", nullable = false)
    private String contentType;
    
    @NotNull(message = "File size is required")
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @CreationTimestamp
    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;
    
    @Column(name = "extracted_text", columnDefinition = "LONGTEXT")
    private String extractedText;
    
    @Column(name = "text_extraction_successful", nullable = false)
    private Boolean textExtractionSuccessful = false;
}