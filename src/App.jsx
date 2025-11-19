import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import useAuth from './hooks/useAuth';
import AuthPage from './components/AuthPage';
import CosmicSky from './components/CosmicSky';
import './App.css';

function App() {
  const { 
    user, 
    loading, 
    markUserOnline
  } = useAuth();

  const [users, setUsers] = useState([]);
  const isSigningOutRef = useRef(false);

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.log('No users found yet, continuing...');
        setUsers([]);
        return;
      }
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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
    try {
      isSigningOutRef.current = true;
      
      if (user?.id) {
        // Mark user as offline in database
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            online: false, 
            last_seen: new Date().toISOString() 
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating offline status:', error);
        }
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUsers([]);
      
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  // Set up user and fetch users when authenticated
  useEffect(() => {
    if (user && !isSigningOutRef.current) {
      markUserOnline(user, fetchAllUsers);
      
      // Set up polling for user updates
      const interval = setInterval(fetchAllUsers, 3000);
      
      return () => clearInterval(interval);
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
        <CosmicSky currentUser={user} users={onlineUsers} />
      </main>
    </div>
  );
}

export default App;