/*
  # Add First and Last Name to User Profiles

  1. Changes
    - Add `first_name` column to `user_profiles` table (text, nullable)
    - Add `last_name` column to `user_profiles` table (text, nullable)
    - These fields will store user's first and last name collected during signup
    - `display_name` field remains for backwards compatibility and can be auto-generated

  2. Notes
    - Columns are nullable to support existing users without names
    - New signups will populate these fields
    - Migration is safe and won't affect existing data
*/

-- Add first_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN first_name text;
  END IF;
END $$;

-- Add last_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'last_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_name text;
  END IF;
END $$;