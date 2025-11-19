import React, { useEffect } from 'react';
import './UserPopup.css';

export default function UserPopup({ user, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!user) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        
        <div className="user-info">
          <div 
            className="user-avatar"
            style={{ '--user-color': user.color }}
          ></div>
          <h3>{user.email}</h3>
          <div className={`user-status ${user.online ? 'online' : 'offline'}`}>
            {user.online ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className="user-stats">
          <div className="stat">
            <label>In Cosmos Since</label>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}