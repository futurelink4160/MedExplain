/*
  # Update User Profile Trigger to Support First and Last Name

  1. Changes
    - Update `create_user_profile()` function to extract first_name and last_name from user metadata
    - Auto-generate display_name from first_name and last_name if available
    - Maintains backward compatibility for users without name metadata

  2. Purpose
    - Allows signup flow to pass first_name and last_name via metadata
    - Trigger automatically creates profile with names from metadata
    - Eliminates need for separate manual insert after signup
*/

-- Update function to handle first_name and last_name from metadata
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name text;
  v_last_name text;
  v_display_name text;
BEGIN
  -- Extract names from metadata
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';
  
  -- Generate display_name
  IF v_first_name IS NOT NULL AND v_last_name IS NOT NULL THEN
    v_display_name := v_first_name || ' ' || v_last_name;
  ELSIF v_first_name IS NOT NULL THEN
    v_display_name := v_first_name;
  ELSIF v_last_name IS NOT NULL THEN
    v_display_name := v_last_name;
  ELSE
    v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', NULL);
  END IF;

  INSERT INTO user_profiles (
    user_id, 
    first_name, 
    last_name, 
    display_name, 
    notification_preferences
  )
  VALUES (
    NEW.id,
    v_first_name,
    v_last_name,
    v_display_name,
    '{"email": true, "push": false}'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;