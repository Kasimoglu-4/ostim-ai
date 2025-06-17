package com.omer.ostim.ai.dto;

import lombok.Data;

@Data
public class OllamaRequest {
    private String model;
    private String prompt;
    private Boolean stream;
}