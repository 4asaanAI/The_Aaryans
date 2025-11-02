/*
  # Add Insert Policy for School Data
  
  1. Changes
    - Add policy to allow anonymous users to insert school data
    - This is needed for initial data population from the frontend
  
  2. Security
    - Allows public insert access for school data initialization
    - Maintains existing read policy
*/

-- Add policy for inserting school data
CREATE POLICY "Anyone can insert school data"
  ON school_data FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
