package com.omer.ostim.ai.model;

// import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Table(name = "chat_chat")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_id", nullable = false)
    private Long chatId;
    
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    @Column(name = "title", nullable = false)
    private String title;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @CreationTimestamp
    @Column(name = "created_time")
    private LocalDateTime createdTime;

    @NotBlank(message = "Status is required")
    @Size(min = 1, max = 50, message = "Status must be between 1 and 50 characters")
    @Column(name = "status", nullable = false)
    private String status;
    
    @NotBlank(message = "LMM type is required")
    @Size(min = 1, max = 100, message = "LMM type must be between 1 and 100 characters")
    @Column(name = "lmm_type", nullable = false)
    private String lmmType;
    
    @NotBlank(message = "Share token is required")
    @Size(min = 1, max = 255, message = "Share token must be between 1 and 255 characters")
    @Column(name = "share_token", nullable = false)
    private String shareToken;
}