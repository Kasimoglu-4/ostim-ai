package com.omer.ostim.ai.controller;

import com.omer.ostim.ai.model.ChatFiles;
import com.omer.ostim.ai.service.ChatFileService;
import com.omer.ostim.ai.model.User;
import com.omer.ostim.ai.model.Chat;
import com.omer.ostim.ai.repository.UserRepository;
import com.omer.ostim.ai.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class ChatFileController {

    private final ChatFileService chatFileService;
    private final UserRepository userRepository;
    private final ChatService chatService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
            @RequestParam("chatId") String chatIdStr,
            @RequestParam(value = "messageId", required = false) String messageIdStr) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        
        try {
            // Get authenticated user's username
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            Long chatId;
            // Handle case where chatId is "welcome" or other non-numeric value
            try {
                chatId = Long.parseLong(chatIdStr);
                
                // If chatId is valid, check if this user owns the chat
                if (chatId > 0) {
                    User user = userRepository.findByUsername(username)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    
                    Chat chat = chatService.getChatById(chatId);
                    if (chat == null) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found");
                    }
                    
                    if (!chat.getUserId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized access to chat");
                    }
                }
                
            } catch (NumberFormatException e) {
                chatId = 0L; // Default chatId for welcome page uploads
            }
            
            // Handle messageId - either convert from string or set to null
            Long messageId = null;
            if (messageIdStr != null && !messageIdStr.isEmpty()) {
                try {
                    // Try to parse as a Long if it's a numeric string
                    messageId = Long.parseLong(messageIdStr);
                } catch (NumberFormatException e) {
                    // If it's not a valid number (e.g., client-generated ID), leave it as null
                    System.out.println("Non-numeric messageId provided: " + messageIdStr + ". Using null instead.");
                }
            }
            
            System.out.println("Received file upload request: " + file.getOriginalFilename() + 
                    " for chatId: " + chatIdStr + " (parsed as " + chatId + "), messageId: " + messageId +
                    ", username: " + username);
            
            ChatFiles uploadedFile = chatFileService.uploadFile(file, chatId, messageId, username);
            Map<String, Object> fileDetails = formatFileDetails(uploadedFile);
            
            System.out.println("Returning file details: " + fileDetails);
            return ResponseEntity.ok(fileDetails);
        } catch (IOException e) {
            System.err.println("Error uploading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<ChatFiles>> getFilesForChat(@PathVariable Long chatId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if this chat belongs to the authenticated user
            Chat chat = chatService.getChatById(chatId);
            if (chat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            
            if (!chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
            
            List<ChatFiles> files = chatFileService.getFilesByChatId(chatId);
            if (files.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(files);
            }
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<ChatFiles> getFileById(@PathVariable Long fileId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ChatFiles file = chatFileService.getFileById(fileId);
            
            // Check if this file belongs to a chat owned by the authenticated user
            Chat chat = chatService.getChatById(file.getChatId());
            if (chat != null && !chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
            
            return ResponseEntity.ok(file);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ChatFiles file = chatFileService.getFileById(fileId);
            
            // Check if this file belongs to a chat owned by the authenticated user
            Chat chat = chatService.getChatById(file.getChatId());
            if (chat != null && !chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
            
            byte[] fileContent = chatFileService.getFileContent(fileId);
            
            ByteArrayResource resource = new ByteArrayResource(fileContent);
            
            // Set the appropriate content type if available or default to octet-stream
            MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
            if (file.getContentType() != null && !file.getContentType().isEmpty()) {
                try {
                    contentType = MediaType.parseMediaType(file.getContentType());
                } catch (Exception e) {
                    // If parsing fails, fall back to octet-stream
                }
            }
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                    .contentLength(fileContent.length)
                    .contentType(contentType)
                    .body(resource);
        } catch (IOException e) {
            System.err.println("Error downloading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (Exception e) {
            System.err.println("File not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<String> deleteFile(@PathVariable Long fileId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ChatFiles file = chatFileService.getFileById(fileId);
            
            // Check if this file belongs to a chat owned by the authenticated user
            Chat chat = chatService.getChatById(file.getChatId());
            if (chat != null && !chat.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized access to file");
            }
            
            chatFileService.deleteFile(fileId);
            return ResponseEntity.ok("File deleted successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("File not found: " + e.getMessage());
        }
    }
    
    @GetMapping("/system-check")
    public ResponseEntity<?> checkSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        
        // Check upload directory
        Path uploadPath = Paths.get(chatFileService.getUploadDir());
        boolean uploadDirExists = Files.exists(uploadPath);
        boolean uploadDirWritable = Files.isWritable(uploadPath);
        
        status.put("uploadDirectory", Map.of(
            "path", uploadPath.toAbsolutePath().toString(),
            "exists", uploadDirExists,
            "writable", uploadDirWritable
        ));
        
        // Check database connectivity
        boolean dbConnected = false;
        String dbError = null;
        long fileCount = 0;
        
        try {
            // Test if we can count files
            fileCount = chatFileService.countAllFiles();
            dbConnected = true;
        } catch (Exception e) {
            dbError = e.getMessage();
        }
        
        status.put("database", Map.of(
            "connected", dbConnected,
            "fileCount", fileCount,
            "error", dbError != null ? dbError : "None"
        ));
        
        return ResponseEntity.ok(status);
    }
    
    @GetMapping("/message/{messageId}")
    public ResponseEntity<List<Map<String, Object>>> getFilesForMessage(@PathVariable Long messageId, Authentication authentication) {
        try {
            // Get authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<ChatFiles> files = chatFileService.getFilesByMessageId(messageId);
            
            if (files.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            // Check if these files belong to chats owned by the authenticated user
            for (ChatFiles file : files) {
                Chat chat = chatService.getChatById(file.getChatId());
                if (chat == null || !chat.getUserId().equals(user.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
                }
            }
            
            List<Map<String, Object>> fileDetails = files.stream()
                    .map(this::formatFileDetails)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(fileDetails);
        } catch (Exception e) {
            System.err.println("Error getting files for message " + messageId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    // Helper method to format file details with proper metadata
    private Map<String, Object> formatFileDetails(ChatFiles file) {
        Map<String, Object> fileDetails = new HashMap<>();
        Long fileId = file.getFileId();
        System.out.println("Formatting file details. File ID: " + fileId + " (Type: " + fileId.getClass().getName() + ")");
        
        fileDetails.put("fileId", fileId);
        fileDetails.put("fileName", file.getFileName());
        fileDetails.put("cloudId", file.getCloudId());
        fileDetails.put("userId", file.getUserId());
        fileDetails.put("contentType", file.getContentType());
        fileDetails.put("size", formatFileSize(file.getFileSize()));
        fileDetails.put("uploadDate", file.getUploadDate());
        fileDetails.put("chatId", file.getChatId());
        fileDetails.put("messageId", file.getMessageId());
        fileDetails.put("fileType", getFileType(file.getContentType()));
        
        System.out.println("File details map: " + fileDetails); 
        return fileDetails;
    }
    
    // Format file size to human-readable form
    private String formatFileSize(Long size) {
        if (size == null) {
            return "Unknown";
        }
        
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.1f KB", size / 1024.0);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.1f MB", size / (1024.0 * 1024.0));
        } else {
            return String.format("%.1f GB", size / (1024.0 * 1024.0 * 1024.0));
        }
    }
    
    // Determine file type from content type
    private String getFileType(String contentType) {
        if (contentType == null) {
            return "document";
        }
        
        if (contentType.startsWith("image/")) {
            return "image";
        } else if (contentType.startsWith("video/")) {
            return "video";
        } else if (contentType.startsWith("audio/")) {
            return "audio";
        } else if (contentType.equals("application/pdf")) {
            return "pdf";
        } else if (contentType.contains("spreadsheet") || 
                   contentType.contains("excel") || 
                   contentType.equals("application/vnd.ms-excel")) {
            return "spreadsheet";
        } else if (contentType.contains("presentation") || 
                   contentType.contains("powerpoint") || 
                   contentType.equals("application/vnd.ms-powerpoint")) {
            return "presentation";
        } else if (contentType.contains("document") || 
                   contentType.contains("word") || 
                   contentType.equals("application/msword")) {
            return "document";
        } else {
            return "document"; // Default type
        }
    }
}
