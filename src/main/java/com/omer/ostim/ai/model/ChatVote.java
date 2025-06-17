package com.omer.ostim.ai.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "chat_vote")
@Data
public class ChatVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_id")
    private Long voteId;

    @NotNull(message = "Chat ID is required")
    @Column(name = "chat_id", nullable = false)
    private Long chatId;

    @Column(name = "message_id")
    private Long messageId;

    @Column(name = "vote_int", nullable = false)
    private Integer voteInt;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private LocalDateTime createdTime;

    @Size(max = 1000, message = "Comment must be less than 1000 characters")
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
}
