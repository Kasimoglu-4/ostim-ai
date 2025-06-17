package com.omer.ostim.ai.controller;

import com.omer.ostim.ai.model.Chat;
import com.omer.ostim.ai.dto.ChatRequest;
import com.omer.ostim.ai.service.ChatService;
import com.omer.ostim.ai.service.ChatFileService;
import com.omer.ostim.ai.model.User;
import com.omer.ostim.ai.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

// import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatFileService chatFileService;
    private final UserRepository userRepository;

    // Yeni Sohbet oluşturma
    @PostMapping
    public Chat createChat(@Valid @RequestBody ChatRequest chatRequest, Authentication authentication) {
        // Get authenticated user
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Chat chat = new Chat();
        chat.setTitle(chatRequest.getTitle());
        chat.setUserId(user.getId()); // Use the authenticated user's ID
        chat.setStatus(chatRequest.getStatus());
        chat.setLmmType(chatRequest.getLmmType());
        chat.setShareToken(chatRequest.getShareToken());

        return chatService.saveChat(chat);
    }
    
    // Tum Sohbetleri getir
    @GetMapping
    public List<Chat> getAllChats(Authentication authentication) {
        // Get authenticated user
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Return only chats for this user
        return chatService.getChatsByUserId(user.getId());
    }
    // Sohbeti ID ile getir
    @GetMapping("/{chatId}")
    public Chat getChatById(@PathVariable Long chatId, Authentication authentication) {
        // Get authenticated user
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get the chat
        Chat chat = chatService.getChatById(chatId);
        
        // Check if this chat belongs to the authenticated user
        if (chat != null && !chat.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to chat");
        }
        
        return chat;
    }
    // Sohbeti sil
    @DeleteMapping("/{chatId}")
    public ResponseEntity<String> deleteChat(@PathVariable Long chatId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the chat
            Chat chat = chatService.getChatById(chatId);
            
            // Check if this chat belongs to the authenticated user
            if (chat != null && !chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized access to chat");
            }
            
            chatService.deleteChat(chatId);
            return ResponseEntity.ok("Chat ID: " + chatId + " deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to delete chat ID: " + chatId + " - " + e.getMessage());
        }
    }
    
    // Delete all chats
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllChats(Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the count of chats before deletion
            long chatCount = chatService.getChatsByUserId(user.getId()).size();
            
            // Delete all chats for this user
            chatService.deleteAllChatsByUserId(user.getId());
            
            return ResponseEntity.ok(chatCount + " chats deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to delete all chats: " + e.getMessage());
        }
    }
    
    // Update chat title
    @PutMapping("/{chatId}/title")
    public ResponseEntity<?> updateChatTitle(@PathVariable Long chatId, @RequestBody String newTitle, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the chat
            Chat chat = chatService.getChatById(chatId);
            
            // Check if chat exists
            if (chat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Chat not found with ID: " + chatId);
            }
            
            // Check if this chat belongs to the authenticated user
            if (!chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized access to chat");
            }
            
            // Remove any JSON formatting from the title string but preserve spaces
            String cleanTitle = newTitle.replaceAll("[\\{\\}\\r\\n\"']", "").trim();
            
            // Check that title is not empty after cleaning
            if (cleanTitle.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Chat title cannot be empty");
            }
            
            // Update the title
            chat.setTitle(cleanTitle);
            Chat updatedChat = chatService.saveChat(chat);
            
            return ResponseEntity.ok(updatedChat);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update chat title: " + e.getMessage());
        }
    }
    
    // 
    @PostMapping("/generate")
    public String generateResponse(@RequestBody RequestData requestData) {
        if (requestData.getPrompt() == null) {
            throw new IllegalArgumentException("Prompt is required");
        }
        
        // Debug logging for the file attachment
        if (requestData.getFileAttachment() != null) {
            System.out.println("Received file attachment: " + requestData.getFileAttachment().toString());
        }
        
        String model = requestData.getModel() != null ? requestData.getModel() : "deepseek-r1:1.5b";
        
        // If file attachment info is present, pass it to the generate method
        try {
            if (requestData.getFileAttachment() != null) {
                FileAttachment attachment = requestData.getFileAttachment();
                
                // Debug the file ID
                System.out.println("Processing file with ID: " + attachment.getFileId() + 
                            ", Type: " + attachment.getContentType() + 
                            ", Name: " + attachment.getFileName());
                
                // If fileId is null or invalid, just use a generic response
                if (attachment.getFileId() == null) {
                    String genericFilePrompt = "The user has uploaded a file named '" + attachment.getFileName() + 
                                    "' of type '" + attachment.getContentType() + "'. " +
                                    "Their request is: " + requestData.getPrompt();
                    
                    return chatService.generateResponse(genericFilePrompt, model);
                }
                
                // For text files, try to get the content and enhance the prompt
                if (isTextFileType(attachment.getContentType()) || 
                    attachment.getContentType().equals("application/pdf") ||
                    attachment.getContentType().contains("word") ||
                    attachment.getContentType().contains("presentation") ||
                    attachment.getContentType().contains("spreadsheet")) {
                    try {
                        // Get the extracted text content of the file (this works for all supported file types)
                        System.out.println("Attempting to get extracted text for file ID: " + attachment.getFileId());
                        
                        String fileContent = null;
                        try {
                            fileContent = chatFileService.getExtractedText(attachment.getFileId());
                            System.out.println("Successfully retrieved extracted text. Length: " + 
                                             (fileContent != null ? fileContent.length() : 0));
                        } catch (Exception extractionError) {
                            System.err.println("Error getting extracted text for file ID " + attachment.getFileId() + 
                                             ": " + extractionError.getMessage());
                            extractionError.printStackTrace();
                            
                            // Try to get basic file info for debugging
                            try {
                                var file = chatFileService.getFileById(attachment.getFileId());
                                System.out.println("File exists: " + file.getFileName() + 
                                                 ", textExtractionSuccessful: " + file.getTextExtractionSuccessful());
                            } catch (Exception fileError) {
                                System.err.println("Cannot access file with ID " + attachment.getFileId() + 
                                                 ": " + fileError.getMessage());
                            }
                            
                            // Return a helpful error message instead of crashing
                            return "I encountered an error while trying to read the content from your uploaded file '" + 
                                   attachment.getFileName() + "'. The file was uploaded successfully, but I couldn't extract " +
                                   "the text content for processing. This might be due to a database issue or text extraction problem. " +
                                   "Please try uploading the file again, or contact support if the issue persists. " +
                                   "Your original question was: " + requestData.getPrompt();
                        }
                        
                        if (fileContent != null && !fileContent.trim().isEmpty() && 
                            !fileContent.startsWith("Text extraction failed") && 
                            !fileContent.contains("not supported")) {
                            
                            // Create a new enhanced prompt with the file content
                            String enhancedPrompt = "Based on the following document content, please answer the user's question.\n\n" +
                                                   "Document: " + attachment.getFileName() + "\n" +
                                                   "Content:\n" + fileContent + "\n\n" +
                                                   "User's question: " + requestData.getPrompt();
                            
                            System.out.println("Enhanced prompt with extracted file content (first 200 chars): " + 
                                             enhancedPrompt.substring(0, Math.min(200, enhancedPrompt.length())) + "...");
                            
                            // Generate response with the enhanced prompt
                            return chatService.generateResponse(enhancedPrompt, model);
                        } else {
                            System.out.println("No valid extracted text found for file ID: " + attachment.getFileId() + 
                                             ". Extracted text: " + (fileContent != null ? fileContent.substring(0, Math.min(100, fileContent.length())) : "null"));
                            
                            // If text extraction failed, provide a helpful message
                            return "I was unable to extract readable text from your uploaded file '" + attachment.getFileName() + 
                                   "'. This might happen with some file formats or if the file is corrupted. " +
                                   "Please make sure your file contains readable text and try uploading it again. " +
                                   "Supported formats include: PDF, DOCX, TXT, PPTX, XLSX, and more. " +
                                   "Your original question was: " + requestData.getPrompt();
                        }
                    } catch (Exception e) {
                        // Log the error and continue with the standard file attachment handling
                        System.err.println("Error reading extracted text: " + e.getMessage());
                        e.printStackTrace();
                        
                        // Return a helpful error message instead of crashing
                        return "I encountered an unexpected error while processing your uploaded file '" + 
                               attachment.getFileName() + "'. The error was: " + e.getMessage() + 
                               ". Please try uploading the file again or contact support if the issue persists. " +
                               "Your original question was: " + requestData.getPrompt();
                    }
                } 
                // For image files, create a special prompt
                else if (isImageFileType(attachment.getContentType())) {
                    try {
                        // Create a specialized prompt for image files
                        String imagePrompt = "The user has uploaded an image file named '" + attachment.getFileName() + 
                                            "'. Please analyze this image and help them with their request: " + requestData.getPrompt();
                        System.out.println("Created image prompt: " + imagePrompt);
                        
                        return chatService.generateResponse(imagePrompt, model);
                    } catch (Exception e) {
                        System.err.println("Error processing image file: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                
                // Standard file attachment handling if not a text file or if an error occurred
                System.out.println("Using standard file attachment handling with fileAttachment object");
                return chatService.generateResponseWithFile(
                    requestData.getPrompt(), 
                    model, 
                    requestData.getFileAttachment()
                );
            } else {
                return chatService.generateResponse(requestData.getPrompt(), model);
            }
        } catch (Exception e) {
            System.err.println("Error in generateResponse: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback to basic response without file
            return chatService.generateResponse(
                "Error processing file. " + requestData.getPrompt(), 
                model
            );
        }
    }
    
    /**
     * Check if the content type is a text file type.
     */
    private boolean isTextFileType(String contentType) {
        if (contentType == null) return false;
        
        return contentType.startsWith("text/") || 
            contentType.equals("application/json") || 
            contentType.equals("application/xml") ||
            contentType.contains("javascript") || 
            contentType.contains("css") ||
            contentType.contains("html") ||
            contentType.equals("application/x-sh");
    }
    
    /**
     * Check if the content type is an image file type.
     */
    private boolean isImageFileType(String contentType) {
        if (contentType == null) return false;
        
        return contentType.startsWith("image/");
    }

    // Yanit olusturmak icin
    @GetMapping("/generate")
    public String generateResponse(@RequestParam String prompt, @RequestParam(required = false, defaultValue = "deepseek-r1:1.5b") String model) {
        if (prompt == null || prompt.isEmpty()) {
            throw new IllegalArgumentException("Prompt is required");
        }
        return chatService.generateResponse(prompt, model);
    }

    public static class RequestData {
        private String prompt;
        private String model;
        private FileAttachment fileAttachment;

        public String getPrompt() {
            return prompt;
        }

        public void setPrompt(String prompt) {
            this.prompt = prompt;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }
        
        public FileAttachment getFileAttachment() {
            return fileAttachment;
        }
        
        public void setFileAttachment(FileAttachment fileAttachment) {
            this.fileAttachment = fileAttachment;
        }
    }
    
    public static class FileAttachment {
        private Long fileId;
        private String fileName;
        private String contentType;
        private Long fileSize;
        
        public Long getFileId() {
            return fileId;
        }
        
        public void setFileId(Long fileId) {
            this.fileId = fileId;
        }
        
        public String getFileName() {
            return fileName;
        }
        
        public void setFileName(String fileName) {
            this.fileName = fileName;
        }
        
        public String getContentType() {
            return contentType;
        }
        
        public void setContentType(String contentType) {
            this.contentType = contentType;
        }
        
        public Long getFileSize() {
            return fileSize;
        }
        
        public void setFileSize(Long fileSize) {
            this.fileSize = fileSize;
        }
        
        @Override
        public String toString() {
            return "FileAttachment{" +
                    "fileId=" + fileId +
                    ", fileName='" + fileName + '\'' +
                    ", contentType='" + contentType + '\'' +
                    ", fileSize=" + fileSize +
                    '}';
        }
    }

    // Handle validation errors
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

    // Get share information for a chat
    @GetMapping("/{chatId}/share")
    public ResponseEntity<?> getShareInfo(@PathVariable Long chatId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the chat
            Chat chat = chatService.getChatById(chatId);
            
            // Check if chat exists
            if (chat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Chat not found with ID: " + chatId);
            }
            
            // Check if this chat belongs to the authenticated user
            if (!chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized access to chat");
            }
            
            // Create share URL
            String shareUrl = "http://localhost:3000/share/" + chat.getShareToken();
            
            Map<String, Object> shareInfo = new HashMap<>();
            shareInfo.put("shareToken", chat.getShareToken());
            shareInfo.put("shareUrl", shareUrl);
            shareInfo.put("chatTitle", chat.getTitle());
            shareInfo.put("isShared", !chat.getShareToken().equals("default-token"));
            
            return ResponseEntity.ok(shareInfo);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to get share info: " + e.getMessage());
        }
    }

    // Regenerate share token for a chat
    @PostMapping("/{chatId}/regenerate-share")
    public ResponseEntity<?> regenerateShareToken(@PathVariable Long chatId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the chat
            Chat chat = chatService.getChatById(chatId);
            
            // Check if chat exists
            if (chat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Chat not found with ID: " + chatId);
            }
            
            // Check if this chat belongs to the authenticated user
            if (!chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized access to chat");
            }
            
            // Force regeneration of share token
            chat.setShareToken(null);
            Chat updatedChat = chatService.saveChat(chat);
            
            // Create share URL
            String shareUrl = "http://localhost:3000/share/" + updatedChat.getShareToken();
            
            Map<String, Object> response = new HashMap<>();
            response.put("shareToken", updatedChat.getShareToken());
            response.put("shareUrl", shareUrl);
            response.put("chatTitle", updatedChat.getTitle());
            response.put("message", "Share token regenerated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to regenerate share token: " + e.getMessage());
        }
    }

    // Admin endpoint to update all default tokens (for migration)
    @PostMapping("/admin/update-default-tokens")
    public ResponseEntity<?> updateAllDefaultTokens(Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update all default tokens
            int updatedCount = chatService.updateAllDefaultTokens();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully updated default tokens");
            response.put("updatedCount", updatedCount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update default tokens: " + e.getMessage());
        }
    }
}