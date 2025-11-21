/*
  # Create password reset tokens table

  1. New Tables
    - `password_reset_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `token` (text, unique)
      - `method` (text - 'email' or 'phone')
      - `sent_to` (text - email or phone number)
      - `expires_at` (timestamptz)
      - `verified` (boolean)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `password_reset_tokens` table
    - Add policy for users to read their own tokens
*/

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  method text NOT NULL CHECK (method IN ('email', 'phone')),
  sent_to text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens"
  ON password_reset_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
  ON password_reset_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON password_reset_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);