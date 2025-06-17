import React from 'react';
import '../../styles/Switch.css';

const Switch = ({ isChecked, onChange }) => {
  return (
    <div className="switch-wrapper">
      <div>
        <input 
          type="checkbox" 
          className="check" 
          id="sidebar-toggle" 
          checked={isChecked}
          onChange={onChange}
        />
        <label htmlFor="sidebar-toggle" className="arrow-button">
          <svg xmlns="http://www.w3.org/2000/svg" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="2" 
               viewBox="0 0 24 24" 
               className={`arrow-icon ${isChecked ? 'arrow-flipped' : ''}`}>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </label>
      </div>
    </div>
  );
}

export default Switch; 