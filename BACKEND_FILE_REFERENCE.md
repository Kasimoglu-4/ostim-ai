# Backend File Functionality Reference

A comprehensive reference documenting the specific functionality of every file in the Ostim.AI backend.

## 📁 File Organization Overview

```
Total Files: 52 Java Files + Configuration + Resources
├── Application Files: 1
├── Configuration Files: 4  
├── Controller Files: 7
├── DTO Files: 8
├── Exception Files: 2
├── Model Files: 6
├── Repository Files: 7
├── Security Files: 2
├── Service Files: 12
├── Utility Files: 1
└── Test Files: 2
```

---

## 🚀 Main Application File

### `Application.java`
**Location**: `src/main/java/com/omer/ostim/ai/Application.java`  
**Type**: Main Spring Boot Application Class  
**Functionality**:
- **Primary Purpose**: Main entry point for the Spring Boot application
- **Key Features**:
  - `@SpringBootApplication` annotation for auto-configuration
  - `@EnableScheduling` for background task execution
  - `main()` method to start the application
  - Automatically initializes all Spring components and configurations

---

## ⚙️ Configuration Files (4 files)

### `OllamaConfig.java`
**Location**: `src/main/java/com/omer/ostim/ai/config/OllamaConfig.java`  
**Type**: AI Integration Configuration  
**Functionality**:
- **Primary Purpose**: Configures Ollama AI server connections and initialization
- **Key Features**:
  - `CommandLineRunner` for automatic default server setup
  - Parses Ollama base URL from configuration
  - Creates default ChatServer entity if none exists
  - Extracts host and port from URL automatically
  - Generates UUID tokens for server authentication
  - Logs server initialization status

### `SecurityConfig.java`
**Location**: `src/main/java/com/omer/ostim/ai/config/SecurityConfig.java`  
**Type**: Security and Authentication Configuration  
**Functionality**:
- **Primary Purpose**: Configures JWT authentication and security policies
- **Key Features**:
  - JWT authentication filter integration
  - CORS configuration for cross-origin requests
  - Security filter chain configuration
  - Stateless session management
  - Public endpoint definitions (`/api/auth/**`, static resources)
  - BCrypt password encoder configuration
  - H2 console access configuration

### `RestTemplateConfig.java`
**Location**: `src/main/java/com/omer/ostim/ai/config/RestTemplateConfig.java`  
**Type**: HTTP Client Configuration  
**Functionality**:
- **Primary Purpose**: Configures HTTP client for external API calls
- **Key Features**:
  - `RestTemplate` bean configuration
  - HTTP connection timeout settings
  - Request timeout configuration
  - Connection pooling settings
  - Error handling configuration

### `WebConfig.java`
**Location**: `src/main/java/com/omer/ostim/ai/config/WebConfig.java`  
**Type**: Web Layer Configuration  
**Functionality**:
- **Primary Purpose**: Configures web-related settings
- **Key Features**:
  - Static resource handling
  - View resolver configuration
  - Web MVC settings
  - Content negotiation setup

---

## 🎮 Controller Files (7 files)

### `AuthController.java`
**Location**: `src/main/java/com/omer/ostim/ai/controller/AuthController.java`  
**Type**: Authentication REST Controller  
**Functionality**:
- **Primary Purpose**: Handles user authentication and account management
- **API Endpoints** (5 endpoints):
  - `POST /api/auth/login` - User login with JWT token generation
  - `POST /api/auth/signup` - User registration with validation
  - `POST /api/auth/change-password` - Password change for authenticated users
  - `DELETE /api/auth/delete-account` - Account deletion
  - `GET /api/auth/validate-token` - JWT token validation
- **Key Features**:
  - JWT token generation and validation
  - Password encryption with BCrypt
  - Input validation with error handling
  - User authentication and authorization

### `ChatController.java`
**Location**: `src/main/java/com/omer/ostim/ai/controller/ChatController.java`  
**Type**: Chat Management REST Controller  
**Functionality**:
- **Primary Purpose**: Manages chat sessions and AI response generation
- **API Endpoints** (8 endpoints):
  - `POST /api/chat/` - Create new chat session
  - `GET /api/chat/` - Get all user chats
  - `GET /api/chat/{chatId}` - Get specific chat by ID
  - `DELETE /api/chat/{chatId}` - Delete specific chat
  - `DELETE /api/chat/all` - Delete all user chats
  - `PUT /api/chat/{chatId}/title` - Update chat title
  - `POST /api/chat/generate` - Generate AI response with file support
  - `GET /api/chat/generate` - Generate AI response (GET method)
- **Key Features**:
  - Chat CRUD operations with user isolation
  - AI response generation with file integration
  - Model selection and configuration
  - Error handling and validation

### `ChatFileController.java`
**Location**: `src/main/java/com/omer/ostim/ai/controller/ChatFileController.java`  
**Type**: File Management REST Controller  
**Functionality**:
- **Primary Purpose**: Handles file uploads, downloads, and management
- **API Endpoints** (7 endpoints):
  - `POST /api/files/upload` - Upload files with text extraction
  - `GET /api/files/chat/{chatId}` - Get files for specific chat
  - `GET /api/files/{fileId}` - Get file details by ID
  - `DELETE /api/files/{fileId}` - Delete file by ID
  - `GET /api/files/download/{fileId}` - Download file content
  - `GET /api/files/system-check` - File system health check
  - `GET /api/files/message/{messageId}` - Get files linked to message
- **Key Features**:
  - Multipart file upload handling
  - Automatic text extraction with Tika
  - File storage and retrieval
  - Message linking capabilities
  - System health monitoring

### `ChatMessagesController.java`
**Location**: `src/main/java/com/omer/ostim/ai/controller/ChatMessagesController.java`  
**Type**: Message Management REST Controller  
**Functionality**:
- **Primary Purpose**: Manages chat messages with think tag processing
- **API Endpoints** (4 endpoints):
  - `POST /api/message/` - Send new message with file linking
  - `GET /api/message/chat/{chatId}` - Get all messages for chat
  - `GET /api/message/{messageId}` - Get specific message by ID
  - `DELETE /api/message/{messageId}` - Delete specific message
- **Key Features**:
  - Message CRUD operations
  - Think tag filtering for bot responses
  - File linking to messages
  - User authorization and validation

### `ChatServerController.java`
**Location**: `src/main/java/com/omer/ostim/ai/controller/ChatServerController.java`  
**Type**: Server Management REST Controller  
**Functionality**:
- **Primary Purpose**: Manages Ollama server configurations and monitoring
- **API Endpoints** (10 endpoints):
  - `POST /api/server/` - Create new server configuration
  - `GET /api/server/` - Get all configured servers
  - `GET /api/server/{serverId}` - Get server by ID
  - `DELETE /api/server/{serverId}` - Delete server configuration
  - `PUT /api/server/{serverId}/status` - Update server status
  - `PUT /api/server/{serverId}/token` - Update server token
  - `POST /api/server/{serverId}/token/regenerate` - Regenerate token
  - `GET /api/server/{serverId}/status/check` - Check specific server status
  - `GET /api/server/default/status/check` - Check default server
  - `POST /api/server/status/check-all` - Check all servers
- **Key Features**:
  - Server configuration management
  - Health monitoring and status checking
  - Token management and regeneration
  - Real-time server connectivity testing

### `ChatVoteController.java`
**Location**: `src/main/java/com/omer/ostim/ai/controller/ChatVoteController.java`  
**Type**: Voting System REST Controller  
**Functionality**:
- **Primary Purpose**: Handles user votes on AI responses with auto-correction
- **API Endpoints** (4 endpoints):
  - `POST /api/vote/` - Submit vote with intelligent message ID correction
  - `GET /api/vote/chat/{chatId}` - Get votes for specific chat
  - `GET /api/vote/{voteId}` - Get specific vote by ID
  - `DELETE /api/vote/{voteId}` - Delete vote by ID
- **Key Features**:
  - Intelligent vote auto-correction logic
  - Message ID validation and correction
  - Automatic fallback to last bot message
  - Detailed error handling and logging

### `FileAIController.java`
**Location**: `src/main/java/com/omer/ostim/ai/controller/FileAIController.java`  
**Type**: AI File Processing REST Controller  
**Functionality**:
- **Primary Purpose**: Advanced AI-powered file analysis and processing
- **API Endpoints** (8 endpoints):
  - `POST /api/files/ai/analyze` - Analyze uploaded file without saving
  - `POST /api/files/ai/question/{fileId}` - Ask questions about file
  - `POST /api/files/ai/summarize/{fileId}` - Summarize file content
  - `POST /api/files/ai/detailed-analysis/{fileId}` - Detailed file analysis
  - `POST /api/files/ai/question-with-context/{fileId}` - Contextual questions
  - `GET /api/files/ai/text/{fileId}` - Get extracted text
  - `POST /api/files/ai/re-extract/{fileId}` - Re-extract text from file
  - `GET /api/files/ai/debug/{fileId}` - Debug file processing
- **Key Features**:
  - AI-powered file analysis without storage
  - Context-aware question answering
  - Content summarization and analysis
  - Debug and troubleshooting capabilities

---

## 📄 DTO Files (8 files)

### `ChangePasswordRequest.java`
**Location**: `src/main/java/com/omer/ostim/ai/dto/ChangePasswordRequest.java`  
**Type**: Data Transfer Object  
**Functionality**:
- **Primary Purpose**: Encapsulates password change request data
- **Fields**: `oldPassword`, `newPassword`
- **Validation**: Password strength and format validation

### `ChatRequest.java`
**Location**: `src/main/java/com/omer/ostim/ai/dto/ChatRequest.java`  
**Type**: Data Transfer Object  
**Functionality**:
- **Primary Purpose**: Encapsulates chat creation request data
- **Fields**: `title`, `userId`, `lmmType`
- **Validation**: Title length and user ID validation

### `GenerateRequest.java`
**Location**: `src/main/java/com/omer/ostim/ai/dto/GenerateRequest.java`  
**Type**: Data Transfer Object  
**Functionality**:
- **Primary Purpose**: Encapsulates AI generation request data
- **Fields**: `prompt`, `model`, `chatId`, `fileId`
- **Features**: Supports file integration and model selection

### `LoginRequest.java`
**Location**: `src/main/java/com/omer/ostim/ai/dto/LoginRequest.java`  
**Type**: Data Transfer Object  
**Functionality**:
- **Primary Purpose**: Encapsulates user login credentials
- **Fields**: `username`, `password`
- **Validation**: Credential format validation

### `LoginResponse.java`
**Location**: `src/main/java/com/omer/ostim/ai/dto/LoginResponse.java`  
**Type**: Data Transfer Object  
**Functionality**:
- **Primary Purpose**: Encapsulates login response data
- **Fields**: `token`, `userId`, `username`, `email`
- **Features**: JWT token and user information packaging

### `OllamaRequest.java`
**Location**: `src/main/java/com/omer/ostim/ai/dto/OllamaRequest.java`  
**Type**: Data Transfer Object  
**Functionality**:
- **Primary Purpose**: Encapsulates Ollama API request data
- **Fields**: `model`, `prompt`, `stream`, `options`
- **Features**: Direct Ollama API integration format

### `OllamaResponse.java`
**Location**: `src/main/java/com/omer/ostim/ai/dto/OllamaResponse.java`  
**Type**: Data Transfer Object  
**Functionality**:
- **Primary Purpose**: Encapsulates Ollama API response data
- **Fields**: `response`, `done`, `context`, `model`
- **Features**: Handles streaming and completion status

### `SignupRequest.java`
**Location**: `src/main/java/com/omer/ostim/ai/dto/SignupRequest.java`  
**Type**: Data Transfer Object  
**Functionality**:
- **Primary Purpose**: Encapsulates user registration data
- **Fields**: `username`, `email`, `password`
- **Validation**: Email format, username uniqueness, password strength

---

## 🚨 Exception Files (2 files)

### `GlobalExceptionHandler.java`
**Location**: `src/main/java/com/omer/ostim/ai/exception/GlobalExceptionHandler.java`  
**Type**: Global Exception Handler  
**Functionality**:
- **Primary Purpose**: Centralized exception handling for the entire application
- **Exception Types Handled**:
  - General exceptions with detailed error responses
  - Validation exceptions with field-specific errors
  - Authentication and authorization exceptions
  - File processing exceptions
  - Database exceptions
- **Features**:
  - Structured error response format
  - Detailed error logging
  - HTTP status code mapping
  - User-friendly error messages

### `MessageNotFoundException.java`
**Location**: `src/main/java/com/omer/ostim/ai/exception/MessageNotFoundException.java`  
**Type**: Custom Exception Class  
**Functionality**:
- **Primary Purpose**: Specialized exception for message-related errors
- **Use Cases**:
  - Message not found by ID
  - Invalid message references
  - Message access authorization failures
- **Features**:
  - Custom error message support
  - Cause chaining for debugging
  - Integration with global exception handler

---

## 🗄️ Model Files (6 files)

### `Chat.java`
**Location**: `src/main/java/com/omer/ostim/ai/model/Chat.java`  
**Type**: JPA Entity  
**Functionality**:
- **Primary Purpose**: Represents chat session entity in database
- **Database Table**: `chat_chat`
- **Fields**:
  - `chatId` (Primary Key, Auto-generated)
  - `title` (Not null, 1-255 chars, validated)
  - `userId` (Foreign Key, not null)
  - `createdTime` (Auto-generated timestamp)
  - `status` (Not null, 1-50 chars)
  - `lmmType` (LLM model type, 1-100 chars)
  - `shareToken` (Unique sharing token, 1-255 chars)
- **Validation**: Bean validation annotations for all fields
- **Features**: Lombok integration for getters/setters

### `ChatFiles.java`
**Location**: `src/main/java/com/omer/ostim/ai/model/ChatFiles.java`  
**Type**: JPA Entity  
**Functionality**:
- **Primary Purpose**: Represents file attachments in database
- **Database Table**: `chat_files`
- **Fields**:
  - `fileId` (Primary Key, Auto-generated)
  - `fileName` (Not null, 1-255 chars)
  - `cloudId` (UUID-based filename)
  - `userId` (Foreign Key, not null)
  - `chatId` (Foreign Key, not null)
  - `messageId` (Foreign Key, nullable for message linking)
  - `contentType` (MIME type, 1-100 chars)
  - `fileSize` (File size in bytes)
  - `uploadDate` (Auto-generated timestamp)
  - `extractedText` (LONGTEXT for content)
  - `textExtractionSuccessful` (Boolean flag, default false)
- **Features**: Message linking, text extraction tracking

### `ChatMessages.java`
**Location**: `src/main/java/com/omer/ostim/ai/model/ChatMessages.java`  
**Type**: JPA Entity  
**Functionality**:
- **Primary Purpose**: Represents individual messages in chats
- **Database Table**: `chat_messages`
- **Fields**:
  - `messageId` (Primary Key, Auto-generated)
  - `messageContent` (TEXT, message content)
  - `createdTime` (Auto-generated timestamp)
  - `userId` (Foreign Key)
  - `messageType` (bot/user type indicator)
  - `chatId` (Foreign Key to chat)
- **Features**: Think tag processing, user/bot message distinction

### `ChatServer.java`
**Location**: `src/main/java/com/omer/ostim/ai/model/ChatServer.java`  
**Type**: JPA Entity  
**Functionality**:
- **Primary Purpose**: Represents Ollama server configurations
- **Database Table**: `chat_servers`
- **Fields**:
  - `serverId` (Primary Key, Auto-generated)
  - `endpointUrl` (Server hostname/IP)
  - `endpointPort` (Server port number)
  - `status` (active/inactive status)
  - `token` (Authentication token)
- **Features**: Multi-server support, health monitoring

### `ChatVote.java`
**Location**: `src/main/java/com/omer/ostim/ai/model/ChatVote.java`  
**Type**: JPA Entity  
**Functionality**:
- **Primary Purpose**: Represents user votes on AI responses
- **Database Table**: `chat_vote`
- **Fields**:
  - `voteId` (Primary Key, Auto-generated)
  - `chatId` (Foreign Key to chat)
  - `messageId` (Foreign Key to message)
  - `voteInt` (Integer vote value)
  - `createdTime` (Auto-generated timestamp)
  - `comment` (TEXT, optional comment)
- **Features**: Vote tracking, feedback collection

### `User.java`
**Location**: `src/main/java/com/omer/ostim/ai/model/User.java`  
**Type**: JPA Entity  
**Functionality**:
- **Primary Purpose**: Represents user accounts and authentication
- **Database Table**: `users`
- **Fields**:
  - `userId` (Primary Key, Auto-generated)
  - `username` (Unique, not null)
  - `email` (Unique, not null)
  - `password` (BCrypt hashed, not null)
  - `role` (USER/ADMIN role enum)
- **Features**: Role-based access, unique constraints, password hashing

---

## 🗂️ Repository Files (7 files)

### `ChatFilesRepository.java`
**Location**: `src/main/java/com/omer/ostim/ai/repository/ChatFilesRepository.java`  
**Type**: JPA Repository Interface  
**Functionality**:
- **Primary Purpose**: Data access for ChatFiles entity
- **Custom Query Methods**:
  - `findByChatId(Long chatId)` - Get files by chat
  - `findByMessageId(Long messageId)` - Get files by message
  - `findByUserId(Long userId)` - Get files by user
  - `findByChatIdAndMessageIdIsNull(Long chatId)` - Orphaned files
- **Features**: File relationship queries, orphaned file detection

### `ChatMessagesRepository.java`
**Location**: `src/main/java/com/omer/ostim/ai/repository/ChatMessagesRepository.java`  
**Type**: JPA Repository Interface  
**Functionality**:
- **Primary Purpose**: Data access for ChatMessages entity
- **Custom Query Methods**:
  - `findByChatId(Long chatId)` - Get messages by chat
  - `findByChatIdOrderByCreatedTimeAsc(Long chatId)` - Ordered messages
  - `existsByMessageId(Long messageId)` - Message existence check
- **Features**: Ordered message retrieval, existence validation

### `ChatRepository.java`
**Location**: `src/main/java/com/omer/ostim/ai/repository/ChatRepository.java`  
**Type**: JPA Repository Interface  
**Functionality**:
- **Primary Purpose**: Data access for Chat entity
- **Custom Query Methods**:
  - `findByUserId(Long userId)` - Get user's chats
  - `findTopByOrderByChatIdDesc()` - Get latest chat
  - `findByUserIdOrderByCreatedTimeDesc(Long userId)` - Ordered user chats
- **Features**: User-specific queries, latest chat retrieval

### `ChatServerRepository.java`
**Location**: `src/main/java/com/omer/ostim/ai/repository/ChatServerRepository.java`  
**Type**: JPA Repository Interface  
**Functionality**:
- **Primary Purpose**: Data access for ChatServer entity
- **Custom Query Methods**:
  - `findByStatus(String status)` - Get servers by status
  - `findByEndpointUrlAndEndpointPort(String url, Integer port)` - Find by endpoint
- **Features**: Server filtering, endpoint-based queries

### `ChatVoteRepository.java`
**Location**: `src/main/java/com/omer/ostim/ai/repository/ChatVoteRepository.java`  
**Type**: JPA Repository Interface  
**Functionality**:
- **Primary Purpose**: Data access for ChatVote entity
- **Custom Query Methods**:
  - `findByChatId(Long chatId)` - Get votes by chat
  - `findByMessageId(Long messageId)` - Get votes by message
  - `existsByChatIdAndMessageId(Long chatId, Long messageId)` - Vote existence
- **Features**: Vote filtering, existence checking

### `JpaRepository.java`
**Location**: `src/main/java/com/omer/ostim/ai/repository/JpaRepository.java`  
**Type**: Custom Repository Interface  
**Functionality**:
- **Primary Purpose**: Custom JPA repository interface definition
- **Features**:
  - Generic type parameters `<T1, T2>`
  - Extension point for custom repository methods
  - Framework for advanced repository operations

### `UserRepository.java`
**Location**: `src/main/java/com/omer/ostim/ai/repository/UserRepository.java`  
**Type**: JPA Repository Interface  
**Functionality**:
- **Primary Purpose**: Data access for User entity
- **Custom Query Methods**:
  - `findByUsername(String username)` - Find user by username
  - `findByEmail(String email)` - Find user by email
  - `existsByUsername(String username)` - Username existence check
  - `existsByEmail(String email)` - Email existence check
- **Features**: Authentication support, uniqueness validation

---

## 🔐 Security Files (2 files)

### `JwtAuthenticationFilter.java`
**Location**: `src/main/java/com/omer/ostim/ai/security/JwtAuthenticationFilter.java`  
**Type**: Security Filter  
**Functionality**:
- **Primary Purpose**: JWT token-based request authentication
- **Key Features**:
  - JWT token extraction from Authorization header
  - Token validation and user authentication
  - Security context population
  - Request filtering for protected endpoints
  - Error handling for invalid tokens
- **Integration**: Works with Spring Security filter chain

### `JwtUtils.java`
**Location**: `src/main/java/com/omer/ostim/ai/security/JwtUtils.java`  
**Type**: JWT Utility Class  
**Functionality**:
- **Primary Purpose**: JWT token generation, validation, and utility methods
- **Key Features**:
  - JWT token generation with HS512 algorithm
  - Token validation and expiration checking
  - User information extraction from tokens
  - 24-hour token expiration (configurable)
  - Secret key management
- **Security**: BCrypt integration, secure token handling

---

## 🔧 Service Files (12 files)

### `AIFileProcessingService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/AIFileProcessingService.java`  
**Type**: AI Integration Service  
**Functionality**:
- **Primary Purpose**: AI-powered file analysis and processing
- **Key Methods**:
  - `generateResponseAboutFile()` - Comprehensive file analysis with AI
  - `generateResponseAboutFileWithContext()` - Context-aware file processing
  - `summarizeFile()` - AI-powered file summarization
  - `analyzeFile()` - Detailed content and structure analysis
  - `buildPromptWithFileContent()` - Intelligent prompt construction
  - `buildSummaryPrompt()` - Specialized summarization templates
  - `buildAnalysisPrompt()` - Structured analysis prompt generation
- **Features**: Dynamic content truncation (12K-18K chars), error handling

### `AuthService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/AuthService.java`  
**Type**: Authentication Service  
**Functionality**:
- **Primary Purpose**: User authentication and account management
- **Key Methods**:
  - User login with JWT token generation
  - User registration with validation
  - Password change with security checks
  - Account deletion with cleanup
  - Default user creation on startup
- **Features**: BCrypt password hashing, role management, JWT integration

### `ChatFileService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/ChatFileService.java`  
**Type**: File Management Service  
**Functionality**:
- **Primary Purpose**: File upload, storage, and text extraction management
- **Key Methods**:
  - `uploadFile()` - File upload with automatic text extraction
  - `getExtractedText()` - Direct text content retrieval
  - `reExtractText()` - Re-process failed extractions
  - `linkFileToMessage()` - Message linking capabilities
  - `countAllFiles()` - System-wide file statistics
- **Features**: Text extraction success tracking, error storage, validation

### `ChatMessagesService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/ChatMessagesService.java`  
**Type**: Message Management Service  
**Functionality**:
- **Primary Purpose**: Chat message CRUD operations and file linking
- **Key Methods**:
  - Message creation with think tag filtering
  - Message retrieval with ordering
  - Message deletion with validation
  - File linking to messages
- **Features**: Think tag processing, user authorization, file integration

### `ChatServerService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/ChatServerService.java`  
**Type**: Server Management Service  
**Functionality**:
- **Primary Purpose**: Ollama server configuration and management
- **Key Methods**:
  - Server CRUD operations
  - Status updates and monitoring
  - Token management and regeneration
  - Health checking and validation
- **Features**: Multi-server support, automatic status tracking

### `ChatService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/ChatService.java`  
**Type**: Chat Management and AI Service  
**Functionality**:
- **Primary Purpose**: Chat session management and AI response generation
- **Key Methods**:
  - `saveChat()` - Chat creation with validation and defaults
  - `generateResponse()` - Cached AI response generation
  - `generateAdvancedResponse()` - Spring AI integration
  - `generateResponseUsingServer()` - Server-specific generation
  - `generateResponseWithFile()` - File-enhanced AI responses
  - `getLastChat()` - Most recent chat retrieval
  - `deleteAllChatsByUserId()` - User-specific bulk deletion
- **Features**: Response caching, connection management, file integration

### `ChatVoteService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/ChatVoteService.java`  
**Type**: Voting System Service  
**Functionality**:
- **Primary Purpose**: User vote management with validation
- **Key Methods**:
  - `saveVote()` - Vote submission with validation
  - `getVotesByChatId()` - Chat-specific vote retrieval
  - Vote CRUD operations with error handling
- **Features**: Input validation, error handling, data integrity

### `FileProcessingService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/FileProcessingService.java`  
**Type**: File Processing and Text Extraction Service  
**Functionality**:
- **Primary Purpose**: Text extraction and file analysis using Apache Tika
- **Key Methods**:
  - `extractTextFromFile()` - Multi-format text extraction
  - `analyzeFile()` - Complete file analysis with FileAnalysisResult
  - `cleanTextForAI()` - Specialized text cleaning for AI processing
  - `getSummary()` - Smart text summarization with word boundaries
  - `isTextExtractionSupported()` - Content type validation (15+ formats)
  - `countWords()` - Accurate word counting for statistics
- **Features**: Support for PDF, Office docs, text files, images

### `GenerateService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/GenerateService.java`  
**Type**: AI Response Generation Service  
**Functionality**:
- **Primary Purpose**: Specialized AI response generation and coordination
- **Key Methods**:
  - Response generation coordination
  - Model selection and configuration
  - Error handling and fallbacks
- **Features**: Integration with ChatService and OllamaService

### `OllamaConnectionService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/OllamaConnectionService.java`  
**Type**: Connection Management Service  
**Functionality**:
- **Primary Purpose**: Sophisticated Ollama server connection management
- **Key Methods**:
  - `getServerConnection()` - Cached connection retrieval with auto-creation
  - `getDefaultServerConnection()` - Intelligent default server selection
  - `createHeaders()` - Dynamic header generation with authentication
  - `getApiUrl()` / `getDefaultApiUrl()` - URL construction for endpoints
  - `isServerReachable()` - Health checking via `/api/tags` endpoint
  - `formatServerUrl()` - Consistent URL formatting
- **Features**: Connection pooling (`Map<Long, RestTemplate>`), health monitoring

### `OllamaService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/OllamaService.java`  
**Type**: AI Integration Service  
**Functionality**:
- **Primary Purpose**: Spring AI Ollama integration for response generation
- **Key Methods**:
  - `generateResponse()` - AI response generation with LLAMA3 model
- **Features**:
  - Spring AI `OllamaChatModel` integration
  - `OllamaOptions.builder()` for dynamic configuration
  - Error handling and logging
  - Model-specific prompt handling

### `param.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/param.java`  
**Type**: Custom Annotation Interface  
**Functionality**:
- **Primary Purpose**: Custom annotation for service parameters
- **Features**:
  - Empty annotation interface for future parameter marking
  - Framework for service method parameter validation
  - Extension point for custom parameter handling

### `ServerMonitoringService.java`
**Location**: `src/main/java/com/omer/ostim/ai/service/ServerMonitoringService.java`  
**Type**: Background Monitoring Service  
**Functionality**:
- **Primary Purpose**: Scheduled background monitoring of Ollama servers
- **Key Features**:
  - Scheduled health checks (every 2 minutes)
  - Automatic status updates
  - Server reachability testing
  - Status logging and reporting
- **Integration**: Uses `@Scheduled` annotations, works with OllamaConnectionService

---

## 🛠️ Utility Files (1 file)

### `ResponseProcessingUtil.java`
**Location**: `src/main/java/com/omer/ostim/ai/util/ResponseProcessingUtil.java`  
**Type**: Response Processing Utility  
**Functionality**:
- **Primary Purpose**: Think tag filtering and response cleaning
- **Key Methods**:
  - Think tag removal (`<think>...</think>`)
  - Response content cleaning
  - Whitespace normalization
- **Features**:
  - Case-insensitive processing
  - Multiline support
  - Selective processing for bot messages only

---

## 🧪 Test Files (2 files)

### `ApplicationTests.java` (Main)
**Location**: `src/test/java/com/omer/ostim/ai/ApplicationTests.java`  
**Type**: Integration Test  
**Functionality**:
- **Primary Purpose**: Application context loading test
- **Features**:
  - Spring Boot test integration
  - Context loading verification
  - Basic application startup testing

### `ApplicationTests.java` (Test)
**Location**: `src/test/java/com/omer/ostim/ai/ApplicationTests.java`  
**Type**: Unit Test Template  
**Functionality**:
- **Primary Purpose**: Template for unit testing
- **Features**:
  - JUnit 5 integration
  - Test framework setup
  - Basic test structure

---

## 📋 Summary Statistics

### **File Count by Type**:
- **Configuration**: 4 files (System setup and integration)
- **Controllers**: 7 files (42 REST API endpoints)
- **DTOs**: 8 files (Data transfer and validation)
- **Entities**: 6 files (Database schema and relationships)
- **Repositories**: 7 files (Data access with custom queries)
- **Services**: 12 files (Business logic and integrations)
- **Security**: 2 files (Authentication and authorization)
- **Utilities**: 1 file (Response processing)
- **Exceptions**: 2 files (Error handling)
- **Tests**: 2 files (Testing framework)

### **Key Capabilities**:
- **42 REST API Endpoints** across 7 controllers
- **Advanced AI Integration** with prompt engineering and content truncation
- **Sophisticated File Processing** with 15+ format support
- **Connection Management** with pooling and health monitoring
- **Comprehensive Security** with JWT authentication
- **Real-time Monitoring** with scheduled background tasks
- **Intelligent Error Handling** with graceful degradation
- **Performance Optimization** with caching and efficient data access

---

**Total Backend Components**: 52 Java Files + Configuration + Resources  
**Documentation Status**: ✅ **COMPLETE FILE-BY-FILE REFERENCE**  
**Last Updated**: January 2025 