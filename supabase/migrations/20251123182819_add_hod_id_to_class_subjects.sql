/*
  # Add hod_id to class_subjects table

  1. Changes
    - Add `hod_id` column to `class_subjects` table
    - Add index for faster lookups
  
  2. Notes
    - This allows tracking which HOD assigned the subject to the class
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_subjects' AND column_name = 'hod_id'
  ) THEN
    ALTER TABLE class_subjects ADD COLUMN hod_id uuid REFERENCES profiles(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_class_subjects_hod ON class_subjects(hod_id);