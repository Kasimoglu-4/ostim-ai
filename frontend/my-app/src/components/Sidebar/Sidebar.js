import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Components
import ConversationList from './ConversationList';
import SettingsModal from './SettingsModal';
import SidebarHeader from './SidebarHeader';
import SidebarFooter from './SidebarFooter';
import NewChatButton from './NewChatButton';
import SmartSearch from './SmartSearch';
import Logo from './Logo';
import Switch from './Switch';

// Hooks and utilities
import { useSidebarState } from '../../hooks/useSidebarState';
import { useUserData } from '../../hooks/useUserData';
import { logout } from '../../services/auth';

// Styles
import '../../styles/Sidebar.css';

const Sidebar = ({ 
  conversations, 
  currentConversationId, 
  onSelect, 
  onNewChat,
  onDelete,
  onDeleteAll,
  onEditTitle,
  onTestFeedback
}) => {
  const navigate = useNavigate();
  const { state, actions } = useSidebarState();
  const { maskedEmail } = useUserData();

  const { 
    isSidebarCollapsed, 
    isProfileMenuOpen, 
    showSettingsModal 
  } = state;

  const {
    toggleSidebar,
    toggleProfileMenu,
    openSettingsModal,
    closeSettingsModal,
    closeProfileMenu
  } = actions;

  // State for highlighting conversations from search results
  const [highlightedConversationId, setHighlightedConversationId] = useState(null);

  // Enhanced onSelect function to handle highlighting
  const handleSelectConversation = (conversationId, shouldHighlight = false, searchCtx = null) => {
    if (shouldHighlight) {
      setHighlightedConversationId(conversationId);
      // Clear highlight after a delay
      setTimeout(() => {
        setHighlightedConversationId(null);
      }, 2500);
    }
    onSelect(conversationId, searchCtx);
  };

  // Event handlers
  const handleSettings = () => {
    console.log('Settings clicked');
    openSettingsModal();
  };

  const handleContactUs = () => {
    console.log('Contact us clicked');
    closeProfileMenu();
  };

  const handleLogout = () => {
    logout();
    closeProfileMenu();
    navigate('/login');
  };

  const handleEmailClick = () => {
    openSettingsModal();
  };

  const goToWelcomePage = () => {
    onSelect(null);
  };

  const handleClickOutside = () => {
    if (isProfileMenuOpen) {
      closeProfileMenu();
    }
  };

  // Collapsed sidebar layout
  if (isSidebarCollapsed) {
    return (
      <div className="sidebar collapsed">
        <div className="collapsed-sidebar-content">
          {/* Logo - Toggle sidebar when collapsed */}
          <div className="collapsed-item">
            <div className="collapsed-logo" onClick={toggleSidebar}>
              <Logo collapsed={true} />
            </div>
          </div>
          
          {/* Toggle button */}
          <div className="collapsed-item">
            <div className="toggle-sidebar-wrapper">
              <Switch isChecked={true} onChange={toggleSidebar} />
            </div>
          </div>
          
          {/* New chat button */}
          <NewChatButton collapsed={true} onNewChat={onNewChat} />
          
          {/* Smart Search - compact version for collapsed sidebar */}
          <div className="collapsed-item">
            <SmartSearch 
              currentConversationId={currentConversationId}
              onSelectConversation={(id, searchCtx) => handleSelectConversation(id, true, searchCtx)}
              collapsed={true}
            />
          </div>
          
          {/* Profile section */}
          <SidebarFooter
            collapsed={true}
            isProfileMenuOpen={isProfileMenuOpen}
            maskedEmail={maskedEmail}
            onToggleProfileMenu={toggleProfileMenu}
            onCloseProfileMenu={closeProfileMenu}
            onEmailClick={handleEmailClick}
            onSettings={handleSettings}
            onContactUs={handleContactUs}
            onLogout={handleLogout}
          />
        </div>
        
        {showSettingsModal && (
          <SettingsModal 
            onClose={closeSettingsModal} 
            onDeleteAllConversations={onDeleteAll} 
          />
        )}
      </div>
    );
  }

  // Expanded sidebar layout
  return (
    <div className="sidebar" onClick={handleClickOutside}>
      <SidebarHeader 
        collapsed={false}
        onToggleSidebar={toggleSidebar}
        onGoToWelcome={goToWelcomePage}
      />
      
      <NewChatButton collapsed={false} onNewChat={onNewChat} />
      
      <SmartSearch 
        currentConversationId={currentConversationId}
        onSelectConversation={(id, searchCtx) => handleSelectConversation(id, true, searchCtx)}
      />
      
      <ConversationList 
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelect}
        onDeleteConversation={onDelete}
        onRenameConversation={onEditTitle}
        highlightedConversationId={highlightedConversationId}
      />
      
      <SidebarFooter
        collapsed={false}
        isProfileMenuOpen={isProfileMenuOpen}
        maskedEmail={maskedEmail}
        onToggleProfileMenu={toggleProfileMenu}
        onCloseProfileMenu={closeProfileMenu}
        onEmailClick={handleEmailClick}
        onSettings={handleSettings}
        onContactUs={handleContactUs}
        onLogout={handleLogout}
      />

      {showSettingsModal && (
        <SettingsModal 
          onClose={closeSettingsModal} 
          onDeleteAllConversations={onDeleteAll} 
        />
      )}
    </div>
  );
};

export default Sidebar; 