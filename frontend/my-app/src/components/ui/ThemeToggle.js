import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

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

  return (
    <div className="theme-toggle-container">
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
  );
};

export default ThemeToggle; 