package com.omer.ostim.ai.service;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

// import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
// import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

@Service
public class FileProcessingService {

    private static final Logger log = LoggerFactory.getLogger(FileProcessingService.class);
    private final Tika tika;
    
    // Supported file types for text extraction
    private static final List<String> SUPPORTED_TEXT_TYPES = Arrays.asList(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/msword", // .doc
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.ms-excel", // .xls
        "text/plain",
        "text/html",
        "text/xml",
        "application/xml",
        "application/json",
        "text/csv",
        "text/markdown",
        "application/rtf"
    );
    
    public FileProcessingService() {
        this.tika = new Tika();
    }
    
    /**
     * Extract text content from a MultipartFile
     * @param file The uploaded file
     * @return Extracted text content
     * @throws IOException If there's an error reading the file
     * @throws TikaException If there's an error parsing the file
     */
    public String extractTextFromFile(MultipartFile file) throws IOException, TikaException {
        log.info("Starting text extraction for file: {} ({})", file.getOriginalFilename(), file.getContentType());
        
        try (InputStream inputStream = file.getInputStream()) {
            String extractedText = extractTextFromInputStream(inputStream, file.getContentType());
            log.info("Successfully extracted {} characters from file: {}", 
                extractedText.length(), file.getOriginalFilename());
            return extractedText;
        }
    }
    
    /**
     * Extract text content from a file stored on disk
     * @param filePath Path to the file
     * @return Extracted text content
     * @throws IOException If there's an error reading the file
     * @throws TikaException If there's an error parsing the file
     */
    public String extractTextFromFile(Path filePath) throws IOException, TikaException {
        log.info("Starting text extraction for file path: {}", filePath);
        
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + filePath);
        }
        
        String contentType = tika.detect(filePath);
        log.debug("Detected content type: {} for file: {}", contentType, filePath);
        
        try (InputStream inputStream = Files.newInputStream(filePath)) {
            String extractedText = extractTextFromInputStream(inputStream, contentType);
            log.info("Successfully extracted {} characters from file: {}", 
                extractedText.length(), filePath.getFileName());
            return extractedText;
        }
    }
    
    /**
     * Extract text content from an InputStream
     * @param inputStream The input stream containing the file data
     * @param contentType The MIME type of the file
     * @return Extracted text content
     * @throws IOException If there's an error reading the stream
     * @throws TikaException If there's an error parsing the content
     */
    private String extractTextFromInputStream(InputStream inputStream, String contentType) 
            throws IOException, TikaException {
        
        if (!isTextExtractionSupported(contentType)) {
            throw new TikaException("Text extraction not supported for content type: " + contentType);
        }
        
        try {
            // Use Tika's AutoDetectParser for automatic format detection and parsing
            AutoDetectParser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(-1); // No character limit
            Metadata metadata = new Metadata();
            ParseContext context = new ParseContext();
            
            parser.parse(inputStream, handler, metadata, context);
            
            String extractedText = handler.toString().trim();
            
            // Log metadata for debugging
            log.debug("Extracted metadata - Title: {}, Author: {}, Content-Type: {}", 
                metadata.get("title"), metadata.get("creator"), metadata.get("Content-Type"));
            
            if (extractedText.isEmpty()) {
                log.warn("No text content extracted from file with content type: {}", contentType);
                return "No readable text content found in this file.";
            }
            
            return extractedText;
            
        } catch (SAXException e) {
            log.error("SAX parsing error during text extraction", e);
            throw new TikaException("Error parsing document: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error during text extraction", e);
            throw new TikaException("Unexpected error during text extraction: " + e.getMessage(), e);
        }
    }
    
    /**
     * Check if text extraction is supported for the given content type
     * @param contentType The MIME type to check
     * @return true if text extraction is supported, false otherwise
     */
    public boolean isTextExtractionSupported(String contentType) {
        if (contentType == null) {
            return false;
        }
        
        // Check for exact matches
        if (SUPPORTED_TEXT_TYPES.contains(contentType.toLowerCase())) {
            return true;
        }
        
        // Check for partial matches (e.g., text/* types)
        String lowerContentType = contentType.toLowerCase();
        return lowerContentType.startsWith("text/") || 
               lowerContentType.contains("javascript") || 
               lowerContentType.contains("css") ||
               lowerContentType.contains("html") ||
               lowerContentType.contains("xml") ||
               lowerContentType.contains("json");
    }
    
    /**
     * Get a summary of the extracted text (useful for large documents)
     * @param fullText The complete extracted text
     * @param maxLength Maximum length of the summary
     * @return Summarized text
     */
    public String getSummary(String fullText, int maxLength) {
        if (fullText == null || fullText.length() <= maxLength) {
            return fullText;
        }
        
        String truncated = fullText.substring(0, maxLength);
        int lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > maxLength * 0.8) { // If last space is reasonably close to the end
            truncated = truncated.substring(0, lastSpace);
        }
        
        return truncated + "...";
    }
    
    /**
     * Clean and prepare text for AI processing
     * @param rawText The raw extracted text
     * @return Cleaned text suitable for AI processing
     */
    public String cleanTextForAI(String rawText) {
        if (rawText == null) {
            return "";
        }
        
        // Remove excessive whitespace and normalize line breaks
        String cleaned = rawText.replaceAll("\\s+", " ")  // Replace multiple spaces with single space
                               .replaceAll("\\n{3,}", "\n\n")  // Replace multiple newlines with double newline
                               .trim();
        
        return cleaned;
    }
    
    /**
     * Get file information and text preview
     * @param file The uploaded file
     * @return FileAnalysisResult containing file info and text preview
     */
    public FileAnalysisResult analyzeFile(MultipartFile file) {
        FileAnalysisResult result = new FileAnalysisResult();
        result.setFileName(file.getOriginalFilename());
        result.setFileSize(file.getSize());
        result.setContentType(file.getContentType());
        result.setTextExtractionSupported(isTextExtractionSupported(file.getContentType()));
        
        if (result.isTextExtractionSupported()) {
            try {
                String fullText = extractTextFromFile(file);
                result.setFullText(fullText);
                result.setTextPreview(getSummary(fullText, 500)); // 500 char preview
                result.setWordCount(countWords(fullText));
                result.setExtractionSuccessful(true);
            } catch (Exception e) {
                log.error("Error extracting text from file: {}", file.getOriginalFilename(), e);
                result.setExtractionSuccessful(false);
                result.setErrorMessage(e.getMessage());
            }
        }
        
        return result;
    }
    
    /**
     * Count words in text
     * @param text The text to count words in
     * @return Number of words
     */
    private int countWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }
    
    /**
     * Data class to hold file analysis results
     */
    public static class FileAnalysisResult {
        private String fileName;
        private long fileSize;
        private String contentType;
        private boolean textExtractionSupported;
        private boolean extractionSuccessful;
        private String fullText;
        private String textPreview;
        private int wordCount;
        private String errorMessage;
        
        // Getters and setters
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
        
        public boolean isTextExtractionSupported() { return textExtractionSupported; }
        public void setTextExtractionSupported(boolean textExtractionSupported) { 
            this.textExtractionSupported = textExtractionSupported; 
        }
        
        public boolean isExtractionSuccessful() { return extractionSuccessful; }
        public void setExtractionSuccessful(boolean extractionSuccessful) { 
            this.extractionSuccessful = extractionSuccessful; 
        }
        
        public String getFullText() { return fullText; }
        public void setFullText(String fullText) { this.fullText = fullText; }
        
        public String getTextPreview() { return textPreview; }
        public void setTextPreview(String textPreview) { this.textPreview = textPreview; }
        
        public int getWordCount() { return wordCount; }
        public void setWordCount(int wordCount) { this.wordCount = wordCount; }
        
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
} 