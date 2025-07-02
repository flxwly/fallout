/*
  # Add reasoning field to attempts table

  1. Changes
    - Add `reasoning` column to `attempts` table for storing student explanations
    - Update existing data structure to support reasoning-based feedback

  2. Security
    - Maintain existing RLS policies
    - No changes to access permissions needed
*/

-- Add reasoning column to attempts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attempts' AND column_name = 'reasoning'
  ) THEN
    ALTER TABLE attempts ADD COLUMN reasoning text;
  END IF;
END $$;

-- Update the answer_json structure to include both answer and reasoning
COMMENT ON COLUMN attempts.reasoning IS 'Student explanation/reasoning for their answer choice';
COMMENT ON COLUMN attempts.answer_json IS 'Selected answer (option ID for MC, text for free response)';
COMMENT ON COLUMN attempts.ai_feedback IS 'AI-generated feedback on student reasoning and answer quality';