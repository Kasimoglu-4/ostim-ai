import React from 'react';
import ProfileMenu from './ProfileMenu';

const SidebarFooter = ({ 
  collapsed,
  isProfileMenuOpen,
  maskedEmail,
  onToggleProfileMenu,
  onCloseProfileMenu,
  onEmailClick,
  onSettings,
  onContactUs,
  onLogout
}) => {
  const handleClickOutside = () => {
    if (isProfileMenuOpen) {
      onCloseProfileMenu();
    }
  };

  if (collapsed) {
    return (
      <div className="collapsed-item profile-container">
        <div 
          className="profile-icon" 
          onClick={(e) => {
            e.stopPropagation();
            onToggleProfileMenu();
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6.16406 18.5C7.96859 16.5125 9.89543 15.5 12 15.5C14.1046 15.5 16.0314 16.5125 17.8359 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        
        <ProfileMenu
          isOpen={isProfileMenuOpen}
          onClose={onCloseProfileMenu}
          maskedEmail={maskedEmail}
          onEmailClick={onEmailClick}
          onSettings={onSettings}
          onContactUs={onContactUs}
          onLogout={onLogout}
          collapsed={true}
        />
      </div>
    );
  }

  return (
    <div className="sidebar-footer" onClick={handleClickOutside}>
      <div className="profile-section">
        <div className="profile-button" onClick={(e) => {
          e.stopPropagation();
          onToggleProfileMenu();
        }}>
          <div className="profile-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6.16406 18.5C7.96859 16.5125 9.89543 15.5 12 15.5C14.1046 15.5 16.0314 16.5125 17.8359 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="profile-text">My Profile</span>
        </div>
        
        <ProfileMenu
          isOpen={isProfileMenuOpen}
          onClose={onCloseProfileMenu}
          maskedEmail={maskedEmail}
          onEmailClick={onEmailClick}
          onSettings={onSettings}
          onContactUs={onContactUs}
          onLogout={onLogout}
          collapsed={false}
        />
      </div>
    </div>
  );
};

export default SidebarFooter; 