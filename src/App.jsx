// src/App.jsx - ENHANCED ERROR HANDLING
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import useAuth from './hooks/useAuth';
import AuthPage from './components/AuthPage';
import CosmicSky from './components/CosmicSky';
import { AppSettings } from './config/settings';
import { PositionManager } from './utils/positionManager';
import './App.css';

function App() {
  const { 
    user, 
    loading, 
    markUserOnline,
    markUserOfflineViaService
  } = useAuth();

  const [users, setUsers] = useState([]);
  const isSigningOutRef = useRef(false);

  // Enhanced fetch all users with better error handling
  const fetchAllUsers = async () => {
    try {
      console.log('🔄 fetchAllUsers: Starting database query...');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ fetchAllUsers - Database error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        setUsers([]);
        return;
      }
      
      console.log(`✅ fetchAllUsers - Success! Found ${data?.length || 0} users`);
      
      if (data && data.length > 0) {
        const onlineCount = data.filter(u => u.online).length;
        console.log(`📊 Online users: ${onlineCount}/${data.length}`);
        
        data.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} | Online: ${user.online} | Created: ${new Date(user.created_at).toLocaleTimeString()}`);
        });
      } else {
        console.log('📊 No users found in database');
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('❌ fetchAllUsers - Unexpected error:', error);
      setUsers([]);
    }
  };

  // Handle Google Sign In
  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error.message);
      alert('Error signing in. Please try again.');
    }
  };

  // Handle Sign Out
 const handleSignOut = async () => {
  console.log('🔄 Starting sign out process...');
  
  try {
    // Get the current user from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;
    
    if (currentUser) {
      console.log('👤 Signing out user:', currentUser.email);
      
      // Mark user as offline in database
      const { error: dbError } = await supabase
        .from('user_profiles')
        .update({ 
          online: false, 
          last_seen: new Date().toISOString() 
        })
        .eq('id', currentUser.id);
        
      if (dbError) {
        console.error('❌ Failed to update user offline status:', dbError);
      } else {
        console.log('✅ User marked as offline in database');
      }
    }
    
    // Use regular signOut without global scope
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Supabase sign out error:', error);
      throw error;
    }
    
    console.log('✅ Successfully signed out');
    
  } catch (error) {
    console.error('❌ Sign out failed:', error);
    // Don't show alert for minor logout issues
    console.log('⚠️ Sign out completed with minor issues');
  }
};

  useEffect(() => {
  // Initialize any persistent systems
  console.log('🚀 App initializing...');
  
  return () => {
    console.log('🧹 App cleaning up...');
  };
}, []);

  // Set up user and fetch users when authenticated
  useEffect(() => {
    if (user && !isSigningOutRef.current) {
      console.log('🔐 User authenticated, setting up...');
      console.log('👤 Current user:', user.email, user.id);
      
      // Mark user online and setup profile
      markUserOnline(user, fetchAllUsers);
      
      // Initial fetch after a short delay
      const initialFetch = setTimeout(() => {
        console.log('⏰ Performing initial user fetch...');
        fetchAllUsers();
      }, 1000);
      
      // Set up polling as fallback
      const interval = setInterval(() => {
        console.log('🔄 Polling for user updates...');
        fetchAllUsers();
      }, AppSettings.REALTIME.USER_UPDATE_INTERVAL);
      
      return () => {
        clearTimeout(initialFetch);
        clearInterval(interval);
        console.log('🧹 Cleaned up timers');
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner"></div>
          <p>Loading CosmicFire...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSignIn={handleSignIn} />;
  }

  const onlineUsers = users.filter(u => u.online);
  console.log(`🎯 App rendering - Online users: ${onlineUsers.length}, Total users: ${users.length}`);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="flex items-center gap-3">
            <h1 className="app-title">CosmicFire</h1>
            <span className="online-status">
              {onlineUsers.length} Online
            </span>
          </div>
          
          <div className="user-controls">
            <div className="text-right">
              <p className="user-email">{user.email}</p>
              <p className="text-xs text-gray-400">Connected to the cosmos</p>
            </div>
            <button
              onClick={handleSignOut}
              className="signout-btn"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="main-content">
        <CosmicSky 
          currentUser={user} 
          users={users} // Pass ALL users, let CosmicSky filter online ones
          fetchAllUsers={fetchAllUsers}
        />
      </main>
    </div>
  );
}

export default App;