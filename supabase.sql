-- COMPLETE COSMICFIRE DATABASE SETUP - FIXED VERSION
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist
DROP TABLE IF EXISTS user_messages CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  current_position JSONB DEFAULT '{"x": 50, "y": 50}',
  color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'message',
  visible_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_messages table for rate limiting
CREATE TABLE user_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_online ON user_profiles(online);
CREATE INDEX idx_user_profiles_last_seen ON user_profiles(last_seen);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_visible_until ON chat_messages(visible_until);
CREATE INDEX idx_user_messages_user_created ON user_messages(user_id, created_at);

-- SIMPLE WORKING POSITION FUNCTION
CREATE OR REPLACE FUNCTION get_or_assign_user_position(
  user_id UUID,
  user_email TEXT
)
RETURNS JSONB AS $$
DECLARE
  current_pos JSONB;
  min_radius FLOAT := 20.0;
  max_radius FLOAT := 45.0;
  angle FLOAT;
  distance FLOAT;
  new_x FLOAT;
  new_y FLOAT;
BEGIN
  -- Check if user already has a position
  SELECT current_position INTO current_pos
  FROM user_profiles 
  WHERE id = user_id;
  
  -- If position exists and is valid, return it
  IF current_pos IS NOT NULL AND current_pos ? 'x' AND current_pos ? 'y' THEN
    RETURN current_pos;
  END IF;
  
  -- Generate random position around center (50,50)
  angle := random() * 2 * pi();
  distance := min_radius + (random() * (max_radius - min_radius));
  new_x := 50 + (distance * cos(angle));
  new_y := 50 + (distance * sin(angle));
  
  -- Ensure positions are within reasonable bounds
  new_x := GREATEST(10, LEAST(90, new_x));
  new_y := GREATEST(10, LEAST(90, new_y));
  
  current_pos := jsonb_build_object('x', new_x, 'y', new_y);
  
  -- Update user profile with the new position
  UPDATE user_profiles 
  SET current_position = current_pos
  WHERE id = user_id;
  
  RETURN current_pos;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can send message
CREATE OR REPLACE FUNCTION can_send_message(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_message_time TIMESTAMPTZ;
  rate_limit_minutes INTEGER := 30;
BEGIN
  SELECT created_at INTO last_message_time
  FROM user_messages 
  WHERE user_id = user_uuid 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF last_message_time IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXTRACT(EPOCH FROM (NOW() - last_message_time)) > (rate_limit_minutes * 60);
END;
$$ LANGUAGE plpgsql;

-- Function to mark user offline
CREATE OR REPLACE FUNCTION mark_user_offline(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET online = false, last_seen = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations for all users" ON user_profiles;
DROP POLICY IF EXISTS "Allow all operations for all users" ON chat_messages;
DROP POLICY IF EXISTS "Allow all operations for all users" ON user_messages;

-- Create policies (allow public access for this demo app)
CREATE POLICY "Allow all operations for all users" ON user_profiles
FOR ALL USING (true);

CREATE POLICY "Allow all operations for all users" ON chat_messages
FOR ALL USING (true);

CREATE POLICY "Allow all operations for all users" ON user_messages
FOR ALL USING (true);

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Insert some test users (optional)
-- INSERT INTO user_profiles (id, email, online, color) VALUES 
-- ('11111111-1111-1111-1111-111111111111', 'test1@example.com', true, '#ff6b6b'),
-- ('22222222-2222-2222-2222-222222222222', 'test2@example.com', true, '#4ecdc4');

-- Verify tables were created
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify real-time is enabled
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';


SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';