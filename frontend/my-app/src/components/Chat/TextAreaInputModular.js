import React, { useState, useRef, useEffect } from 'react';
import styles from '../../styles/TextAreaInput.module.css';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useAlert } from '../../hooks/useAlert';
import CustomAlert from './CustomAlert';

const TextAreaInput = ({ 
  mode = 'conversation',
  onSendMessage, 
  isLoading, 
  selectedModel,
  onChangeModel,
  availableModels = [],
  uploadedFile,
  onFileUpload,
  onStopGeneration
}) => {
  const [message, setMessage] = useState('');
  const textAreaRef = useRef(null);
  
  // Custom hooks for better separation of concerns
  const { 
    attachedFiles, 
    handleFileUpload, 
    removeAttachedFile,
    fileInputRef 
  } = useFileUpload(onFileUpload);
  
  const { 
    alertState, 
    showAlert, 
    closeAlert 
  } = useAlert();

  // Auto-resize and focus effects
  useEffect(() => {
    if (textAreaRef.current && !isLoading && mode === 'conversation') {
      textAreaRef.current.focus();
    }
  }, [isLoading, mode]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      const newHeight = Math.min(textAreaRef.current.scrollHeight, 150);
      textAreaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  // Generate CSS class names using CSS Modules
  const getClassNames = () => ({
    container: `${styles.inputContainer} ${styles[mode]}`,
    form: `${styles.form} ${styles[mode]}`,
    wrapper: `${styles.inputWrapper} ${styles[mode]}`,
    textarea: `${styles.textarea} ${styles[mode]}`,
    modelButtons: styles.modelButtons,
    modelButton: styles.modelButton,
    actionButtons: styles.actionButtons,
    uploadButton: styles.uploadButton,
    sendButton: styles.sendButton
  });

  const classNames = getClassNames();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) {
      onStopGeneration?.();
      return;
    }
    if (message.trim() || attachedFiles.length > 0) {
      onSendMessage(message, attachedFiles);
      setMessage('');
      // Clear attachments through custom hook
      // removeAllAttachedFiles(); // This would be implemented in the hook
      
      if (textAreaRef.current && mode === 'conversation') {
        setTimeout(() => {
          textAreaRef.current.focus();
          textAreaRef.current.style.height = 'auto';
        }, 0);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getActiveModelClass = () => {
    const baseClass = classNames.modelButton;
    if (selectedModel === 'deepseek-coder:latest') {
      return `${baseClass} ${styles.active} ${styles.blue}`;
    }
    return `${baseClass} ${styles.active} ${styles.purple}`;
  };

  return (
    <div className={classNames.container}>
      {/* File attachments */}
      {attachedFiles.length > 0 && (
        <div className={styles.fileAttachmentContainer}>
          {attachedFiles.map((file, index) => (
            <div key={index} className={styles.filePreview}>
              {/* File preview content */}
              <div className={styles.previewContent}>
                {/* SVG icons and file info */}
                <button 
                  onClick={() => removeAttachedFile(index)}
                  className={styles.removeButton}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={classNames.form}>
        <div className={classNames.wrapper}>
          <textarea
            ref={textAreaRef}
            className={classNames.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedModel.includes('coder') ? 'DeepSeek Coder' : 'DeepSeek R1 1.5B'}...`}
            disabled={isLoading}
          />
          
          {/* Model selection buttons */}
          <div className={classNames.modelButtons}>
            <button 
              type="button" 
              className={selectedModel === 'deepseek-r1:1.5b' ? getActiveModelClass() : classNames.modelButton}
              onClick={() => onChangeModel('deepseek-r1:1.5b')}
              disabled={isLoading}
            >
              <span>🟣</span>
              <span>DeepSeek R1</span>
            </button>
            <button 
              type="button" 
              className={selectedModel === 'deepseek-coder:latest' ? getActiveModelClass() : classNames.modelButton}
              onClick={() => onChangeModel('deepseek-coder:latest')}
              disabled={isLoading}
            >
              <span>🔵</span>
              <span>DeepSeek Coder</span>
            </button>
          </div>
          
          {/* Action buttons */}
          <div className={classNames.actionButtons}>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              multiple
            />
            <button
              type="button"
              className={classNames.uploadButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              📎
            </button>
            <button 
              type="submit" 
              className={`${classNames.sendButton} ${isLoading ? styles.loading : ''}`}
              disabled={(!message.trim() && attachedFiles.length === 0) && !isLoading}
            >
              {isLoading ? '⏹️' : '⬆️'}
            </button>
          </div>
        </div>
      </form>

      <CustomAlert 
        isOpen={alertState.isOpen} 
        message={alertState.message} 
        onClose={closeAlert} 
      />
    </div>
  );
};

export default TextAreaInput; 