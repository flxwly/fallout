/*
  # KI-Feedback Edge Function Setup

  1. Edge Function
    - Erstellt die evaluate-reasoning Edge Function
    - Konfiguriert CORS und Authentifizierung
    - Integriert OpenAI API für intelligente Bewertung

  2. Fallback System
    - Regel-basiertes Feedback wenn OpenAI nicht verfügbar
    - Qualitätsbewertung von 1-10
    - Konstruktive Verbesserungsvorschläge

  3. Sicherheit
    - API-Key wird sicher in Supabase Secrets gespeichert
    - CORS-Headers für Frontend-Zugriff
    - Fehlerbehandlung und Fallbacks
*/

-- Diese Migration erstellt die notwendigen Berechtigungen für Edge Functions
-- Die eigentliche Function wird über das Supabase Dashboard deployed

-- Tabelle für AI Feedback Logs (optional, für Debugging)
CREATE TABLE IF NOT EXISTS ai_feedback_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  task_prompt text NOT NULL,
  student_reasoning text NOT NULL,
  ai_feedback text NOT NULL,
  quality_score integer CHECK (quality_score >= 1 AND quality_score <= 10),
  suggestions jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS für AI Feedback Logs
ALTER TABLE ai_feedback_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI feedback logs"
  ON ai_feedback_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI feedback logs"
  ON ai_feedback_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_ai_feedback_logs_user_id ON ai_feedback_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_logs_created_at ON ai_feedback_logs(created_at);