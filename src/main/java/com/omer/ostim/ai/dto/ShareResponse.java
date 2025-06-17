package com.omer.ostim.ai.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShareResponse {
    private String shareToken;
    private String shareUrl;
    private String chatTitle;
    private LocalDateTime createdTime;
    private String lmmType;
    private boolean isShared;
    
    public ShareResponse(String shareToken, String shareUrl, String chatTitle) {
        this.shareToken = shareToken;
        this.shareUrl = shareUrl;
        this.chatTitle = chatTitle;
        this.isShared = true;
    }
} 