// src/components/CosmicSky.jsx
import React, { useState, useEffect } from 'react';
import Star from './Star';
import UserPopup from './UserPopup';
import './CosmicSky.css';

export default function CosmicSky({ currentUser, users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [backgroundStars, setBackgroundStars] = useState([]);
  const [newLoginIds, setNewLoginIds] = useState(new Set());

  console.log('CosmicSky users:', users); // Debug log

  // Generate background stars
  useEffect(() => {
    const stars = Array.from({ length: 150 }, (_, i) => ({
      id: `bg-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3
    }));
    setBackgroundStars(stars);
  }, []);

  // Track new logins
  useEffect(() => {
    const currentUserIds = new Set(users.map(u => u.id));
    const newLogins = users.filter(user => 
      user.online && !newLoginIds.has(user.id) && user.id !== currentUser?.id
    );
    
    if (newLogins.length > 0) {
      setNewLoginIds(prev => new Set([...prev, ...newLogins.map(u => u.id)]));
      
      setTimeout(() => {
        setNewLoginIds(prev => {
          const newSet = new Set(prev);
          newLogins.forEach(user => newSet.delete(user.id));
          return newSet;
        });
      }, 3000);
    }
  }, [users]);

  const handleStarClick = (user) => {
    setSelectedUser(user);
  };

  const handleClosePopup = () => {
    setSelectedUser(null);
  };

  return (
    <div className="cosmic-sky">
      {/* Background Stars */}
      <div className="background-stars">
        {backgroundStars.map(star => (
          <div
            key={star.id}
            className="background-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity
            }}
          />
        ))}
      </div>

      {/* User Stars */}
      <div className="user-stars">
        {users.length > 0 ? (
          users.map(user => (
            <Star
              key={user.id}
              user={user}
              isCurrentUser={currentUser?.id === user.id}
              isNewLogin={newLoginIds.has(user.id)}
              onClick={handleStarClick}
            />
          ))
        ) : (
          <div className="no-users-message">
            No users online
            <br />
            <small>Users: {users.length}</small>
          </div>
        )}
      </div>

      {/* User Popup */}
      {selectedUser && (
        <UserPopup user={selectedUser} onClose={handleClosePopup} />
      )}
    </div>
  );
}