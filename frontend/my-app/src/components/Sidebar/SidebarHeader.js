import React from 'react';
import Logo from './Logo';
import Switch from './Switch';

const SidebarHeader = ({ collapsed, onToggleSidebar, onGoToWelcome }) => {
  return (
    <div className="sidebar-header">
      <div onClick={onGoToWelcome} className="logo-clickable">
        <Logo collapsed={collapsed} />
      </div>
      <div className="toggle-sidebar-wrapper">
        <Switch isChecked={collapsed} onChange={onToggleSidebar} />
      </div>
    </div>
  );
};

export default SidebarHeader; 