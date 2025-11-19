// src/components/Star.jsx
import React, { useState, useEffect } from 'react';
import './Star.css';

export default function Star({ user, isCurrentUser, onClick, isNewLogin = false }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isGlowing, setIsGlowing] = useState(false);
  const [showTwinkle, setShowTwinkle] = useState(isNewLogin);

  // Set initial position from user data
  useEffect(() => {
    if (user.current_position) {
      setPosition(user.current_position);
    }
  }, [user.current_position]);

  // Handle new login twinkle effect
  useEffect(() => {
    if (isNewLogin) {
      setShowTwinkle(true);
      const timer = setTimeout(() => {
        setShowTwinkle(false);
      }, 3000); // 3 second twinkle effect

      return () => clearTimeout(timer);
    }
  }, [isNewLogin]);

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(user);
  };

  const starClass = `star ${isCurrentUser ? 'current-user' : ''} ${showTwinkle ? 'twinkle' : ''} ${isGlowing ? 'glowing' : ''} ${user.online ? 'online' : 'offline'}`;

  return (
    <div 
      className={starClass}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        '--star-color': user.color || '#ffffff'
      }}
      onClick={handleClick}
      title={user.email}
    >
      <div className="star-core"></div>
      <div className="star-glow"></div>
      {showTwinkle && <div className="twinkle-effect"></div>}
    </div>
  );
}