import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './MessageHistory.css';

export default function MessageHistory({ user, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserMessages();
    }
  }, [isOpen, user]);

  const fetchUserMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="message-history-sidebar">
      <div className="sidebar-header">
        <h3>Messages from {user.email.split('@')[0]}</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="messages-list">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="history-message">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {new Date(message.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}