/*
  # Create Contact Inquiries Table

  1. New Tables
    - `contact_inquiries`
      - `id` (uuid, primary key) - Unique identifier for each inquiry
      - `name` (text) - Full name of the person submitting the inquiry
      - `email` (text) - Email address for contact
      - `phone` (text) - Phone number for contact
      - `created_at` (timestamptz) - Timestamp when the inquiry was submitted
  
  2. Security
    - Enable RLS on `contact_inquiries` table
    - Add policy for public to insert inquiries (anyone can submit a form)
    - Add policy for authenticated users to read all inquiries (for admin access)

  3. Notes
    - This table stores all contact form submissions from the school homepage
    - Phone field is optional to allow flexible form submissions
    - Created timestamp helps track when inquiries were submitted
*/

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact inquiry"
  ON contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all inquiries"
  ON contact_inquiries
  FOR SELECT
  TO authenticated
  USING (true);