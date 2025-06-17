import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for text-to-speech functionality
 * Uses manually selected language from settings
 */
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const utteranceRef = useRef(null);

  // Find the best voice for a given language
  const findBestVoice = useCallback((voiceList, languageCode) => {
    if (!voiceList.length) return null;

    console.log('Finding voice for language:', languageCode);
    console.log('Available voices:', voiceList.map(v => `${v.name} (${v.lang})`));

    // Special handling for Arabic languages
    if (languageCode.startsWith('ar')) {
      console.log('Looking for Arabic voice...');
      
      // Try exact match first
      let voice = voiceList.find(v => v.lang === languageCode);
      
      // Try other Arabic variants
      if (!voice) {
        const arabicVariants = ['ar-SA', 'ar-EG', 'ar-AE', 'ar'];
        for (const variant of arabicVariants) {
          voice = voiceList.find(v => v.lang === variant);
          if (voice) {
            console.log(`Found Arabic voice with variant: ${variant} (${voice.name})`);
            break;
          }
        }
      }
      
      // Try partial match (any Arabic)
      if (!voice) {
        voice = voiceList.find(v => v.lang.startsWith('ar'));
        if (voice) {
          console.log(`Found Arabic voice with partial match: ${voice.lang} (${voice.name})`);
        }
      }
      
      if (!voice) {
        console.warn('No Arabic voice found. Available Arabic voices:', 
          voiceList.filter(v => v.lang.startsWith('ar')).map(v => `${v.name} (${v.lang})`));
        console.warn('Your system may not have Arabic text-to-speech voices installed.');
      } else {
        console.log('Selected Arabic voice:', voice.name, voice.lang);
      }
      
      return voice || voiceList.find(v => v.default) || voiceList[0];
    }

    // Try exact match first (e.g., en-US)
    let voice = voiceList.find(v => v.lang === languageCode);
    
    // If no exact match, try language without region (e.g., en)
    if (!voice) {
      const baseLanguage = languageCode.split('-')[0];
      voice = voiceList.find(v => v.lang.startsWith(baseLanguage));
    }
    
    // Fallback to default voice
    if (!voice) {
      voice = voiceList.find(v => v.default) || voiceList[0];
    }

    console.log('Selected voice:', voice?.name, voice?.lang);
    return voice;
  }, []);

  // Stop current speech
  const stop = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  // Clean text for speaking (remove markdown, HTML, etc.)
  const cleanTextForSpeech = useCallback((text) => {
    if (!text) return '';
    
    let cleanText = text;
    
    // Remove think tags and their content
    cleanText = cleanText.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // Remove HTML tags
    cleanText = cleanText.replace(/<[^>]*>/g, '');
    
    // Remove markdown formatting
    cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    cleanText = cleanText.replace(/\*(.*?)\*/g, '$1'); // Italic
    cleanText = cleanText.replace(/`(.*?)`/g, '$1'); // Inline code
    cleanText = cleanText.replace(/```[\s\S]*?```/g, '[Code block]'); // Code blocks
    cleanText = cleanText.replace(/#{1,6}\s*(.*)/g, '$1'); // Headers
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
    
    // Clean up extra whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    return cleanText;
  }, []);

  // Check browser support and load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Try to select a voice based on current language setting
        const savedLanguage = localStorage.getItem('voiceLanguage') || 'en-US';
        const preferredVoice = findBestVoice(availableVoices, savedLanguage);
        setSelectedVoice(preferredVoice);
      };

      // Load voices immediately and on voiceschanged event
      loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    } else {
      console.warn('Text-to-speech not supported in this browser');
      setIsSupported(false);
    }
  }, [findBestVoice]);

  // Listen for voice language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail.language;
      if (voices.length > 0) {
        const newVoice = findBestVoice(voices, newLanguage);
        setSelectedVoice(newVoice);
        console.log('TTS voice updated for language:', newLanguage);
      }
    };

    window.addEventListener('voiceLanguageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('voiceLanguageChanged', handleLanguageChange);
    };
  }, [voices, findBestVoice]);

  // Speak the given text
  const speak = useCallback((text) => {
    if (!isSupported || !text) {
      console.warn('Text-to-speech not available or no text provided');
      return;
    }

    // Stop any current speech
    stop();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) {
      console.warn('No text to speak after cleaning');
      return;
    }

    // Use the manually selected language
    const languageToUse = localStorage.getItem('voiceLanguage') || 'en-US';

    // Find the appropriate voice for the language
    const voiceForLanguage = findBestVoice(voices, languageToUse);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set voice if available
    if (voiceForLanguage) {
      utterance.voice = voiceForLanguage;
      console.log('Using voice:', voiceForLanguage.name, 'for language:', languageToUse);
    } else if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using default selected voice:', selectedVoice.name);
    }
    
    // Configure speech parameters
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('Started speaking:', cleanText.substring(0, 50) + '...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      console.log('Finished speaking');
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      console.error('Speech synthesis error:', event.error);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, cleanTextForSpeech, voices, findBestVoice, stop]);

  // Toggle speech (speak if not speaking, stop if speaking)
  const toggleSpeech = useCallback((text) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  }, [isSpeaking, speak, stop]);

  return {
    speak,
    stop,
    toggleSpeech,
    isSpeaking,
    isSupported,
    voices,
    selectedVoice
  };
};

export default useTextToSpeech; 