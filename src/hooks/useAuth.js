import { useEffect, useRef, useState } from "react";
import { supabase, supabaseService } from "../lib/supabase";

/**
 * Authentication hook for managing user session and online status
 * 
 * @returns {Object} Auth state and methods
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSigningOutRef = useRef(false);
  const hasSentJoinMessageRef = useRef(false);

  // System message function
  const sendSystemMessage = async (content, type = 'info') => {
    try {
      await supabase
        .from('chat_messages')
        .insert({
          sender_email: 'system',
          sender_id: '00000000-0000-0000-0000-000000000000',
          content: content,
          type: type,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  };

  // Mark user online function
  const markUserOnline = async (authUser, fetchAllUsers) => {
    try {
      const email = (authUser.email || "").toLowerCase();
      const { error } = await supabase.rpc("get_or_create_user_position", {
        p_user_id: authUser.id,
        p_email: email,
      });
      if (error) throw error;
      
      if (fetchAllUsers) {
        await fetchAllUsers();
      }

      if (!hasSentJoinMessageRef.current) {
        await sendSystemMessage(`${authUser.email} joined the chat`, 'join');
        hasSentJoinMessageRef.current = true;
      }
    } catch (e) {
      console.error("markUserOnline error", e);
    }
  };

  // Mark user offline function
  const markUserOfflineViaService = async (email, fetchAllUsers) => {
    try {
      await supabaseService.rpc("mark_user_offline_by_email", { user_email: email });
      
      if (fetchAllUsers) {
        await fetchAllUsers();
      }
    } catch (e) {
      console.error("markUserOfflineViaService error", e);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (event === 'SIGNED_IN' && currentUser) {
          // User just signed in
          hasSentJoinMessageRef.current = false;
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          hasSentJoinMessageRef.current = false;
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    setUser,
    loading,
    setLoading,
    isSigningOutRef,
    hasSentJoinMessageRef,
    markUserOnline,
    markUserOfflineViaService,
    sendSystemMessage
  };
}