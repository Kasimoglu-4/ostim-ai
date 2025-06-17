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
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chat_servers")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class ChatServer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "server_id")
    private Long serverId;

    @NotBlank(message = "Endpoint URL is required")
    @Size(min = 1, max = 255, message = "Endpoint URL must be between 1 and 255 characters")
    @Column(name = "endpoint_url", nullable = false)
    private String endpointUrl;

    @NotNull(message = "Endpoint port is required")
    @Column(name = "endpoint_port", nullable = false)
    private Integer endpointPort;

    @NotBlank(message = "Status is required")
    @Size(min = 1, max = 50, message = "Status must be between 1 and 50 characters")
    @Column(name = "status", nullable = false)
    private String status;

    @Size(max = 255, message = "Token must be less than 255 characters")
    @Column(name = "token", nullable = true)
    private String token;
}