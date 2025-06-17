package com.omer.ostim.ai.dto;

// import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

   // @JsonProperty("user_id")
    private Long userId;

    @NotBlank(message = "Status is required")
    @Size(min = 1, max = 50, message = "Status must be between 1 and 50 characters")
    private String status;

  //  @JsonProperty("lmm_type")
    @NotBlank(message = "LMM type is required")
    @Size(min = 1, max = 100, message = "LMM type must be between 1 and 100 characters")
    private String lmmType;

  //  @JsonProperty("share_token")
    @NotBlank(message = "Share token is required")
    @Size(min = 1, max = 255, message = "Share token must be between 1 and 255 characters")
    private String shareToken;
}
