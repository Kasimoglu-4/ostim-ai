import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for voice recognition using Web Speech API
 * Integrates seamlessly with the existing Ostim.AI chat system
 */
const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const isListeningRef = useRef(false);

  // Update the ref when isListening changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize Speech Recognition - only run once
  useEffect(() => {
    // Enhanced browser support detection
    console.log('Initializing voice recognition...');
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const userAgent = navigator.userAgent.toLowerCase();
      let browserName = 'Unknown';
      
      if (userAgent.includes('chrome')) browserName = 'Chrome';
      else if (userAgent.includes('firefox')) browserName = 'Firefox';
      else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browserName = 'Safari';
      else if (userAgent.includes('edge')) browserName = 'Edge';
      else if (userAgent.includes('opera')) browserName = 'Opera';
      
      const errorMsg = `Speech recognition not supported in ${browserName}. Web Speech API requires Chrome, Edge, or Safari with HTTPS.`;
      console.warn(errorMsg);
      setError(errorMsg);
      setIsSupported(false);
      return;
    }

    // Check HTTPS requirement (except for localhost)
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      const errorMsg = 'Voice recognition requires HTTPS. Please use https:// or localhost.';
      console.warn(errorMsg);
      setError(errorMsg);
      setIsSupported(false);
      return;
    }

    console.log('Voice recognition is supported and ready!');
    setIsSupported(true);
    setError(null);
    
    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set initial language from localStorage or default to English
    const savedLanguage = localStorage.getItem('voiceLanguage') || 'en-US';
    recognition.lang = savedLanguage;
    console.log('Voice recognition language set to:', savedLanguage);
    
    recognition.maxAlternatives = 1;

    // Listen for language changes from settings
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail.language;
      if (recognition && newLanguage) {
        console.log('=== LANGUAGE CHANGE DETECTED ===');
        console.log('New language requested:', newLanguage);
        console.log('Current recognition language:', recognition.lang);
        
        // Special handling for Arabic languages
        let finalLanguage = newLanguage;
        if (newLanguage.startsWith('ar')) {
          // Try multiple Arabic variants for better compatibility
          const arabicVariants = ['ar-SA', 'ar-EG', 'ar-AE', 'ar'];
          finalLanguage = arabicVariants.includes(newLanguage) ? newLanguage : 'ar-SA';
          console.log('Arabic language detected, using variant:', finalLanguage);
          console.log('Available Arabic variants:', arabicVariants);
        }
        
        // Update recognition language
        const oldLanguage = recognition.lang;
        recognition.lang = finalLanguage;
        console.log('Voice recognition language updated from', oldLanguage, 'to', finalLanguage);
        
        // Additional debugging for Arabic
        if (newLanguage.startsWith('ar')) {
          console.log('🔍 ARABIC LANGUAGE DEBUGGING:');
          console.log('- Recognition language is now:', recognition.lang);
          console.log('- Browser support depends on system language packs');
          console.log('- If Arabic speech is still transcribed as English, try:');
          console.log('  1. Install Arabic language pack on Windows/macOS');
          console.log('  2. Use Chrome browser (best Web Speech API support)');
          console.log('  3. Check System Settings > Language & Region');
          
          // Test Arabic language support
          setTimeout(() => {
            console.log('Testing Arabic language support...');
            console.log('Recognition.lang property:', recognition.lang);
            console.log('If still transcribing English, your system may not have Arabic speech recognition installed.');
          }, 1000);
        }
        
        // Restart recognition if currently listening
        if (isListeningRef.current) {
          console.log('Restarting recognition with new language...');
          recognition.stop();
          setTimeout(() => {
            try {
              recognition.start();
              console.log('Recognition restarted with language:', recognition.lang);
            } catch (error) {
              console.error('Error restarting recognition with new language:', error);
            }
          }, 100);
        }
      }
    };

    window.addEventListener('voiceLanguageChanged', handleLanguageChange);

    // Expose setLanguage function globally for manual control
    window.voiceRecognition = {
      setLanguage: (language) => {
        if (recognition) {
          recognition.lang = language;
          localStorage.setItem('voiceLanguage', language);
          console.log('Voice recognition language manually set to:', language);
        }
      }
    };

    // Event handlers
    recognition.onstart = () => {
      console.log('Voice recognition started');
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Debug logging for language detection issues
      if (finalTranscript) {
        console.log('=== SPEECH RECOGNITION RESULT ===');
        console.log('Recognition language setting:', recognitionRef.current?.lang || 'unknown');
        console.log('Final transcript:', finalTranscript);
        
        // Check if we're expecting Arabic but getting English
        const currentLang = recognitionRef.current?.lang || '';
        if (currentLang.startsWith('ar')) {
          // Simple check for Arabic text
          const hasArabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(finalTranscript);
          if (!hasArabicChars && finalTranscript.length > 0) {
            console.log('⚠️  WARNING: Arabic language is selected but transcript appears to be in English/Latin script');
            console.log('This suggests your system may not have Arabic speech recognition support');
            console.log('Transcript contains Arabic characters:', hasArabicChars);
            console.log('Possible solutions:');
            console.log('1. Install Arabic language pack: Windows Settings > Time & Language > Language');
            console.log('2. Add Arabic keyboard: Settings > Time & Language > Language > Arabic > Options');
            console.log('3. Try different Arabic variant (ar-SA, ar-EG, ar-AE)');
          } else if (hasArabicChars) {
            console.log('✅ Successfully recognized Arabic text!');
          }
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      console.log('Recognition language was:', recognitionRef.current?.lang || 'unknown');
      
      let errorMessage = 'An error occurred during voice recognition.';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone access is required for voice input.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Voice recognition was aborted.';
          break;
        case 'language-not-supported':
          const currentLang = recognitionRef.current?.lang || '';
          if (currentLang.startsWith('ar')) {
            errorMessage = 'Arabic language not supported. Please install Arabic language pack on your system.';
            console.log('🔧 ARABIC LANGUAGE SUPPORT INSTRUCTIONS:');
            console.log('Windows 10/11:');
            console.log('1. Go to Settings > Time & Language > Language');
            console.log('2. Click "Add a language" and select Arabic');
            console.log('3. Download and install the language pack');
            console.log('4. Restart your browser');
            console.log('');
            console.log('macOS:');
            console.log('1. Go to System Preferences > Language & Region');
            console.log('2. Click the "+" button and add Arabic');
            console.log('3. Restart your browser');
          } else {
            errorMessage = `Language "${currentLang}" is not supported for speech recognition.`;
          }
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      if (isListeningRef.current) {
        // Restart recognition if it should still be listening
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
            setIsListening(false);
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.removeEventListener('voiceLanguageChanged', handleLanguageChange);
    };
  }, []);

  // Start voice recognition
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (recognitionRef.current && !isListening) {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      setIsListening(true);
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setError('Failed to start voice recognition. Please try again.');
        setIsListening(false);
      }
    }
  }, [isSupported, isListening]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    }
  }, [isListening]);

  // Toggle voice recognition
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Set language
  const setLanguage = useCallback((language) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    // eslint-disable-next-line no-unused-vars
    setLanguage,
    fullTranscript: transcript + interimTranscript
  };
};

export default useVoiceRecognition; 