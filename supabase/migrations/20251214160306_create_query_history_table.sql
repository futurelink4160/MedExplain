/*
  # Create Query History Table

  1. New Tables
    - `query_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `age` (integer)
      - `gender` (text)
      - `role` (text)
      - `medication` (text)
      - `question` (text)
      - `symptoms` (text)
      - `duration` (text)
      - `other_meds` (text)
      - `medical_history` (text)
      - `response_data` (jsonb) - stores the full response
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `query_history` table
    - Add policy for users to read their own history
    - Add policy for users to insert their own queries
    - Add policy for users to delete their own queries

  3. Indexes
    - Index on user_id for faster queries
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS query_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  age integer,
  gender text,
  role text,
  medication text,
  question text,
  symptoms text,
  duration text,
  other_meds text,
  medical_history text,
  response_data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE query_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own query history"
  ON query_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own query history"
  ON query_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own query history"
  ON query_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON query_history(created_at DESC);