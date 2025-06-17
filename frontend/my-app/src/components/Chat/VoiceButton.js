import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Mic, MicOff, Stop } from '@mui/icons-material';
import styles from '../../styles/VoiceButton.module.css';

/**
 * Voice Recognition Button Component
 * Integrates with Ostim.AI's existing theme and styling system
 */
const VoiceButton = ({ 
  isListening, 
  isSupported, 
  error, 
  onToggle,
  disabled = false,
  size = 'medium'
}) => {
  // Determine button state and appearance
  const getButtonState = () => {
    if (!isSupported) {
      return {
        icon: <MicOff />,
        tooltip: 'Voice recognition not supported in this browser',
        className: styles.voiceButtonUnsupported,
        disabled: true
      };
    }
    
    if (error) {
      return {
        icon: <MicOff />,
        tooltip: `Voice recognition error: ${error}`,
        className: styles.voiceButtonError,
        disabled: true
      };
    }
    
    if (isListening) {
      return {
        icon: <Stop />,
        tooltip: 'Stop voice recognition',
        className: styles.voiceButtonListening,
        disabled: false
      };
    }
    
    return {
      icon: <Mic />,
      tooltip: 'Start voice recognition',
      className: styles.voiceButtonIdle,
      disabled: disabled
    };
  };

  const buttonState = getButtonState();

  return (
    <Box className={styles.voiceButtonContainer}>
      <Tooltip title={buttonState.tooltip} arrow placement="top">
        <span>
          <IconButton
            onClick={onToggle}
            disabled={buttonState.disabled}
            size={size}
            className={`${styles.voiceButton} ${buttonState.className}`}
            aria-label={buttonState.tooltip}
          >
            {buttonState.icon}
          </IconButton>
        </span>
      </Tooltip>
      
      {/* Listening indicator */}
      {isListening && (
        <Box className={styles.listeningIndicator}>
          <Box className={styles.pulseRing}></Box>
          <Box className={styles.pulseRing}></Box>
          <Box className={styles.pulseRing}></Box>
        </Box>
      )}
    </Box>
  );
};

export default VoiceButton; 