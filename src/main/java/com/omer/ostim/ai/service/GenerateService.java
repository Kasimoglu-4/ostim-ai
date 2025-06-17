package com.omer.ostim.ai.service;

import com.omer.ostim.ai.dto.OllamaRequest;
import com.omer.ostim.ai.dto.OllamaResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class GenerateService {

    private final RestTemplate restTemplate;
    private static final String OLLAMA_ENDPOINT = "http://localhost:11434/api/generate";

    public OllamaResponse generateResponse(String prompt, String model) {
        try {
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            OllamaRequest request = new OllamaRequest();
            request.setModel(model);
            request.setPrompt(prompt);
            request.setStream(false);

            HttpEntity<OllamaRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<OllamaResponse> response = restTemplate.postForEntity(
                    OLLAMA_ENDPOINT,
                    entity,
                    OllamaResponse.class);

            if (response.getBody() == null) {
                // throw new AIGenerationException("No response received from Ollama");
                throw new RuntimeException("No response received from Ollama");
            }

            return response.getBody();
        } catch (Exception e) {
            // throw new AIGenerationException("Failed to generate AI response: " +
            // e.getMessage(), e);
            throw new RuntimeException("Failed to generate AI response: " + e.getMessage(), e);
        }
    }
}