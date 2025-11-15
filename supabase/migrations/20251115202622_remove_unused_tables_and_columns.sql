/*
  # Remove Unused Tables and Columns

  1. Drop Tables
    - `gallery_images` - Unused gallery feature
    - `academic_years` - Unused academic years tracking
    - `academic_year_stats` - Unused statistics tracking

  2. Security
    - Clean up associated RLS policies
*/

DROP TABLE IF EXISTS academic_year_stats CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS gallery_images CASCADE;