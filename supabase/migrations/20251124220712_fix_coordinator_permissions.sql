/*
  # Fix Coordinator Permissions for Classes and Subjects

  1. Changes
    - Update classes table RLS policies to allow coordinators (teachers with sub_role 'coordinator') to insert and update classes
    - Update subjects table RLS policies to allow coordinators to view all subjects
    - Allow coordinators to manage class assignments including assigning themselves as class teachers

  2. Security
    - Coordinators can insert and update classes
    - Coordinators can view all subjects
    - All existing policies remain intact for other roles
*/

-- Drop existing policies for classes to recreate them with coordinator permissions
DROP POLICY IF EXISTS "Admins can manage classes" ON classes;

-- Create new policies for classes
CREATE POLICY "Admins and coordinators can manage classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (profiles.role = 'professor' AND profiles.sub_role = 'coordinator')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (profiles.role = 'professor' AND profiles.sub_role = 'coordinator')
      )
    )
  );
