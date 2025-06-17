package com.omer.ostim.ai.service;

import com.omer.ostim.ai.model.ChatFiles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
// import org.springframework.ai.ollama.api.OllamaModel;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AIFileProcessingService {

    private static final Logger log = LoggerFactory.getLogger(AIFileProcessingService.class);
    
    private final OllamaChatModel chatModel;
    private final ChatFileService chatFileService;
    
    @Autowired
    public AIFileProcessingService(OllamaChatModel chatModel, ChatFileService chatFileService) {
        this.chatModel = chatModel;
        this.chatFileService = chatFileService;
    }
    
    /**
     * Generate AI response about a file's content
     * @param fileId The ID of the uploaded file
     * @param userQuestion The user's question about the file
     * @param modelName The AI model to use (optional, defaults to deepseek-r1:1.5b)
     * @return AI-generated response about the file content
     */
    public String generateResponseAboutFile(Long fileId, String userQuestion, String modelName) {
        try {
            log.info("Generating response for file ID: {} with question: {}", fileId, userQuestion);
            
            // Get the extracted text from the file
            String extractedText = chatFileService.getExtractedText(fileId);
            log.info("Retrieved extracted text for file ID: {}, length: {}", fileId, 
                    extractedText != null ? extractedText.length() : 0);
            
            if (extractedText == null || extractedText.trim().isEmpty()) {
                log.warn("No extracted text found for file ID: {}", fileId);
                return "I couldn't extract any text content from this file. Please make sure the file contains readable text and is in a supported format (PDF, DOCX, TXT, etc.).";
            }
            
            // Check if text extraction was successful
            ChatFiles file = chatFileService.getFileById(fileId);
            log.info("File details - Name: {}, Type: {}, Extraction successful: {}", 
                    file.getFileName(), file.getContentType(), file.getTextExtractionSuccessful());
            
            if (!file.getTextExtractionSuccessful()) {
                log.warn("Text extraction failed for file ID: {}, error: {}", fileId, extractedText);
                return "There was an issue extracting text from this file: " + extractedText;
            }
            
            // Log a preview of the extracted text
            String textPreview = extractedText.length() > 200 ? 
                extractedText.substring(0, 200) + "..." : extractedText;
            log.info("Extracted text preview: {}", textPreview);
            
            // Create a comprehensive prompt combining the file content and user question
            String prompt = buildPromptWithFileContent(extractedText, userQuestion, file.getFileName());
            
            // Determine which model to use
            String actualModelName = (modelName != null && !modelName.trim().isEmpty()) ? modelName : "deepseek-r1:1.5b";
            log.info("Using model: {} for file processing", actualModelName);
            
            return generateAIResponse(prompt, actualModelName);
            
        } catch (Exception e) {
            log.error("Error generating AI response about file with ID: {}", fileId, e);
            return "I encountered an error while processing your request about this file. Please try again or contact support if the issue persists. Error: " + e.getMessage();
        }
    }
    
    /**
     * Generate AI response about file content with context from previous conversation
     * @param fileId The ID of the uploaded file
     * @param userQuestion The user's question about the file
     * @param conversationContext Previous conversation context
     * @param modelName The AI model to use
     * @return AI-generated response
     */
    public String generateResponseAboutFileWithContext(Long fileId, String userQuestion, 
                                                     String conversationContext, String modelName) {
        try {
            String extractedText = chatFileService.getExtractedText(fileId);
            
            if (extractedText == null || extractedText.trim().isEmpty()) {
                return "I couldn't extract any text content from this file to analyze.";
            }
            
            ChatFiles file = chatFileService.getFileById(fileId);
            if (!file.getTextExtractionSuccessful()) {
                return "There was an issue extracting text from this file: " + extractedText;
            }
            
            String prompt = buildPromptWithFileContentAndContext(extractedText, userQuestion, 
                                                               conversationContext, file.getFileName());
            
            String actualModelName = (modelName != null && !modelName.trim().isEmpty()) ? modelName : "deepseek-r1:1.5b";
            
            return generateAIResponse(prompt, actualModelName);
            
        } catch (Exception e) {
            log.error("Error generating AI response about file with context. File ID: {}", fileId, e);
            return "I encountered an error while processing your request. Please try again.";
        }
    }
    
    /**
     * Summarize the content of an uploaded file
     * @param fileId The ID of the uploaded file
     * @param modelName The AI model to use
     * @return AI-generated summary
     */
    public String summarizeFile(Long fileId, String modelName) {
        try {
            String extractedText = chatFileService.getExtractedText(fileId);
            ChatFiles file = chatFileService.getFileById(fileId);
            
            if (extractedText == null || extractedText.trim().isEmpty() || !file.getTextExtractionSuccessful()) {
                return "I couldn't extract readable text from this file to create a summary.";
            }
            
            String prompt = buildSummaryPrompt(extractedText, file.getFileName());
            String actualModelName = (modelName != null && !modelName.trim().isEmpty()) ? modelName : "deepseek-r1:1.5b";
            
            return generateAIResponse(prompt, actualModelName);
            
        } catch (Exception e) {
            log.error("Error summarizing file with ID: {}", fileId, e);
            return "I encountered an error while trying to summarize this file.";
        }
    }
    
    /**
     * Analyze the content and structure of an uploaded file
     * @param fileId The ID of the uploaded file
     * @param modelName The AI model to use
     * @return AI-generated analysis
     */
    public String analyzeFile(Long fileId, String modelName) {
        try {
            String extractedText = chatFileService.getExtractedText(fileId);
            ChatFiles file = chatFileService.getFileById(fileId);
            
            if (extractedText == null || extractedText.trim().isEmpty() || !file.getTextExtractionSuccessful()) {
                return "I couldn't extract readable text from this file to perform an analysis.";
            }
            
            String prompt = buildAnalysisPrompt(extractedText, file.getFileName(), file.getContentType());
            String actualModelName = (modelName != null && !modelName.trim().isEmpty()) ? modelName : "deepseek-r1:1.5b";
            
            return generateAIResponse(prompt, actualModelName);
            
        } catch (Exception e) {
            log.error("Error analyzing file with ID: {}", fileId, e);
            return "I encountered an error while trying to analyze this file.";
        }
    }
    
    /**
     * Build a prompt that includes file content and user question
     */
    private String buildPromptWithFileContent(String fileContent, String userQuestion, String fileName) {
        StringBuilder promptBuilder = new StringBuilder();
        
        promptBuilder.append("I have uploaded a file named \"").append(fileName).append("\" with the following content:\n\n");
        promptBuilder.append("--- FILE CONTENT START ---\n");
        
        // Truncate very long content to prevent token limits
        String truncatedContent = fileContent.length() > 15000 ? 
            fileContent.substring(0, 15000) + "\n\n[Content truncated due to length...]" : fileContent;
        
        promptBuilder.append(truncatedContent);
        promptBuilder.append("\n--- FILE CONTENT END ---\n\n");
        
        promptBuilder.append("Based on this file content, please answer the following question:\n");
        promptBuilder.append(userQuestion);
        
        promptBuilder.append("\n\nPlease provide a detailed and accurate response based on the file content. ");
        promptBuilder.append("If the question cannot be answered from the file content, please mention that clearly.");
        
        return promptBuilder.toString();
    }
    
    /**
     * Build a prompt with file content, user question, and conversation context
     */
    private String buildPromptWithFileContentAndContext(String fileContent, String userQuestion, 
                                                       String conversationContext, String fileName) {
        StringBuilder promptBuilder = new StringBuilder();
        
        if (conversationContext != null && !conversationContext.trim().isEmpty()) {
            promptBuilder.append("Previous conversation context:\n");
            promptBuilder.append(conversationContext);
            promptBuilder.append("\n\n");
        }
        
        promptBuilder.append("I have uploaded a file named \"").append(fileName).append("\" with the following content:\n\n");
        promptBuilder.append("--- FILE CONTENT START ---\n");
        
        String truncatedContent = fileContent.length() > 12000 ? 
            fileContent.substring(0, 12000) + "\n\n[Content truncated due to length...]" : fileContent;
        
        promptBuilder.append(truncatedContent);
        promptBuilder.append("\n--- FILE CONTENT END ---\n\n");
        
        promptBuilder.append("Based on both the previous conversation and this file content, please answer:\n");
        promptBuilder.append(userQuestion);
        
        return promptBuilder.toString();
    }
    
    /**
     * Build a prompt for summarizing file content
     */
    private String buildSummaryPrompt(String fileContent, String fileName) {
        StringBuilder promptBuilder = new StringBuilder();
        
        promptBuilder.append("Please provide a comprehensive summary of the following document \"").append(fileName).append("\":\n\n");
        promptBuilder.append("--- DOCUMENT CONTENT ---\n");
        
        String truncatedContent = fileContent.length() > 18000 ? 
            fileContent.substring(0, 18000) + "\n\n[Content truncated due to length...]" : fileContent;
        
        promptBuilder.append(truncatedContent);
        promptBuilder.append("\n--- END DOCUMENT CONTENT ---\n\n");
        
        promptBuilder.append("Please provide:\n");
        promptBuilder.append("1. A brief overview of the document\n");
        promptBuilder.append("2. Key points and main topics covered\n");
        promptBuilder.append("3. Important conclusions or findings (if any)\n");
        promptBuilder.append("4. Any notable structure or organization\n\n");
        promptBuilder.append("Keep the summary clear, concise, and well-organized.");
        
        return promptBuilder.toString();
    }
    
    /**
     * Build a prompt for analyzing file content and structure
     */
    private String buildAnalysisPrompt(String fileContent, String fileName, String contentType) {
        StringBuilder promptBuilder = new StringBuilder();
        
        promptBuilder.append("Please perform a detailed analysis of the following document \"")
                    .append(fileName).append("\" (").append(contentType).append("):\n\n");
        promptBuilder.append("--- DOCUMENT CONTENT ---\n");
        
        String truncatedContent = fileContent.length() > 18000 ? 
            fileContent.substring(0, 18000) + "\n\n[Content truncated due to length...]" : fileContent;
        
        promptBuilder.append(truncatedContent);
        promptBuilder.append("\n--- END DOCUMENT CONTENT ---\n\n");
        
        promptBuilder.append("Please provide an analysis including:\n");
        promptBuilder.append("1. Document type and purpose\n");
        promptBuilder.append("2. Content structure and organization\n");
        promptBuilder.append("3. Key themes and topics\n");
        promptBuilder.append("4. Writing style and tone\n");
        promptBuilder.append("5. Any data, statistics, or evidence presented\n");
        promptBuilder.append("6. Main arguments or conclusions\n");
        promptBuilder.append("7. Target audience (if apparent)\n\n");
        promptBuilder.append("Be thorough but concise in your analysis.");
        
        return promptBuilder.toString();
    }
    
    /**
     * Generate AI response using the specified model
     */
    private String generateAIResponse(String prompt, String modelName) {
        try {
            log.info("Generating AI response using model: {} with prompt length: {}", modelName, prompt.length());
            
            // Build the prompt with the specified model
            Prompt requestPrompt = new Prompt(
                prompt,
                OllamaOptions.builder()
                    .model(modelName)
                    .build()
            );

            // Call the chat model with the provided prompt
            ChatResponse response = chatModel.call(requestPrompt);
            String generatedText = response.getResult().getOutput().getText();
            
            log.info("Successfully generated AI response with length: {}", generatedText.length());
            return generatedText;
            
        } catch (Exception e) {
            log.error("Error generating AI response with model: {}", modelName, e);
            throw new RuntimeException("Failed to generate AI response: " + e.getMessage(), e);
        }
    }
} 