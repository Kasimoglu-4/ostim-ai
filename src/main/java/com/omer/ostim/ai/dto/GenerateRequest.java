package com.omer.ostim.ai.dto;

import lombok.Data;

@Data
public class GenerateRequest {
    private String prompt;
    private String model;
}