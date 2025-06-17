# Frontend Services Architecture

A modular service architecture for the chat application with clean separation of concerns.

## 📁 File Structure

```
services/
├── api.js              # Core axios config + re-exports
├── index.js            # Main service export hub
├── auth.js             # Authentication service
├── ChatService.js      # Chat & message generation
├── VoteService.js      # Vote management (like/dislike)
├── MessageService.js   # Message CRUD operations
├── ModelService.js     # AI Model management
├── ServerService.js    # Server operations
├── FileService.js      # File upload/download
└── README.md          # This documentation
```

## Services Overview

### 💬 ChatService
Handles chat conversations and AI message generation.

**Functions:**
- `sendMessage(message, model, fileAttachment, signal)` - Send message to AI and get response
- `createChat(chatData)` - Create new chat conversation
- `getAllChats()` - Get all user's chats
- `getChatById(chatId)` - Get specific chat by ID
- `updateChatTitle(chatId, newTitle)` - Update chat title
- `deleteChat(chatId)` - Delete a chat
- `deleteAllChats()` - Delete all user's chats
- `getGeneratedResponses()` - Get generated responses

### 👍 VoteService  
Manages user feedback (likes/dislikes) on messages.

**Functions:**
- `createVote(chatId, voteData)` - Create like/dislike vote
- `getVotesForChat(chatId)` - Get all votes for a chat
- `getVoteById(voteId)` - Get specific vote by ID
- `deleteVote(voteId)` - Delete a vote

**Vote Structure:**
```javascript
{
  chatId: 123,
  messageId: 456,
  voteInt: 1,        // 1 for like, -1 for dislike
  comment: "",       // Empty for likes, reason for dislikes
  createdTime: "2025-05-30T11:36:25.018Z"
}
```

### 📝 MessageService
Handles individual message operations.

**Functions:**
- `createMessage(messageData)` - Create a new message
- `getMessagesForChat(chatId)` - Get all messages for a chat
- `getMessageById(messageId)` - Get specific message by ID
- `deleteMessage(messageId)` - Delete a message

### 🤖 ModelService
Manages AI model operations.

**Functions:**
- `getModels()` - Get list of available AI models

### 🖥️ ServerService
Handles server management operations.

**Functions:**
- `createServer(serverData)` - Create a new server
- `getAllServers()` - Get all servers
- `getServerById(serverId)` - Get specific server by ID
- `deleteServer(serverId)` - Delete a server
- `updateServerStatus(serverId, statusData)` - Update server status

### 📁 FileService
Manages file upload and download operations.

**Functions:**
- `uploadFile(file, metadata)` - Upload a file
- `uploadChatFile(file, chatId, messageId)` - Upload file for chat context
- `getFilesForChat(chatId)` - Get all files for a chat
- `getFileById(fileId)` - Get specific file by ID
- `deleteFile(fileId)` - Delete a file

## Usage Examples

### Basic Chat Operations
```javascript
import ChatService from './services/ChatService';

// Send a message to AI
const response = await ChatService.sendMessage(
  "What is React?", 
  "deepseek-r1:1.5b"
);
console.log(response.message);

// Create a new chat
const chat = await ChatService.createChat({
  title: "React Discussion",
  lmmType: "deepseek-r1:1.5b",
  userId: 1,
  status: "active"
});

// Get all chats
const chats = await ChatService.getAllChats();
```

### Vote Management
```javascript
import VoteService from './services/VoteService';

// Like a message (vote_int = 1, empty comment)
await VoteService.createVote(chatId, {
  messageId: 123,
  voteInt: 1,
  comment: "",
  createdTime: new Date().toISOString()
});

// Dislike a message (vote_int = -1, with reason)
await VoteService.createVote(chatId, {
  messageId: 123,
  voteInt: -1,
  comment: "unhelpful: Response was not accurate",
  createdTime: new Date().toISOString()
});

// Get votes for a chat
const votes = await VoteService.getVotesForChat(chatId);

// Delete a vote
await VoteService.deleteVote(voteId);
```

### File Operations
```javascript
import FileService from './services/FileService';

// Upload a file to a chat
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const fileData = await FileService.uploadChatFile(
  file,     // File object
  123,      // chatId
  456       // messageId (optional)
);

console.log('File uploaded:', fileData.fileId);
```

### Message Operations
```javascript
import MessageService from './services/MessageService';

// Create a message
await MessageService.createMessage({
  messageContent: "Hello, world!",
  chatId: 123,
  messageType: "user", // "user" or "bot"
  createdTime: new Date().toISOString()
});

// Get messages for a chat
const messages = await MessageService.getMessagesForChat(123);
```

## Import Options

### 1. Direct Service Import (Recommended)
```javascript
import ChatService from './services/ChatService';
import VoteService from './services/VoteService';
import MessageService from './services/MessageService';

// Use the services
await ChatService.sendMessage("Hello", "deepseek-r1:1.5b");
await VoteService.createVote(chatId, voteData);
```

### 2. Individual Functions (Backward Compatible)
```javascript
import { 
  sendMessage, 
  createVote, 
  createMessage,
  getModels,
  uploadFile 
} from './services/api';

// Use the functions directly
await sendMessage("Hello", "deepseek-r1:1.5b");
await createVote(chatId, voteData);
```

### 3. From Main Services Index
```javascript
import { 
  ChatService, 
  VoteService, 
  MessageService,
  ModelService,
  ServerService,
  FileService 
} from './services';

await ChatService.sendMessage("Hello", "deepseek-r1:1.5b");
```

## Error Handling

All services include consistent error handling:

```javascript
try {
  const response = await ChatService.sendMessage("Hello", "deepseek-r1:1.5b");
  console.log('Success:', response.message);
} catch (error) {
  console.error('Error details:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data
  });
}
```

## Authentication

All services automatically handle JWT authentication:
- Tokens are automatically added to request headers
- 401 errors redirect to login page
- Tokens stored in `localStorage` under `user` key

## API Endpoints

| Service | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Chat | `/chat/generate` | POST | Generate AI response |
| Chat | `/chat` | GET/POST/PUT/DELETE | Manage chats |
| Vote | `/vote` | POST | Create vote |
| Vote | `/vote/chat/{chatId}` | GET | Get votes for chat |
| Message | `/message` | POST | Create message |
| Message | `/message/chat/{chatId}` | GET | Get messages for chat |
| Model | `/models` | GET | Get available models |
| Server | `/chat-server` | GET/POST | Manage servers |
| File | `/files/upload` | POST | Upload files |

## Configuration

Base URL configuration: `http://localhost:9191/api`

To change the base URL, modify the `baseURL` in each service file.

## Best Practices

1. **Use direct service imports** for better tree-shaking
2. **Handle errors with try-catch blocks**
3. **Use AbortController for cancellable requests**
4. **Implement loading states for better UX**
5. **Use TypeScript for better development experience**

---

*Built for a scalable and maintainable frontend architecture* 🚀 