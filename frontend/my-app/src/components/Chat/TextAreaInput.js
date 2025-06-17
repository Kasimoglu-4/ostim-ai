import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from '../../styles/TextAreaInput.module.css';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';

// Custom Alert Component
const CustomAlert = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.alertOverlay} onClick={onClose}>
      <div className={styles.alertModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.alertContent}>
          <div className={styles.alertIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.alertMessage}>{message}</div>
          <button className={styles.alertButton} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const TextAreaInput = ({ 
  mode = 'conversation', // 'welcome' or 'conversation' 
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
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Voice recognition hook
  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported: voiceSupported,
    toggleListening,
    clearTranscript
  } = useVoiceRecognition();

  // Debug voice support - optimized to reduce console spam
  useEffect(() => {
    if (voiceError) {
      console.warn('Voice recognition error:', voiceError);
    } else if (voiceSupported) {
      console.log('Voice recognition is supported and ready');
    }
  }, [voiceSupported, voiceError]);

  // // If no models are provided, use defaults
  // const models = availableModels.length > 0 
  //   ? availableModels.filter(model => ['deepseek-r1:1.5b', 'deepseek-coder:latest'].includes(model.id)) 
  //   : [
  //       { id: 'deepseek-r1:1.5b', name: 'DeepSeek R1 1.5B', description: 'General purpose AI model' },
  //       { id: 'deepseek-coder:latest', name: 'DeepSeek Coder', description: 'Code-specialized AI model' }
  //     ];

  // Focus the input when it's loaded or when loading state changes
  useEffect(() => {
    if (textAreaRef.current && !isLoading && mode === 'conversation') {
      textAreaRef.current.focus();
    }
  }, [isLoading, mode]);

  // Handle voice transcript changes - optimized to prevent lag
  useEffect(() => {
    if (transcript && transcript.trim()) {
      // Append voice transcript to current message
      setMessage(prev => {
        const trimmedTranscript = transcript.trim();
        if (prev.endsWith(trimmedTranscript)) {
          // Avoid duplicate text
          return prev;
        }
        return prev + (prev ? ' ' : '') + trimmedTranscript;
      });
      clearTranscript(); // Clear to avoid duplication
    }
  }, [transcript, clearTranscript]);

  // Auto-resize textarea based on content
  const autoResizeTextarea = () => {
    if (textAreaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textAreaRef.current.style.height = 'auto';
      
      // Set the height to match the scrollHeight (minimum height enforced by CSS)
      const newHeight = Math.min(textAreaRef.current.scrollHeight, 150);
      textAreaRef.current.style.height = `${newHeight}px`;
    }
  };

  // Auto-resize when message changes
  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) {
      // If we're loading, treat this as a stop generation request
      if (onStopGeneration) {
        onStopGeneration();
      }
      return;
    }
    if (message.trim() || attachedFiles.length > 0) {
      // Stop voice recognition if it's active
      if (isListening) {
        toggleListening();
      }
      
      onSendMessage(message, attachedFiles);
      setMessage('');
      setAttachedFiles([]);
      
      // Keep focus on the textarea after sending a message
      // Only attempt to focus in conversation mode, since welcome mode might not have the textarea rendered
      if (textAreaRef.current && mode === 'conversation') {
        setTimeout(() => {
          textAreaRef.current.focus();
          // Reset height after clearing content
          textAreaRef.current.style.height = 'auto';
        }, 0);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoading) {
        // If we're loading, treat this as a stop generation request
        if (onStopGeneration) {
          onStopGeneration();
        }
        return;
      }
      if (message.trim() || attachedFiles.length > 0) {
        // Stop voice recognition if it's active
        if (isListening) {
          toggleListening();
        }
        
        onSendMessage(message, attachedFiles);
        setMessage('');
        setAttachedFiles([]);
        
        // Keep focus on the textarea after sending a message
        // Only attempt to focus in conversation mode, since welcome mode might not have the textarea rendered
        if (textAreaRef.current && mode === 'conversation') {
          setTimeout(() => {
            textAreaRef.current.focus();
            // Reset height after clearing content
            textAreaRef.current.style.height = 'auto';
          }, 0);
        }
      }
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Define maximum file size (512 MB in bytes)
    const MAX_FILE_SIZE = 512 * 1024 * 1024; // 512 MB
    
    // Define supported file extensions
    const SUPPORTED_EXTENSIONS = [
      // Text files
      '.txt', '.pdf', '.docx', '.pptx', '.xlsx', '.csv',
      // Code files
      '.py', '.java', '.cpp', '.c', '.js', '.jsx', '.ts', '.tsx', 
      '.html', '.htm', '.css', '.scss', '.sass', '.less',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
      '.cs', '.vb', '.r', '.sql', '.sh', '.bat', '.ps1',
      // Markdown & others
      '.md', '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg'
    ];
    
    const newAttachedFiles = [...attachedFiles]; // Start with existing files
    
    for (const file of files) {
      // Get file extension
      const fileName = file.name.toLowerCase();
      const fileExtension = '.' + fileName.split('.').pop();
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showAlert(`File "${file.name}" size exceeds the maximum limit of 512 MB. Your file is ${formatFileSize(file.size)}.`);
        continue;
      }
      
      // Validate file format
      if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
        showAlert(`Unsupported file format: ${fileExtension}\n\nSupported formats:\n• Text files: .txt, .pdf, .docx, .pptx, .xlsx, .csv\n• Code files: .py, .java, .cpp, .js, .html, .css, and more\n• Markdown & others: .md, .json, .xml`);
        continue;
      }
      
      // Create a temporary file object with preview info
      const fileObj = {
        file,
        fileName: file.name,
        fileType: file.type.startsWith('image/') ? 'image' : 'document',
        fileSize: formatFileSize(file.size),
        contentType: file.type
      };
      
      newAttachedFiles.push(fileObj);
      
      // Call the onFileUpload prop if provided
      if (onFileUpload) {
        onFileUpload(fileObj);
      }
    }
    
    setAttachedFiles(newAttachedFiles);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const formatFileSize = (size) => {
    if (size < 1024) {
      return size + " B";
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + " KB";
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(1) + " MB";
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }
  };
  
  const removeAttachedFile = (index) => {
    const newAttachedFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newAttachedFiles);
  };

  // Generate CSS class names using CSS Modules
  const getClassNames = () => {
    const baseClasses = {
      container: styles.inputContainer,
      form: styles.form,
      wrapper: styles.inputWrapper,
      textarea: styles.textarea,
      modelButtons: styles.modelButtons,
      modelButton: styles.modelButton,
      actionButtons: styles.actionButtons,
      uploadButton: styles.uploadButton,
      sendButton: styles.sendButton
    };

    // Add mode-specific classes
    if (mode === 'welcome') {
      return {
        ...baseClasses,
        container: `${baseClasses.container} ${styles.welcome}`,
        form: `${baseClasses.form} ${styles.welcome}`,
        wrapper: `${baseClasses.wrapper} ${styles.welcome}`,
        textarea: `${baseClasses.textarea} ${styles.welcome}`
      };
    } else {
      return {
        ...baseClasses,
        container: `${baseClasses.container} ${styles.conversation}`,
        form: `${baseClasses.form} ${styles.conversation}`,
        wrapper: `${baseClasses.wrapper} ${styles.conversation}`,
        textarea: `${baseClasses.textarea} ${styles.conversation}`
      };
    }
  };

  const classNames = getClassNames();
  
  // Get the appropriate active class based on selected model
  const getActiveModelClass = () => {
    if (selectedModel === 'deepseek-coder:latest') {
      return `${styles.modelButton} ${styles.active} ${styles.blue}`;
    } else {
      return `${styles.modelButton} ${styles.active} ${styles.purple}`;
    }
  };
  
  // Determine whether to show think sections (default: false)
  const [showThinkSections, setShowThinkSections] = useState(false);
  
  // Toggle think sections
  const toggleThinkSections = () => {
    const newValue = !showThinkSections;
    setShowThinkSections(newValue);
    // If there's a model change handler, inform parent component
    if (onChangeModel) {
      // Pass showThinkSections flag to parent component
      onChangeModel(selectedModel, newValue);
    }
  };

  // Custom alert function
  const showAlert = (message) => {
    setAlertState({ isOpen: true, message });
  };

  const closeAlert = () => {
    setAlertState({ isOpen: false, message: '' });
  };

  const handleVoiceToggle = useCallback(() => {
    console.log('Voice button clicked - isListening:', isListening);
    
    if (!voiceSupported) {
      const message = `Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari for the best experience.\n\nBrowser: ${navigator.userAgent}\nProtocol: ${window.location.protocol}`;
      console.warn('Voice not supported');
      showAlert(message);
      return;
    }

    if (voiceError) {
      const message = `Voice recognition error: ${voiceError}`;
      console.error('Voice error:', voiceError);
      showAlert(message);
      return;
    }

    try {
      toggleListening();
    } catch (error) {
      console.error('Error toggling voice recognition:', error);
      showAlert('Failed to toggle voice recognition. Please try again.');
    }
  }, [voiceSupported, voiceError, isListening, toggleListening]);

  return (
    <div className={classNames.container}>
      {/* File attachment preview in a fixed-width container */}
      {attachedFiles.length > 0 && (
        <div className={styles.fileAttachmentContainer}>
          {attachedFiles.map((file, index) => (
            <div key={index} className={styles.filePreview}>
              <div className={styles.previewContent}>
                {file.fileType === 'image' ? (
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.4237 7H10.5763C8.04887 7 6 8.94521 6 11.3447V20.6544C6 23.054 8.04887 24.9992 10.5763 24.9992H21.4237C23.9511 24.9992 26 23.054 26 20.6544V11.3447C26 8.94521 23.9511 7 21.4237 7Z" fill="#CDCDCD"></path>
                    <path d="M11.3448 14.2014C12.3922 14.2014 13.2413 13.3955 13.2413 12.4015C13.2413 11.4074 12.3974 10.6016 11.3448 10.6016C10.2974 10.6016 9.44824 11.4074 9.44824 12.4015C9.44824 13.3955 10.2974 14.2014 11.3448 14.2014Z" fill="white"></path>
                    <path d="M25.9989 15.4688L21.3278 19.2012C20.7752 19.6428 20.0993 19.9222 19.3825 20.0054C18.6656 20.0886 17.9387 19.972 17.2904 19.6699L13.5988 17.9489C13.0423 17.6896 12.4264 17.5663 11.8069 17.5902C11.1875 17.6141 10.5841 17.7845 10.0516 18.0859L6.00098 20.3788V20.6554C6.00089 21.226 6.11915 21.7909 6.34906 22.318C6.57896 22.8452 6.91598 23.3241 7.34087 23.7276C7.76576 24.131 8.27022 24.4511 8.82541 24.6694C9.38059 24.8878 9.97563 25.0002 10.5766 25.0002H21.4247C22.6381 24.9998 23.8017 24.5419 24.6595 23.7271C25.5173 22.9123 25.9991 21.8074 25.9989 20.6554V15.4688Z" fill="#7A7A7A"></path>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 9C7 6.79086 8.79086 5 11 5L18.6383 5C19.1906 5 19.6383 5.44772 19.6383 6V6.92308C19.6383 9.13222 21.4292 10.9231 23.6383 10.9231H24C24.5523 10.9231 25 11.3708 25 11.9231V23C25 25.2091 23.2091 27 21 27H11C8.79086 27 7 25.2091 7 23V9Z" fill="#F8CA27"></path>
                    <g filter="url(#filter0_d_602_422)">
                      <path d="M19.6602 6.92458V5.84766L24.4126 10.9246H23.6602C21.451 10.9246 19.6602 9.13372 19.6602 6.92458Z" fill="#F8EDC7"></path>
                    </g>
                    <path d="M20.2557 12H11.7443C11.3332 12 11 12.3358 11 12.75C11 13.1642 11.3332 13.5 11.7443 13.5H20.2557C20.6668 13.5 21 13.1642 21 12.75C21 12.3358 20.6668 12 20.2557 12Z" fill="#F8EDC7"></path>
                    <path d="M20.2557 16L11.7443 16.0017C11.3332 16.0017 11 16.3371 11 16.7509C11 17.1646 11.3332 17.5 11.7443 17.5L20.2557 17.4983C20.6668 17.4983 21 17.1629 21 16.7491C21 16.3354 20.6668 16 20.2557 16Z" fill="#F8EDC7"></path>
                    <path d="M15.3575 20H11.6425C11.2876 20 11 20.3358 11 20.75C11 21.1642 11.2876 21.5 11.6425 21.5H15.3575C15.7124 21.5 16 21.1642 16 20.75C16 20.3358 15.7124 20 15.3575 20Z" fill="#F8EDC7"></path>
                    <defs>
                      <filter id="filter0_d_602_422" x="19.1602" y="5.34766" width="7.75195" height="8.07617" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
                        <feOffset dx="1" dy="1"></feOffset>
                        <feGaussianBlur stdDeviation="0.75"></feGaussianBlur>
                        <feComposite in2="hardAlpha" operator="out"></feComposite>
                        <feColorMatrix type="matrix" values="0 0 0 0 0.591623 0 0 0 0 0.452482 0 0 0 0 0.0698445 0 0 0 0.25 0"></feColorMatrix>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_602_422"></feBlend>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_602_422" result="shape"></feBlend>
                      </filter>
                    </defs>
                  </svg>
                )}
                <div className={styles.previewFileInfo}>
                  <div className={styles.previewFileName}>{file.fileName}</div>
                  <div className={styles.previewFileSize}>{file.fileSize}</div>
                </div>
                <button 
                  type="button" 
                  className={styles.removeFileButton}
                  onClick={() => removeAttachedFile(index)}
                  title="Remove file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedModel.includes('coder') ? 'DeepSeek Coder' : 'DeepSeek R1 1.5B'}...`}
            disabled={isLoading}
          />
          
          <div className={classNames.modelButtons}>
            <button 
              type="button" 
              className={selectedModel === 'deepseek-r1:1.5b' ? getActiveModelClass() : styles.modelButton}
              onClick={() => onChangeModel('deepseek-r1:1.5b')}
              disabled={isLoading}
            >
              <span className={styles.modelIcon}>
                {mode === 'welcome' ? '🤖' : '🟣'}
              </span>
              <span>DeepSeek R1</span>
            </button>
            <button 
              type="button" 
              className={selectedModel === 'deepseek-coder:latest' ? getActiveModelClass() : styles.modelButton}
              onClick={() => onChangeModel('deepseek-coder:latest')}
              disabled={isLoading}
            >
              <span className={styles.modelIcon}>
                {mode === 'welcome' ? '💻' : '🔵'}
              </span>
              <span>DeepSeek Coder</span>
            </button>
            
            {/* Show Think Toggle Button */}
            <button 
              type="button" 
              className={`${styles.modelButton} ${styles.thinkToggle} ${showThinkSections ? styles.thinkActive : ''}`}
              onClick={toggleThinkSections}
              disabled={isLoading}
            >
              <span className={styles.modelIcon}>🧠</span>
              <span>Show Thinking</span>
            </button>
            
            {/* Voice Recognition Button */}
            <button 
              type="button" 
              className={`${styles.modelButton} ${isListening ? styles.voiceActive : ''} ${!voiceSupported ? styles.voiceUnsupported : ''}`}
              onClick={handleVoiceToggle}
              disabled={isLoading}
              title={
                !voiceSupported 
                  ? 'Voice recognition not supported in this browser' 
                  : isListening 
                    ? 'Stop voice recognition' 
                    : 'Start voice recognition'
              }
            >
              <span className={styles.modelIcon}>
                {!voiceSupported ? '🔇' : isListening ? '🎙️' : '🎤'}
              </span>
              <span>
                {!voiceSupported ? 'Voice (N/A)' : isListening ? 'Listening...' : 'Voice'}
              </span>
            </button>
          </div>
          
          <div className={classNames.actionButtons}>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".txt,.pdf,.docx,.pptx,.xlsx,.csv,.py,.java,.cpp,.c,.js,.jsx,.ts,.tsx,.html,.htm,.css,.scss,.sass,.less,.php,.rb,.go,.rs,.swift,.kt,.scala,.cs,.vb,.r,.sql,.sh,.bat,.ps1,.md,.json,.xml,.yaml,.yml,.toml,.ini,.cfg"
              style={{ display: 'none' }}
              disabled={isLoading}
              multiple
            />
            <button
              type="button"
              className={`${classNames.uploadButton} ${attachedFiles.length > 0 ? styles.active : ''}`}
              title="Upload file"
              onClick={handleFileUploadClick}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 20" fill="none" width="16" height="20">
                <path d="M7 20c-1.856-.002-3.635-.7-4.947-1.94C.74 16.819.003 15.137 0 13.383V4.828a4.536 4.536 0 0 1 .365-1.843 4.75 4.75 0 0 1 1.087-1.567A5.065 5.065 0 0 1 3.096.368a5.293 5.293 0 0 1 3.888 0c.616.244 1.174.6 1.643 1.05.469.45.839.982 1.088 1.567.25.586.373 1.212.364 1.843v8.555a2.837 2.837 0 0 1-.92 2.027A3.174 3.174 0 0 1 7 16.245c-.807 0-1.582-.3-2.158-.835a2.837 2.837 0 0 1-.92-2.027v-6.22a1.119 1.119 0 1 1 2.237 0v6.22a.777.777 0 0 0 .256.547.868.868 0 0 0 .585.224c.219 0 .429-.08.586-.224a.777.777 0 0 0 .256-.546V4.828A2.522 2.522 0 0 0 7.643 3.8a2.64 2.64 0 0 0-.604-.876 2.816 2.816 0 0 0-.915-.587 2.943 2.943 0 0 0-2.168 0 2.816 2.816 0 0 0-.916.587 2.64 2.64 0 0 0-.604.876 2.522 2.522 0 0 0-.198 1.028v8.555c0 1.194.501 2.339 1.394 3.183A4.906 4.906 0 0 0 7 17.885a4.906 4.906 0 0 0 3.367-1.319 4.382 4.382 0 0 0 1.395-3.183v-6.22a1.119 1.119 0 0 1 2.237 0v6.22c-.002 1.754-.74 3.436-2.052 4.677C10.635 19.3 8.856 19.998 7 20z" fill="currentColor"></path>
              </svg>
            </button>

            <button 
              type="submit" 
              className={`${classNames.sendButton} ${isLoading ? styles.loading : ''}`} 
              disabled={(!message.trim() && attachedFiles.length === 0) && !isLoading}
            >
              {isLoading ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="10" height="10" rx="1" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7 16c-.595 0-1.077-.462-1.077-1.032V1.032C5.923.462 6.405 0 7 0s1.077.462 1.077 1.032v13.936C8.077 15.538 7.595 16 7 16z" fill="currentColor"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M.315 7.44a1.002 1.002 0 0 1 0-1.46L6.238.302a1.11 1.11 0 0 1 1.523 0c.421.403.421 1.057 0 1.46L1.838 7.44a1.11 1.11 0 0 1-1.523 0z" fill="currentColor"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M13.685 7.44a1.11 1.11 0 0 1-1.523 0L6.238 1.762a1.002 1.002 0 0 1 0-1.46 1.11 1.11 0 0 1 1.523 0l5.924 5.678c.42.403.42 1.056 0 1.46z" fill="currentColor"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Message input footer note (only for conversation mode) */}
        {mode === 'conversation' && (
          <div className={styles.inputActions}>
            <div className={styles.inputTip}>
              <span>AI-generated, for reference only</span>
            </div>
          </div>
        )}
        
        {/* Welcome footer (only for welcome mode) */}
        {mode === 'welcome' && (
          <div className={styles.welcomeFooter}>
            AI-generated, for reference only
          </div>
        )}
      </form>

      {/* Custom Alert Modal */}
      <CustomAlert 
        isOpen={alertState.isOpen} 
        message={alertState.message} 
        onClose={closeAlert} 
      />
    </div>
  );
};

export default TextAreaInput; 