package com.omer.ostim.ai.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Table(name = "chat_messages")
public class ChatMessages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;
    
    @NotBlank(message = "Message content is required")
    @Column(name = "message_content", columnDefinition = "TEXT", nullable = false)
    private String messageContent;
    
    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private LocalDateTime createdTime;
    
    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @NotBlank(message = "Message type is required")
    @Size(min = 1, max = 50, message = "Message type must be between 1 and 50 characters")
    @Column(name = "message_type", nullable = false)
    private String messageType; // bot || user
    
    @NotNull(message = "Chat ID is required")
    @Column(name = "chat_id", nullable = false)
    private Long chatId;
}