import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';

// Styled components - styles are co-located with component
const InputContainer = styled.div`
  padding: 0 0 10px 0;
  background-color: #1d2029;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  ${props => props.mode === 'welcome' && css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 100%;
  `}
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  align-items: center;
  
  ${props => props.mode === 'welcome' && css`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `}
  
  ${props => props.mode === 'conversation' && css`
    max-width: 790px;
    width: 790px;
    position: relative;
  `}
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  
  ${props => props.mode === 'welcome' && css`
    width: 661px;
    height: 111px;
    border-radius: 25px;
    border: 1px solid var(--border-color);
    background-color: var(--tertiary-bg);
    margin: 0 auto;
  `}
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 50px;
  max-height: 150px;
  padding: 16px 16px 60px 16px;
  border-radius: 25px;
  font-size: 16px;
  line-height: 20px;
  resize: none;
  outline: none;
  font-family: inherit;
  background-color: #262a36;
  color: var(--primary-color);
  transition: all 0.3s;
  overflow-y: auto;
  border: none;
  
  ${props => props.mode === 'welcome' && css`
    height: 111px;
    background-color: transparent;
    border: none;
  `}
  
  ${props => props.mode === 'conversation' && css`
    height: auto;
    min-height: 60px;
    border: 1px solid var(--border-color);
    transition: height 0.1s ease;
  `}
  
  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
  }
  
  &:disabled {
    background-color: var(--secondary-bg);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ModelButtons = styled.div`
  position: absolute;
  bottom: 1px;
  left: 11px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #262a36;
  padding: 13px 20px 7px;
  overflow: hidden;
  border-radius: 0 0 22px 24px;
  margin-left: -10px;
  width: 99%;
`;

const ModelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: transparent;
  color: var(--secondary-color);
  border: none;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(124, 58, 237, 0.1);
    border-color: var(--accent-color);
    color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  ${props => props.active && css`
    color: white;
    
    ${props.variant === 'purple' && css`
      background-color: #5A4FCF;
    `}
    
    ${props.variant === 'blue' && css`
      background-color: #2191DB;
    `}
  `}
`;

const ActionButtons = styled.div`
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UploadButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background-color: transparent;
  color: var(--secondary-color);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: transparent;
    border-color: transparent;
    color: var(--primary-color);
  }
`;

const SendButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--accent-hover);
  }
  
  &:disabled {
    background-color: var(--disabled-color);
    color: var(--secondary-color);
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

const TextAreaInput = ({ 
  mode = 'conversation',
  onSendMessage, 
  isLoading, 
  selectedModel,
  onChangeModel,
  onStopGeneration
}) => {
  const [message, setMessage] = useState('');
  const textAreaRef = useRef(null);

  // Component logic remains the same...
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) {
      onStopGeneration?.();
      return;
    }
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <InputContainer mode={mode}>
      <Form onSubmit={handleSubmit} mode={mode}>
        <InputWrapper mode={mode}>
          <Textarea
            ref={textAreaRef}
            mode={mode}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${selectedModel.includes('coder') ? 'DeepSeek Coder' : 'DeepSeek R1 1.5B'}...`}
            disabled={isLoading}
          />
          
          <ModelButtons>
            <ModelButton 
              type="button" 
              active={selectedModel === 'deepseek-r1:1.5b'}
              variant="purple"
              onClick={() => onChangeModel('deepseek-r1:1.5b')}
              disabled={isLoading}
            >
              <span>🟣</span>
              <span>DeepSeek R1</span>
            </ModelButton>
            <ModelButton 
              type="button" 
              active={selectedModel === 'deepseek-coder:latest'}
              variant="blue"
              onClick={() => onChangeModel('deepseek-coder:latest')}
              disabled={isLoading}
            >
              <span>🔵</span>
              <span>DeepSeek Coder</span>
            </ModelButton>
          </ModelButtons>
          
          <ActionButtons>
            <UploadButton type="button" disabled={isLoading}>
              📎
            </UploadButton>
            <SendButton 
              type="submit" 
              disabled={!message.trim() && !isLoading}
            >
              {isLoading ? '⏹️' : '⬆️'}
            </SendButton>
          </ActionButtons>
        </InputWrapper>
      </Form>
    </InputContainer>
  );
};

export default TextAreaInput; 