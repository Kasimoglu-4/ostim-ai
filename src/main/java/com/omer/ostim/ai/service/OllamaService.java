package com.omer.ostim.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaModel;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.stereotype.Service;

@Service
public class OllamaService {

    private static final Logger log = LoggerFactory.getLogger(OllamaService.class);
    private final OllamaChatModel chatModel;

    public OllamaService(OllamaChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String generateResponse(String prompt) {
        try {
            // Build the prompt with options using the LLAMA3 model
            Prompt requestPrompt = new Prompt(
                prompt,
                OllamaOptions.builder()
                    .model(OllamaModel.LLAMA3)
                    .build()
            );

            // Call the chat model with the provided prompt
            ChatResponse response = chatModel.call(requestPrompt);

            // Return the generated text from the response
            return response.getResult().getOutput().getText();
        } catch (Exception e) {
            log.error("Error generating result from OllamaChatModel", e);
            throw new RuntimeException("Failed to generate result: " + e.getMessage(), e);
        }
    }
}
