import React from 'react';
import TextAreaInput from './TextAreaInput';
import '../../styles/WelcomeScreen.css';

/**
 * WelcomeScreen Component - Displays the welcome screen when no conversation is active
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Callback for sending messages
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.selectedModel - Currently selected model
 * @param {Function} props.onChangeModel - Callback for model changes
 * @param {Array} props.availableModels - Available AI models
 * @param {Object} props.uploadedFile - Uploaded file state
 * @param {Function} props.onFileUpload - File upload handler
 * @param {Function} props.onStopGeneration - Stop generation handler
 */
const WelcomeScreen = ({
  onSendMessage,
  isLoading,
  selectedModel,
  onChangeModel,
  availableModels,
  uploadedFile,
  onFileUpload,
  onStopGeneration
}) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-header">
        <div className="welcome-logo-container">
          <img 
            src="https://www.bizimlebasvur.com/wp-content/uploads/2023/07/Ostim-Teknik-Universitesi.webp" 
            alt="OSTIM Technical University Logo" 
            className="welcome-logo"
          />
          <h1 className="welcome-title">Hi, I'm OSTIM AI.</h1>
        </div>
        <p className="welcome-subtitle">How can I help you today?</p>
      </div>
      
      <div className="welcome-input-container">
        <TextAreaInput 
          mode="welcome"
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onChangeModel={onChangeModel}
          availableModels={availableModels}
          uploadedFile={uploadedFile}
          onFileUpload={onFileUpload}
          onStopGeneration={onStopGeneration}
        />
      </div>
    </div>
  );
};

export default WelcomeScreen; 