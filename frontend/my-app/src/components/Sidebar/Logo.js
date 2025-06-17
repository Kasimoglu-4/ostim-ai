import React from 'react';
import '../../styles/Logo.css';

const Logo = ({ collapsed }) => {
  return (
    <div className="app-logo">
      {!collapsed && <span className="logo-text">OSTIM AI</span>}
      {collapsed && (
        <div className="logo-icon">
          <img src="https://www.bizimlebasvur.com/wp-content/uploads/2023/07/Ostim-Teknik-Universitesi.webp" alt="Ostim Teknik Universitesi Logo" style={{ height: 32, width: 'auto', display: 'block' }} />
        </div>
      )}
    </div>
  );
};

export default Logo; 