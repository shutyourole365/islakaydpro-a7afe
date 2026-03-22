-- ================================================================
-- AI Chat History
-- Persists Kayd assistant conversations per user session
-- ================================================================

CREATE TABLE IF NOT EXISTS ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  suggestions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_session
  ON ai_chat_history(user_id, session_id, created_at);

ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own chat history
CREATE POLICY "Users can read own chat history"
  ON ai_chat_history FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own chat history"
  ON ai_chat_history FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own chat history"
  ON ai_chat_history FOR DELETE
  USING (user_id = (select auth.uid()));
