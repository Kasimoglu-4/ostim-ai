package com.omer.ostim.ai.service;

import com.omer.ostim.ai.model.ChatFiles;
import com.omer.ostim.ai.model.User;
import com.omer.ostim.ai.repository.ChatFilesRepository;
import com.omer.ostim.ai.repository.UserRepository;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChatFileService {

    private final ChatFilesRepository chatFilesRepository;
    private final UserRepository userRepository;
    private final FileProcessingService fileProcessingService;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Autowired
    public ChatFileService(ChatFilesRepository chatFileRepository, 
                          UserRepository userRepository,
                          FileProcessingService fileProcessingService) {
        this.chatFilesRepository = chatFileRepository;
        this.userRepository = userRepository;
        this.fileProcessingService = fileProcessingService;
    }

    public ChatFiles uploadFile(MultipartFile file, Long chatId, Long messageId, String username) throws IOException {
        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Get userId from username
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Generate a unique file name to prevent collisions
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueId = UUID.randomUUID().toString();
        String storedFilename = uniqueId + fileExtension;
        
        // Save the file to the filesystem
        Path filePath = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Extract text content if supported
        String extractedText = null;
        boolean textExtractionSuccessful = false;
        
        if (fileProcessingService.isTextExtractionSupported(file.getContentType())) {
            try {
                extractedText = fileProcessingService.extractTextFromFile(file);
                extractedText = fileProcessingService.cleanTextForAI(extractedText);
                textExtractionSuccessful = true;
                System.out.println("Successfully extracted text from file: " + originalFilename + " (" + extractedText.length() + " characters)");
            } catch (TikaException | IOException e) {
                System.err.println("Failed to extract text from file: " + originalFilename + " - " + e.getMessage());
                extractedText = "Text extraction failed: " + e.getMessage();
            }
        } else {
            System.out.println("Text extraction not supported for file type: " + file.getContentType());
            extractedText = "Text extraction not supported for this file type.";
        }
        
        // Create and save file metadata in the database
        ChatFiles chatFile = new ChatFiles();
        chatFile.setFileName(originalFilename);
        chatFile.setCloudId(storedFilename);
        chatFile.setChatId(chatId);
        
        // Only set messageId if it's not null
        if (messageId != null) {
            chatFile.setMessageId(messageId);
        }
        
        chatFile.setUserId(user.getId());
        chatFile.setContentType(file.getContentType());
        chatFile.setFileSize(file.getSize());
        
        // Set the extracted text
        chatFile.setExtractedText(extractedText);
        chatFile.setTextExtractionSuccessful(textExtractionSuccessful);
        
        try {
            System.out.println("Attempting to save file to database with name: " + originalFilename);
            ChatFiles savedFile = chatFilesRepository.save(chatFile);
            System.out.println("Successfully saved file to database with ID: " + savedFile.getFileId());
            
            // Verify the file was saved by retrieving it from the database
            Optional<ChatFiles> retrievedFile = chatFilesRepository.findById(savedFile.getFileId());
            if (retrievedFile.isPresent()) {
                System.out.println("Successfully verified file in database with ID: " + retrievedFile.get().getFileId());
                return savedFile;
            } else {
                System.err.println("WARNING: File was supposedly saved but cannot be retrieved from database by ID: " + savedFile.getFileId());
                throw new RuntimeException("File was saved but could not be verified in the database");
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to save file metadata to database: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save file metadata to database: " + e.getMessage(), e);
        }
    }

    public List<ChatFiles> getFilesByChatId(Long chatId) {
        return chatFilesRepository.findByChatId(chatId);
    }

    public List<ChatFiles> getFilesByMessageId(Long messageId) {
        return chatFilesRepository.findByMessageId(messageId);
    }

    public ChatFiles getFileById(Long fileId) {
        try {
            if (fileId == null) {
                throw new IllegalArgumentException("fileId cannot be null");
            }
            System.out.println("Looking up file with ID: " + fileId);
            Optional<ChatFiles> chatFile = chatFilesRepository.findById(fileId);
            return chatFile.orElseThrow(() -> {
                System.err.println("File not found for ID: " + fileId);
                return new RuntimeException("File not found with ID: " + fileId);
            });
        } catch (Exception e) {
            System.err.println("Error in getFileById: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public byte[] getFileContent(Long fileId) throws IOException {
        ChatFiles file = getFileById(fileId);
        Path filePath = Paths.get(uploadDir).resolve(file.getCloudId());
        
        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found: " + file.getFileName());
        }
        
        return Files.readAllBytes(filePath);
    }
    
    /**
     * Gets the content of a text file as a string.
     * This is useful for processing text files in AI models.
     * 
     * @param fileId the ID of the file to read
     * @return the content of the file as a string
     * @throws IOException if there's an error reading the file
     */
    public String getTextFileContent(Long fileId) throws IOException {
        try {
            if (fileId == null) {
                throw new IllegalArgumentException("fileId cannot be null");
            }
            
            System.out.println("Attempting to get text file content for fileId: " + fileId);
            
            ChatFiles file = chatFilesRepository.findById(fileId)
                .orElseThrow(() -> {
                    System.err.println("File not found for ID: " + fileId);
                    return new RuntimeException("File not found for ID: " + fileId);
                });
            
            Path filePath = Paths.get(uploadDir).resolve(file.getCloudId());
            
            if (!Files.exists(filePath)) {
                System.err.println("File path does not exist: " + filePath);
                throw new RuntimeException("File not found: " + file.getFileName());
            }
            
            // Check if this is a text file
            String contentType = file.getContentType();
            if (contentType != null && (
                    contentType.startsWith("text/") || 
                    contentType.equals("application/json") || 
                    contentType.equals("application/xml") ||
                    contentType.contains("javascript") || 
                    contentType.contains("css") ||
                    contentType.contains("html") ||
                    contentType.equals("application/x-sh"))) {
                
                byte[] fileBytes = Files.readAllBytes(filePath);
                System.out.println("Successfully read text file, size: " + fileBytes.length + " bytes");
                return new String(fileBytes);
            } else {
                System.err.println("File is not a text file: " + file.getFileName() + ", content type: " + contentType);
                throw new RuntimeException("File is not a text file: " + file.getFileName());
            }
        } catch (Exception e) {
            System.err.println("Error in getTextFileContent: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Error reading file content: " + e.getMessage(), e);
        }
    }

    public void updateFileMessageId(Long fileId, Long messageId) {
        ChatFiles file = getFileById(fileId);
        file.setMessageId(messageId);
        chatFilesRepository.save(file);
        System.out.println("Updated file " + fileId + " with messageId: " + messageId);
    }

    public void updateFilesMessageIdByChatId(Long chatId, Long messageId) {
        // Find files in this chat that don't have a messageId set
        List<ChatFiles> filesWithoutMessageId = chatFilesRepository.findByChatIdAndMessageIdIsNull(chatId);
        for (ChatFiles file : filesWithoutMessageId) {
            file.setMessageId(messageId);
            chatFilesRepository.save(file);
            System.out.println("Updated file " + file.getFileId() + " with messageId: " + messageId);
        }
    }

    public void deleteFile(Long fileId) throws IOException {
        ChatFiles file = getFileById(fileId);
        
        // Delete from filesystem
        Path filePath = Paths.get(uploadDir).resolve(file.getCloudId());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
        
        // Delete from database
        chatFilesRepository.deleteById(fileId);
    }
    
    public List<ChatFiles> getAllFilesByUserId(Long userId) {
        return chatFilesRepository.findByUserId(userId);
    }
    
    /**
     * Count all files in the database
     * @return The total number of files
     */
    public long countAllFiles() {
        return chatFilesRepository.count();
    }
    
    /**
     * Returns the configured upload directory path
     * @return The path to the upload directory
     */
    public String getUploadDir() {
        return this.uploadDir;
    }

    /**
     * Get extracted text content from a file
     * @param fileId The file ID
     * @return The extracted text content
     */
    public String getExtractedText(Long fileId) {
        ChatFiles file = getFileById(fileId);
        return file.getExtractedText();
    }
    
    /**
     * Re-extract text from a file (useful if extraction failed previously)
     * @param fileId The file ID
     * @return Updated ChatFiles with new extracted text
     */
    public ChatFiles reExtractText(Long fileId) throws IOException {
        ChatFiles file = getFileById(fileId);
        Path filePath = Paths.get(uploadDir).resolve(file.getCloudId());
        
        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found: " + file.getFileName());
        }
        
        String extractedText = null;
        boolean textExtractionSuccessful = false;
        
        if (fileProcessingService.isTextExtractionSupported(file.getContentType())) {
            try {
                extractedText = fileProcessingService.extractTextFromFile(filePath);
                extractedText = fileProcessingService.cleanTextForAI(extractedText);
                textExtractionSuccessful = true;
            } catch (TikaException | IOException e) {
                System.err.println("Failed to re-extract text from file: " + file.getFileName() + " - " + e.getMessage());
                extractedText = "Text extraction failed: " + e.getMessage();
            }
        } else {
            extractedText = "Text extraction not supported for this file type.";
        }
        
        file.setExtractedText(extractedText);
        file.setTextExtractionSuccessful(textExtractionSuccessful);
        
        return chatFilesRepository.save(file);
    }
}
