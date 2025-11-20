import React, { useState, useEffect } from 'react'; // Add useEffect
import { supabase } from '../lib/supabase';
import './MessageInput.css';

export default function MessageInput({ currentUser, onMessageSent }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  // Add useEffect to continuously update cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const checkCooldown = async () => {
    try {
      console.log('⏳ Checking cooldown for user:', currentUser.id);
      const { data, error } = await supabase
        .rpc('can_send_message', { user_uuid: currentUser.id });
      
      if (error) {
        console.error('Cooldown check error:', error);
        return false;
      }
      
      console.log('✅ Cooldown result:', data);
      return data;
    } catch (err) {
      console.error('Cooldown error:', err);
      return false;
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }
    
    if (message.length > 50) {
      setError('Message too long (max 50 characters)');
      return;
    }

    setError('');
    setIsSending(true);

    try {
      console.log('📤 Sending message:', message);

      // Check cooldown first
      const canSend = await checkCooldown();
      if (!canSend) {
        setCooldown(8); // Set 8 seconds cooldown
        setError(`Please wait 8 seconds before sending another message`);
        setIsSending(false);
        return;
      }

      // Insert into user_messages for rate limiting
      console.log('📝 Inserting into user_messages...');
      const { error: rateError } = await supabase
        .from('user_messages')
        .insert({
          user_id: currentUser.id,
          content: message
        });

      if (rateError) throw rateError;

      // Insert into chat_messages for display
      console.log('💬 Inserting into chat_messages...');
      const { error: chatError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          sender_email: currentUser.email,
          content: message,
          type: 'message',
          visible_until: new Date(Date.now() + 5000).toISOString()
        });

      if (chatError) throw chatError;

      console.log('✅ Message sent successfully!');
      setMessage('');
      setCooldown(8); // Start cooldown timer
      onMessageSent?.();

    } catch (error) {
      console.error('❌ Message send failed:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Send a peaceful message... (50 chars)"}
          disabled={isSending || cooldown > 0}
          maxLength={50}
          className="message-input"
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim() || isSending || cooldown > 0}
          className="send-button"
        >
          {isSending ? '⏳' : cooldown > 0 ? `${cooldown}s` : '↑'}
        </button>
      </div>
      
      <div className="message-info">
        <span className="char-count">{message.length}/50</span>
        {cooldown > 0 && (
          <span className="cooldown">Next message in {cooldown}s</span>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}