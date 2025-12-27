/*
  # Create Dashboard Tables

  1. New Tables
    - `user_profiles`
      - Stores user profile information for personalization
      - Fields: user_id, display_name, age, gender, preferred_role, notification_preferences, created_at, updated_at
    
    - `user_subscriptions`
      - Manages subscription tiers and usage limits
      - Fields: user_id, plan_type (free/pro/enterprise), status, queries_per_month_limit, queries_used_this_month, billing_period_start, billing_period_end, created_at, updated_at
      - All users start with 'free' plan with 50 queries per month
    
    - `user_recommendations`
      - Stores personalized recommendations for users
      - Fields: user_id, recommendation_type, title, description, related_medication, related_gene, priority, is_dismissed, created_at
      - Enables tracking which recommendations have been shown and dismissed
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and update their own data
    - Add indexes for optimal query performance

  3. Default Data
    - Create default subscription entries for existing users
    - Set all to 'free' plan initially
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  age integer,
  gender text,
  preferred_role text,
  notification_preferences jsonb DEFAULT '{"email": true, "push": false}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type text DEFAULT 'free' NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled')),
  queries_per_month_limit integer DEFAULT 50 NOT NULL,
  queries_used_this_month integer DEFAULT 0 NOT NULL,
  billing_period_start timestamptz DEFAULT now() NOT NULL,
  billing_period_end timestamptz DEFAULT (now() + interval '1 month') NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_recommendations table
CREATE TABLE IF NOT EXISTS user_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('medication', 'gene', 'guideline', 'interaction', 'educational')),
  title text NOT NULL,
  description text NOT NULL,
  related_medication text,
  related_gene text,
  priority integer DEFAULT 0,
  is_dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_recommendations
CREATE POLICY "Users can view own recommendations"
  ON user_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON user_recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON user_recommendations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_dismissed ON user_recommendations(user_id, is_dismissed);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_priority ON user_recommendations(user_id, priority DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_subscriptions_updated_at') THEN
    CREATE TRIGGER update_user_subscriptions_updated_at
      BEFORE UPDATE ON user_subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create function to automatically create subscription for new users
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_type, status, queries_per_month_limit, queries_used_this_month)
  VALUES (NEW.id, 'free', 'active', 50, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create subscription on user signup
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_subscription') THEN
    CREATE TRIGGER on_auth_user_created_subscription
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_user_subscription();
  END IF;
END $$;

-- Create function to increment query usage
CREATE OR REPLACE FUNCTION increment_query_usage(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET queries_used_this_month = queries_used_this_month + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET queries_used_this_month = 0,
      billing_period_start = now(),
      billing_period_end = now() + interval '1 month',
      updated_at = now()
  WHERE billing_period_end < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;