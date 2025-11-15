/*
  # Add Message Limit Column to Profiles
  
  1. Changes
    - Add `message_limit` column to profiles table
    - Default value: 100
    - Users can send messages if limit > 0
  
  2. Security
    - No RLS changes needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'message_limit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN message_limit integer DEFAULT 100;
  END IF;
END $$;