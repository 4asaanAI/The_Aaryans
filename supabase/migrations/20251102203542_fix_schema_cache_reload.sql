/*
  # Fix Schema Cache - Recreate Tables
  
  1. Changes
    - Drop and recreate chat tables to force PostgREST schema cache refresh
    - Preserve all RLS policies and permissions
  
  2. Security
    - Maintain all existing RLS policies
    - Preserve permissions for anon and authenticated roles
*/

-- Drop tables in correct order (respect foreign keys)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS school_data CASCADE;

-- Recreate school_data table
CREATE TABLE school_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recreate chat_sessions table
CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recreate chat_messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE school_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- School data policies
CREATE POLICY "Anyone can read school data"
  ON school_data FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert school data"
  ON school_data FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Chat sessions policies
CREATE POLICY "Anyone can create chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read chat sessions"
  ON chat_sessions FOR SELECT
  USING (true);

-- Chat messages policies
CREATE POLICY "Anyone can create chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read chat messages"
  ON chat_messages FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX idx_school_data_category ON school_data(category);
CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON school_data TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO anon, authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
