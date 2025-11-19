import React, { useEffect } from 'react';
import { supabase } from './lib/supabase';
import useAuth from './hooks/useAuth';
import AuthPage from './components/AuthPage';
import './App.css';

function App() {
  const { 
    user, 
    loading, 
    markUserOnline,
    markUserOfflineViaService,
    isSigningOutRef,
    hasSentJoinMessageRef
  } = useAuth();

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
      
      if (user?.email) {
        await markUserOfflineViaService(user.email);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      hasSentJoinMessageRef.current = false;
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  // Mark user as online when they authenticate
  useEffect(() => {
    if (user && !isSigningOutRef.current) {
      markUserOnline(user);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading CosmicFire...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              CosmicFire
            </h1>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              Online
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-gray-400">Welcome to the cosmos</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to CosmicFire</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Your celestial chat experience begins here. Connect with others across the cosmos.
          </p>
        </div>

        {/* Chat interface will go here */}
        <div className="max-w-4xl mx-auto bg-black/30 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
          <div className="text-center text-gray-400">
            <p>Chat interface coming soon...</p>
            <p className="text-sm mt-2">You're authenticated as {user.email}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;