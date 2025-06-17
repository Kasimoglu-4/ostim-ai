import React, { useRef, useEffect } from 'react';

const ProfileMenu = ({ 
  isOpen, 
  onClose, 
  maskedEmail, 
  onEmailClick, 
  onSettings, 
  onContactUs, 
  onLogout,
  collapsed = false 
}) => {
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`profile-dropdown ${collapsed ? 'collapsed-dropdown' : ''}`} 
      ref={profileDropdownRef} 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="profile-email" onClick={onEmailClick}>
        {maskedEmail}
      </div>
      <div className="dropdown-item" onClick={onSettings}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1428 17.2328 20.3363 17.7099 20.3363 18.2095C20.3363 18.7091 20.1428 19.1862 19.79 19.539C19.4372 19.8918 18.9601 20.0853 18.4605 20.0853C17.9609 20.0853 17.4838 19.8918 17.131 19.539L17.071 19.479C16.5888 19.0073 15.8681 18.8767 15.251 19.149C14.6747 19.3942 14.3009 19.9712 14.311 20.6V20.75C14.311 21.7446 13.5056 22.55 12.511 22.55C11.5165 22.55 10.711 21.7446 10.711 20.75V20.661C10.7066 19.997 10.2807 19.4085 9.66001 19.17C9.04292 18.8977 8.32233 19.0283 7.84001 19.5L7.78001 19.56C7.42718 19.9128 6.95011 20.1063 6.4505 20.1063C5.9509 20.1063 5.47382 19.9128 5.12101 19.56C4.76819 19.2072 4.57467 18.7301 4.57467 18.2305C4.57467 17.7309 4.76819 17.2538 5.12101 16.901L5.18101 16.841C5.65267 16.3588 5.78327 15.6381 5.51101 15.021C5.26578 14.4447 4.68879 14.0709 4.06001 14.081H3.91001C2.91545 14.081 2.11001 13.2756 2.11001 12.281C2.11001 11.2865 2.91545 10.481 3.91001 10.481H4.00001C4.66403 10.4766 5.25252 10.0507 5.49101 9.43C5.76327 8.8129 5.63267 8.09231 5.16101 7.61L5.10101 7.55C4.74819 7.19718 4.55467 6.7201 4.55467 6.2205C4.55467 5.7209 4.74819 5.24382 5.10101 4.891C5.45382 4.53818 5.9309 4.34466 6.4305 4.34466C6.9301 4.34466 7.40718 4.53818 7.76001 4.891L7.82001 4.951C8.30233 5.42266 9.02292 5.55326 9.64001 5.281C10.2163 5.03577 10.5901 4.45878 10.58 3.83V3.68C10.58 2.68544 11.3854 1.88 12.38 1.88C13.3746 1.88 14.18 2.68544 14.18 3.68V3.77C14.1701 4.39878 14.5439 4.97577 15.12 5.221C15.7371 5.49326 16.4577 5.36266 16.94 4.891L17 4.831C17.3528 4.47818 17.8299 4.28466 18.3295 4.28466C18.8291 4.28466 19.3062 4.47818 19.659 4.831C20.0118 5.18382 20.2053 5.6609 20.2053 6.1605C20.2053 6.6601 20.0118 7.13718 19.659 7.49L19.599 7.55C19.1273 8.03231 18.9967 8.7529 19.269 9.37C19.5124 9.94382 20.079 10.321 20.699 10.33H20.849C21.8436 10.33 22.649 11.1354 22.649 12.13C22.649 13.1246 21.8436 13.93 20.849 13.93H20.759C20.137 13.94 19.5704 14.3173 19.327 14.891L19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Settings</span>
      </div>
      <div className="dropdown-item" onClick={onContactUs}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Contact us</span>
      </div>
      <div className="dropdown-item" onClick={onLogout}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Log out</span>
      </div>
    </div>
  );
};

export default ProfileMenu; 