package com.omer.ostim.ai.controller;

import com.omer.ostim.ai.model.ChatFiles;
import com.omer.ostim.ai.service.AIFileProcessingService;
import com.omer.ostim.ai.service.ChatFileService;
import com.omer.ostim.ai.service.FileProcessingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files/ai")
@RequiredArgsConstructor
public class FileAIController {

    private static final Logger log = LoggerFactory.getLogger(FileAIController.class);
    
    private final AIFileProcessingService aiFileProcessingService;
    private final ChatFileService chatFileService;
    private final FileProcessingService fileProcessingService;

    /**
     * Analyze uploaded file and extract text content preview
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            log.info("User {} analyzing file: {}", username, file.getOriginalFilename());
            
            // Analyze the file using FileProcessingService
            FileProcessingService.FileAnalysisResult analysis = fileProcessingService.analyzeFile(file);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileName", analysis.getFileName());
            response.put("fileSize", analysis.getFileSize());
            response.put("contentType", analysis.getContentType());
            response.put("textExtractionSupported", analysis.isTextExtractionSupported());
            response.put("extractionSuccessful", analysis.isExtractionSuccessful());
            response.put("textPreview", analysis.getTextPreview());
            response.put("wordCount", analysis.getWordCount());
            
            if (!analysis.isExtractionSuccessful() && analysis.getErrorMessage() != null) {
                response.put("errorMessage", analysis.getErrorMessage());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error analyzing file: {}", file.getOriginalFilename(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error analyzing file: " + e.getMessage());
        }
    }

    /**
     * Ask questions about an uploaded file
     */
    @PostMapping("/question/{fileId}")
    public ResponseEntity<?> askQuestionAboutFile(
            @PathVariable Long fileId,
            @RequestParam String question,
            @RequestParam(defaultValue = "deepseek-r1:1.5b") String model) {
        
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            log.info("User {} asking question about file ID {}: {}", username, fileId, question);
            
            // Verify file exists and user has access
            chatFileService.getFileById(fileId); // This will throw if file doesn't exist or user doesn't have access
            
            // Generate AI response about the file
            String aiResponse = aiFileProcessingService.generateResponseAboutFile(fileId, question, model);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileId", fileId);
            response.put("question", question);
            response.put("model", model);
            response.put("response", aiResponse);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing question about file ID {}: {}", fileId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing your question: " + e.getMessage());
        }
    }

    /**
     * Summarize an uploaded file
     */
    @PostMapping("/summarize/{fileId}")
    public ResponseEntity<?> summarizeFile(
            @PathVariable Long fileId,
            @RequestParam(defaultValue = "deepseek-r1:1.5b") String model) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            log.info("User {} requesting summary for file ID {}", username, fileId);
            
            // Verify file exists and user has access
            chatFileService.getFileById(fileId);
            
            // Generate AI summary
            String summary = aiFileProcessingService.summarizeFile(fileId, model);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileId", fileId);
            response.put("model", model);
            response.put("summary", summary);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error summarizing file ID {}: {}", fileId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error summarizing file: " + e.getMessage());
        }
    }

    /**
     * Perform detailed analysis of an uploaded file
     */
    @PostMapping("/detailed-analysis/{fileId}")
    public ResponseEntity<?> performDetailedAnalysis(
            @PathVariable Long fileId,
            @RequestParam(defaultValue = "deepseek-r1:1.5b") String model) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            log.info("User {} requesting detailed analysis for file ID {}", username, fileId);
            
            // Verify file exists and user has access
            chatFileService.getFileById(fileId);
            
            // Generate AI analysis
            String analysis = aiFileProcessingService.analyzeFile(fileId, model);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileId", fileId);
            response.put("model", model);
            response.put("analysis", analysis);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error analyzing file ID {}: {}", fileId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error analyzing file: " + e.getMessage());
        }
    }

    /**
     * Ask questions about a file with conversation context
     */
    @PostMapping("/question-with-context/{fileId}")
    public ResponseEntity<?> askQuestionWithContext(
            @PathVariable Long fileId,
            @RequestParam String question,
            @RequestParam(required = false) String context,
            @RequestParam(defaultValue = "deepseek-r1:1.5b") String model) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            log.info("User {} asking contextual question about file ID {}", username, fileId);
            
            // Verify file exists and user has access
            chatFileService.getFileById(fileId);
            
            // Generate AI response with context
            String aiResponse = aiFileProcessingService.generateResponseAboutFileWithContext(
                    fileId, question, context, model);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileId", fileId);
            response.put("question", question);
            response.put("context", context);
            response.put("model", model);
            response.put("response", aiResponse);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing contextual question about file ID {}: {}", fileId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing your question: " + e.getMessage());
        }
    }

    /**
     * Get extracted text content from a file
     */
    @GetMapping("/text/{fileId}")
    public ResponseEntity<?> getExtractedText(@PathVariable Long fileId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            log.info("User {} requesting extracted text for file ID {}", username, fileId);
            
            // Verify file exists and user has access
            chatFileService.getFileById(fileId);
            
            // Get extracted text
            String extractedText = chatFileService.getExtractedText(fileId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileId", fileId);
            response.put("extractedText", extractedText);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting extracted text for file ID {}: {}", fileId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving extracted text: " + e.getMessage());
        }
    }

    /**
     * Re-extract text from a file (if extraction failed previously)
     */
    @PostMapping("/re-extract/{fileId}")
    public ResponseEntity<?> reExtractText(@PathVariable Long fileId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            log.info("User {} requesting text re-extraction for file ID {}", username, fileId);
            
            // Re-extract text
            chatFileService.reExtractText(fileId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileId", fileId);
            response.put("message", "Text re-extraction completed successfully");
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error re-extracting text for file ID {}: {}", fileId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error re-extracting text: " + e.getMessage());
        }
    }

    /**
     * Debug endpoint to check file processing status
     */
    @GetMapping("/debug/{fileId}")
    public ResponseEntity<?> debugFile(@PathVariable Long fileId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            log.info("Debug request for file ID: {} by user: {}", fileId, username);
            
            // Get file details
            ChatFiles file = chatFileService.getFileById(fileId);
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("fileId", file.getFileId());
            debugInfo.put("fileName", file.getFileName());
            debugInfo.put("contentType", file.getContentType());
            debugInfo.put("fileSize", file.getFileSize());
            debugInfo.put("textExtractionSuccessful", file.getTextExtractionSuccessful());
            
            // Get extracted text length and preview
            String extractedText = file.getExtractedText();
            if (extractedText != null) {
                debugInfo.put("extractedTextLength", extractedText.length());
                debugInfo.put("extractedTextPreview", 
                    extractedText.length() > 200 ? 
                    extractedText.substring(0, 200) + "..." : extractedText);
            } else {
                debugInfo.put("extractedTextLength", 0);
                debugInfo.put("extractedTextPreview", "null");
            }
            
            log.info("Debug info for file {}: {}", fileId, debugInfo);
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            log.error("Error in debug endpoint for file ID {}: {}", fileId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error debugging file: " + e.getMessage());
        }
    }
} 