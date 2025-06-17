import React, { useState, useEffect } from 'react';
import '../../styles/SettingsModal.css';
import { useTheme } from '../../contexts/ThemeContext';
import ChangePasswordModal from './ChangePasswordModal';
import { deleteAccount } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

const SettingsModal = ({ onClose, onDeleteAllConversations }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  // Voice recognition languages
  const voiceLanguages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', flag: '🇸🇦' },
    { code: 'ar-EG', name: 'Arabic (Egypt)', flag: '🇪🇬' },
    { code: 'ar-AE', name: 'Arabic (UAE)', flag: '🇦🇪' },
    { code: 'ar', name: 'Arabic (Standard)', flag: '🌍' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
    { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
    { code: 'no-NO', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'da-DK', name: 'Danish', flag: '🇩🇰' },
    { code: 'fi-FI', name: 'Finnish', flag: '🇫🇮' },
    { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' }
  ];

  // Load saved voice language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('voiceLanguage');
    if (savedLanguage) {
      setVoiceLanguage(savedLanguage);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageDropdown && !event.target.closest('.dropdown-selector')) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  // Save voice language to localStorage and update global voice recognition
  const handleLanguageChange = (languageCode) => {
    setVoiceLanguage(languageCode);
    localStorage.setItem('voiceLanguage', languageCode);
    setShowLanguageDropdown(false);
    
    // Update global voice recognition language if available
    if (window.voiceRecognition && window.voiceRecognition.setLanguage) {
      window.voiceRecognition.setLanguage(languageCode);
    }
    
    // Dispatch custom event for components to listen to language changes
    window.dispatchEvent(new CustomEvent('voiceLanguageChanged', { 
      detail: { language: languageCode, autoDetected: false } 
    }));
  };

  const getSelectedLanguage = () => {
    return voiceLanguages.find(lang => lang.code === voiceLanguage) || voiceLanguages[0];
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  const renderThemeIcon = (themeName) => {
    switch(themeName) {
      case 'light':
        return (
          <svg className="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'dark':
        return (
          <svg className="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'sepia':
        return (
          <svg className="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 8V12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleDeleteAllChats = () => {
    if (window.confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
      onDeleteAllConversations();
      onClose();
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await deleteAccount(user.email);
      
      // Clear all local user data
      localStorage.removeItem('user');
      localStorage.removeItem('conversations');
      localStorage.removeItem('currentConversationId');
      
      // Display success message
      alert('Your account has been successfully deleted.');
      
      // Close modal and navigate to login
      onClose();
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => handleTabChange('general')}
          >
            General
          </button>
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => handleTabChange('about')}
          >
            About
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="general-settings">
              <div className="settings-row">
                <div className="setting-label">Voice Recognition Language</div>
                <div className="dropdown-selector" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                  <div className="selected-option">
                    <span>{getSelectedLanguage().flag} {getSelectedLanguage().name}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {showLanguageDropdown && (
                    <div className="dropdown-options">
                      {voiceLanguages.map((lang) => (
                        <div 
                          key={lang.code}
                          className={`dropdown-option ${voiceLanguage === lang.code ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLanguageChange(lang.code);
                          }}
                        >
                          <span className="language-flag">{lang.flag}</span>
                          <span className="language-name">{lang.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="settings-row">
                <div className="setting-label">Theme</div>
                <div className="theme-segmented-control">
                  <button 
                    className={`theme-segment ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeSelect('light')}
                    aria-label="Light theme"
                  >
                    {renderThemeIcon('light')}
                  </button>
                  <button 
                    className={`theme-segment ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeSelect('dark')}
                    aria-label="Dark theme"
                  >
                    {renderThemeIcon('dark')}
                  </button>
                  <button 
                    className={`theme-segment ${theme === 'sepia' ? 'active' : ''}`}
                    onClick={() => handleThemeSelect('sepia')}
                    aria-label="Sepia theme"
                  >
                    {renderThemeIcon('sepia')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-settings">
              <div className="settings-row">
                <div className="setting-label">Email address</div>
                <div className="setting-value">{userEmail}</div>
              </div>
              
              <div className="settings-row">
                <div className="setting-label">Change password</div>
                <button className="settings-action-button" onClick={() => setShowChangePassword(true)}>Change</button>
              </div>

              <div className="settings-row">
                <div className="setting-label">Delete all chats</div>
                <button className="settings-action-button delete" onClick={handleDeleteAllChats}>Delete all</button>
              </div>

              <div className="settings-row">
                <div className="setting-label">Delete account</div>
                <button className="settings-action-button delete" onClick={handleDeleteAccount}>Delete</button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-settings">
              <div className="about-section">
                <h3 className="about-section-title">Ostim Teknik Üniversitesi</h3>
                <p className="about-section-content">
                  Ostim Teknik Üniversitesi, Türkiye'nin önde gelen teknik üniversitelerinden biridir. 
                  Üniversitemiz, yenilikçi eğitim yaklaşımları ve güçlü endüstri bağlantılarıyla 
                  öğrencilerine kapsamlı bir eğitim deneyimi sunmaktadır.
                </p>
                <p className="about-section-content">
                  Üniversitemiz, teknoloji ve inovasyon odaklı eğitim programlarıyla, 
                  geleceğin mühendislerini, bilim insanlarını ve teknoloji liderlerini 
                  yetiştirmeyi hedeflemektedir.
                </p>
              </div>
            </div>
          )}
        </div>
        {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      </div>
    </div>
  );
};

export default SettingsModal;