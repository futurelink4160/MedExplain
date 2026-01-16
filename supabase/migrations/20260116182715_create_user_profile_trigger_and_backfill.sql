/*
  # Create User Profile Auto-Creation Trigger and Backfill

  1. New Functions
    - `create_user_profile()` - Automatically creates a user profile when a new user signs up
  
  2. New Triggers
    - `on_auth_user_created_profile` - Triggers profile creation on auth.users INSERT
  
  3. Data Migration
    - Backfill missing user_profiles for all existing users
    - Backfill missing user_subscriptions for any users without them
  
  4. Purpose
    - Ensures every user has both a profile and subscription record
    - Fixes the issue where existing users have subscriptions but no profiles
    - Provides automatic profile creation for all future user signups
*/

-- Create function to automatically create user profile for new users
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name, notification_preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
    '{"email": true, "push": false}'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile') THEN
    CREATE TRIGGER on_auth_user_created_profile
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_user_profile();
  END IF;
END $$;

-- Backfill user_profiles for all existing users who don't have one
INSERT INTO user_profiles (user_id, display_name, notification_preferences)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', NULL),
  '{"email": true, "push": false}'::jsonb
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Backfill user_subscriptions for any users who might not have one (safety check)
INSERT INTO user_subscriptions (user_id, plan_type, status, queries_per_month_limit, queries_used_this_month)
SELECT 
  au.id,
  'free',
  'active',
  50,
  0
FROM auth.users au
LEFT JOIN user_subscriptions us ON au.id = us.user_id
WHERE us.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;