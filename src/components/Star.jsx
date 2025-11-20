// src/components/Star.jsx - FIXED CRASH
import React, { useState, useEffect, useRef } from 'react';
import { PositionManager } from '../utils/positionManager';
import { AppSettings } from '../config/settings';
import './Star.css';

export default function Star({ user, isCurrentUser, onClick, isNewLogin = false, allUsers = [] }) {
  // FIX: Ensure position always has valid defaults
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [showGlow, setShowGlow] = useState(false);
  const targetPositionRef = useRef({ x: 50, y: 50 }); // FIX: Default position
  const animationFrameRef = useRef(null);
  const spawnStartTimeRef = useRef(null);
  const hasCompletedSpawnRef = useRef(false);
  const isAnimatingRef = useRef(false);

  // Debug: log when star component renders
  useEffect(() => {
    console.log(`⭐ Star component mounted for: ${user.email}`, {
      isCurrentUser,
      isNewLogin,
      online: user.online,
      hasCompletedSpawn: hasCompletedSpawnRef.current
    });
  }, [user.email, isCurrentUser, isNewLogin, user.online]);

  // Initialize position when user data is available - WITH SAFETY
  useEffect(() => {
  const initializePosition = async () => {
    if (user?.id) {
      console.log(`🎯 Initializing DB position for: ${user.email}`);
      
      try {
        // Get position from database
        const position = await PositionManager.getOrAssignPosition(user.id, user.email);
        
        // FIX: Ensure position is valid
        if (!position || typeof position.x === 'undefined' || typeof position.y === 'undefined') {
          console.warn(`⚠️ Invalid position from DB for ${user.email}, using fallback`);
          targetPositionRef.current = { x: 50, y: 50 };
          setPosition({ x: 50, y: 50 });
          return;
        }
        
        targetPositionRef.current = position;
        console.log(`📍 Final DB position for ${user.email}:`, position);
        
        // Set position immediately if not new login
        if (!isNewLogin || hasCompletedSpawnRef.current) {
          setPosition(position);
        }
      } catch (error) {
        console.error(`❌ Failed to get position for ${user.email}:`, error);
        // Use fallback
        targetPositionRef.current = { x: 50, y: 50 };
        setPosition({ x: 50, y: 50 });
      }
    }
  };

  initializePosition();
}, [user?.id, user?.email, isNewLogin]);

  // ... rest of the useEffect hooks remain the same

  const handleClick = (e) => {
    e.stopPropagation();
    console.log(`🖱️ Star clicked: ${user.email}`);
    onClick(user);
  };

  const starSize = isCurrentUser ? AppSettings.STARS.CURRENT_USER_SIZE : AppSettings.STARS.SIZE;
  const starClass = `star ${isCurrentUser ? 'current-user' : ''} ${showGlow ? 'glow' : ''} ${user.online ? 'online' : 'offline'}`;

  // FIX: Safe position access
  const safePosition = position || { x: 50, y: 50 };

  console.log(`🎨 Rendering star for ${user.email} at position:`, safePosition, `Class: ${starClass}`);

  return (
    <div 
      className={starClass}
      style={{
        left: `${safePosition.x}%`,
        top: `${safePosition.y}%`,
        width: `${starSize}px`,
        height: `${starSize}px`,
        '--star-color': user.color || '#ffffff',
        '--star-size': `${starSize}px`
      }}
      onClick={handleClick}
      title={user.email}
    >
      <div className="star-shape"></div>
      {showGlow && <div className="glow-effect"></div>}
    </div>
  );
}