// Export all API functions
export * from './api';

// Export authentication functions
export * from './auth';

// Export FileService as both default and named export
export { default as FileService } from './FileService';

// Export VoteService as both default and named export
export { default as VoteService } from './VoteService';

// Export ChatService as both default and named export
export { default as ChatService } from './ChatService';

// Export MessageService as both default and named export
export { default as MessageService } from './MessageService';

// Export ModelService as both default and named export
export { default as ModelService } from './ModelService';

// Export ServerService as both default and named export
export { default as ServerService } from './ServerService';

// Import and re-export individual file functions for convenience
import FileService from './FileService';
import AIFileService from './AIFileService';
import VoteService from './VoteService';
import ChatService from './ChatService';
import MessageService from './MessageService';
import ModelService from './ModelService';
import ServerService from './ServerService';

export const uploadFile = FileService.uploadFile;
export const uploadChatFile = FileService.uploadChatFile;
export const getFileById = FileService.getFileById;
export const getFileContent = FileService.getFileContent;
export const deleteFile = FileService.deleteFile;
export const getFilesByChatId = FileService.getFilesByChatId;
export const getAllFilesByUserId = FileService.getAllFilesByUserId;
export const validateFile = FileService.validateFile;
export const getFilesForChat = FileService.getFilesForChat;
export const getFilesForMessage = FileService.getFilesForMessage;

// AI File Processing functions
export const analyzeFile = AIFileService.analyzeFile;
export const askQuestionAboutFile = AIFileService.askQuestionAboutFile;
export const askQuestionWithContext = AIFileService.askQuestionWithContext;
export const summarizeFile = AIFileService.summarizeFile;
export const analyzeFileContent = AIFileService.analyzeFileContent;
export const getExtractedText = AIFileService.getExtractedText;
export const reExtractText = AIFileService.reExtractText;
export const generateFileBasedResponse = AIFileService.generateFileBasedResponse;
export const isTextExtractionSupported = AIFileService.isTextExtractionSupported;

// Re-export individual vote functions for convenience
export const createVote = VoteService.createVote;
export const getVotesForChat = VoteService.getVotesForChat;
export const getVoteById = VoteService.getVoteById;
export const deleteVote = VoteService.deleteVote;

// Re-export individual chat functions for convenience
export const sendMessage = ChatService.sendMessage;
export const createChat = ChatService.createChat;
export const getAllChats = ChatService.getAllChats;
export const getChatById = ChatService.getChatById;
export const updateChatTitle = ChatService.updateChatTitle;
export const deleteChat = ChatService.deleteChat;
export const deleteAllChats = ChatService.deleteAllChats;
export const getGeneratedResponses = ChatService.getGeneratedResponses;

// Re-export individual message functions for convenience
export const createMessage = MessageService.createMessage;
export const getMessagesForChat = MessageService.getMessagesForChat;
export const getMessageById = MessageService.getMessageById;
export const deleteMessage = MessageService.deleteMessage;

// Re-export individual model functions for convenience
export const getModels = ModelService.getModels;

// Re-export individual server functions for convenience
export const createServer = ServerService.createServer;
export const getAllServers = ServerService.getAllServers;
export const getServerById = ServerService.getServerById;
export const deleteServer = ServerService.deleteServer;
export const updateServerStatus = ServerService.updateServerStatus; 