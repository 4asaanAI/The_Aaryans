/*
  # Remove unique constraint from class_subjects table
  
  ## Changes
  - Drop the UNIQUE constraint on (class_id, subject_id) in class_subjects table
  - This allows multiple teachers to be assigned to the same subject in a class
  
  ## Notes
  - This enables multiple teachers per subject assignment
  - The application will handle duplicate prevention at the UI level if needed
*/

DO $$
BEGIN
  -- Drop the unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'class_subjects_class_id_subject_id_key'
  ) THEN
    ALTER TABLE class_subjects DROP CONSTRAINT class_subjects_class_id_subject_id_key;
  END IF;
END $$;