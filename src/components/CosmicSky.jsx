// src/components/CosmicSky.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Star from './Star';
import UserPopup from './UserPopup';
import { PositionManager } from '../utils/positionManager';
import { AppSettings } from '../config/settings';
import './CosmicSky.css';
import FirewoodAnimation from './FirewoodAnimation';
import MessageTooltip from './MessageTooltip';
import MessageHistory from './MessageHistory';

export default function CosmicSky({ currentUser, users, fetchAllUsers }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [backgroundStars, setBackgroundStars] = useState([]);
  const [newLoginIds, setNewLoginIds] = useState(new Set());
  const [allUsers, setAllUsers] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);
  const [messageHistoryUser, setMessageHistoryUser] = useState(null);


  // Filter only online users for display - DEFINE THIS FIRST
  const onlineUsers = users ? users.filter(user => user.online) : [];

const handleNewMessage = async (payload) => {
  console.log('📢 New message event:', payload);
  
  if (payload.eventType === 'INSERT' && payload.new.type === 'message') {
    const messageUser = users.find(u => u.id === payload.new.user_id);
    if (messageUser) {
      // Get the user's current position
      const userPosition = await PositionManager.getOrAssignPosition(messageUser.id, messageUser.email);
      
      const newMessage = {
        id: payload.new.id + Date.now(), // Add timestamp to make unique
        message: payload.new,
        user: messageUser,
        position: userPosition || { x: 50, y: 50 }
      };
      
      console.log('💬 Adding tooltip message:', newMessage);
      setActiveMessages(prev => [...prev, newMessage]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        console.log('🕒 Auto-removing message:', newMessage.id);
        setActiveMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      }, AppSettings.MESSAGES.TOOLTIP_DURATION);
    }
  }
};

  // Add this function to remove expired messages
  const handleMessageExpire = (messageId) => {
    setActiveMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  // Add this function for message history clicks
  const handleMessageHistoryClick = (user) => {
    console.log('📖 Opening message history for:', user.email);
    setMessageHistoryUser(user);
  };

  // Debug: log everything
  useEffect(() => {
    console.log('🔭 CosmicSky - Current User:', currentUser?.email, currentUser?.id);
    console.log('🔭 CosmicSky - Received users prop:', users);
    console.log('🔭 CosmicSky - Users count:', users?.length);

    if (users && users.length > 0) {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} | Online: ${user.online} | ID: ${user.id}`);
      });
    } else {
      console.log('🔭 No users received in CosmicSky');
    }
  }, [users, currentUser]);

  // Store all users for position management
  useEffect(() => {
    if (users && users.length > 0) {
      setAllUsers(users);
      console.log('💾 Stored all users for position management:', users.length);
    }
  }, [users]);

  // Generate background stars
  useEffect(() => {
    const stars = Array.from({ length: AppSettings.STARS.BACKGROUND_STARS_COUNT }, (_, i) => ({
      id: `bg-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.3 + 0.1,
      twinkleSpeed: Math.random() * 20 + 10
    }));
    setBackgroundStars(stars);
  }, []);

  // Sync positions when users change - MOVED AFTER onlineUsers DEFINITION
  useEffect(() => {
    const syncPositions = async () => {
      if (onlineUsers.length > 0) {
        console.log('🔄 Syncing positions from database...');
        await PositionManager.getAllUserPositions();
      }
    };

    syncPositions();
  }, [onlineUsers.length]);

  // Track new logins
  useEffect(() => {
    if (users && users.length > 0) {
      console.log('👥 Online users for new login detection:', onlineUsers.length);

      // Only consider users as "new" if they're online AND we haven't seen them before
      const newLogins = onlineUsers.filter(user => {
        const isActuallyNew =
          !newLoginIds.has(user.id) &&
          user.id !== currentUser?.id &&
          user.online;

        if (isActuallyNew) {
          console.log(`🎯 ${user.email} is considered new login`);
        }

        return isActuallyNew;
      });

      if (newLogins.length > 0) {
        console.log('🎉 New login detected:', newLogins.map(u => u.email));
        setNewLoginIds(prev => new Set([...prev, ...newLogins.map(u => u.id)]));

        // Auto-remove from new login set after glow duration
        setTimeout(() => {
          setNewLoginIds(prev => {
            const newSet = new Set(prev);
            newLogins.forEach(user => newSet.delete(user.id));
            console.log('🕒 Removed users from new login set:', newLogins.map(u => u.email));
            return newSet;
          });
        }, AppSettings.STARS.GLOW_DURATION);
      }

      // Clean up positions for users who are no longer online
      const onlineUserIds = onlineUsers.map(u => u.id);
      PositionManager.cleanupOfflinePositions();
    }
  }, [users, currentUser, newLoginIds, onlineUsers]);

  useEffect(() => {
    if (!currentUser) return;

    console.log('📡 Setting up chat messages subscription...');

    const subscription = supabase
      .channel('chat_messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        handleNewMessage
      )
      .subscribe((status) => {
        console.log('💬 Chat messages subscription status:', status);
      });

    return () => {
      console.log('🧹 Unsubscribing from chat messages');
      subscription.unsubscribe();
    };
  }, [currentUser, users]);

  useEffect(() => {
    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        handleNewMessage
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [users]);

  // Real-time subscription
  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No current user, skipping real-time setup');
      return;
    }

    console.log('📡 Setting up real-time subscription...');

    const subscription = supabase
      .channel('user_presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
        },
        async (payload) => {
          console.log('📢 Real-time user event:', payload.eventType, payload.new?.email);

          // Sync positions when user data changes
          await PositionManager.getAllUserPositions();

          // Refresh user list
          setTimeout(() => {
            fetchAllUsers();
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time connected - listening for user changes');
        }
      });

    return () => {
      console.log('🧹 Unsubscribing from real-time');
      subscription.unsubscribe();
    };
  }, [currentUser, fetchAllUsers]);

  const handleStarClick = (user) => {
    console.log('⭐ Star clicked:', user.email);
    setSelectedUser(user);
  };

  const handleClosePopup = () => {
    setSelectedUser(null);
  };

  console.log('🎯 Final users to render:', onlineUsers.length);

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
              opacity: star.opacity,
              animationDuration: `${star.twinkleSpeed}s`
            }}
          />
        ))}
      </div>

      {/* Firewood Animation */}
      <FirewoodAnimation />

      {/* User Stars */}
      <div className="user-stars">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user, index) => {
            console.log(`🎨 Rendering star ${index + 1}/${onlineUsers.length}:`, user.email);
            return (
              <Star
                key={user.id}
                user={user}
                isCurrentUser={currentUser?.id === user.id}
                isNewLogin={newLoginIds.has(user.id)}
                onClick={handleStarClick}
                onMessageClick={handleMessageHistoryClick} // Make sure this is passed
                allUsers={onlineUsers}
              />
            );
          })
        ) : (
          <div className="no-users-message">
            🌌 The cosmos is quiet...
            <br />
            <small>Be the first star in the sky</small>
          </div>
        )}
      </div>

      {activeMessages.map(msg => (
  <MessageTooltip
    key={msg.id}
    message={msg.message}
    user={msg.user}
    position={msg.position}
    currentUser={currentUser}
    // Remove onExpire since we're handling removal in CosmicSky
  />
))}

      {/* Message history sidebar */}
      <MessageHistory
        user={messageHistoryUser}
        isOpen={!!messageHistoryUser}
        onClose={() => setMessageHistoryUser(null)}
      />

      {/* User Popup */}
      {selectedUser && (
        <UserPopup user={selectedUser} onClose={handleClosePopup} />
      )}
    </div>
  );
}