import axios from 'axios';
import FileService from './FileService';
import VoteService from './VoteService';
import ChatService from './ChatService';
import MessageService from './MessageService';
import ModelService from './ModelService';
import ServerService from './ServerService';
import SearchService from './SearchService';

const api = axios.create({
  baseURL: 'http://localhost:9191/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login page on authentication failure
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// FileService
export const uploadFile = FileService.uploadFile;
export const uploadChatFile = FileService.uploadChatFile;
export const getFilesForChat = FileService.getFilesForChat;
export const getFilesForMessage = FileService.getFilesForMessage;
export const getFileById = FileService.getFileById;
export const deleteFile = FileService.deleteFile;

// VoteService
export const createVote = VoteService.createVote;
export const getVotesForChat = VoteService.getVotesForChat;
export const getVoteById = VoteService.getVoteById;
export const deleteVote = VoteService.deleteVote;

// ChatService
export const sendMessage = ChatService.sendMessage;
export const createChat = ChatService.createChat;
export const getAllChats = ChatService.getAllChats;
export const getChatById = ChatService.getChatById;
export const updateChatTitle = ChatService.updateChatTitle;
export const deleteChat = ChatService.deleteChat;
export const deleteAllChats = ChatService.deleteAllChats;
export const getGeneratedResponses = ChatService.getGeneratedResponses;

// MessageService
export const createMessage = MessageService.createMessage;
export const getMessagesForChat = MessageService.getMessagesForChat;
export const getMessageById = MessageService.getMessageById;
export const deleteMessage = MessageService.deleteMessage;

//  ModelService
export const getModels = ModelService.getModels;

// ServerService
export const createServer = ServerService.createServer;
export const getAllServers = ServerService.getAllServers;
export const getServerById = ServerService.getServerById;
export const deleteServer = ServerService.deleteServer;
export const updateServerStatus = ServerService.updateServerStatus;

// SearchService
export const searchConversations = SearchService.searchConversations;
export const clearSearchCache = SearchService.clearCache;

export default api; 