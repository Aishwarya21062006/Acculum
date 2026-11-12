-- ============================================================================
-- ACCULUM SUPABASE POSTGRESQL SCHEMA WITH PGVECTOR & RLS POLICIES
-- ============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Schools Table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section TEXT,
  grade_level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Profiles Table (Extends Supabase auth.users or standalone for demo/migration)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  role TEXT CHECK (role IN ('teacher', 'student', 'admin')) NOT NULL DEFAULT 'teacher',
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  student_id TEXT,
  facilitator_id TEXT,
  subjects JSONB DEFAULT '[]'::jsonb,
  classes JSONB DEFAULT '[]'::jsonb,
  preferred_language TEXT DEFAULT 'English',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Textbooks Table
CREATE TABLE IF NOT EXISTS textbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  class_grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  academic_year TEXT NOT NULL DEFAULT '2024-2025',
  description TEXT,
  pdf_storage_path TEXT NOT NULL,
  pdf_filename TEXT NOT NULL,
  file_size_bytes BIGINT,
  page_count INTEGER DEFAULT 0,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Textbook Chunks Table (With 768-dim embeddings for Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS textbook_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  subject TEXT,
  chapter TEXT,
  topic TEXT,
  language TEXT DEFAULT 'English',
  page_number INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  token_count INTEGER,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vector Index on Chunks
CREATE INDEX IF NOT EXISTS textbook_chunks_embedding_idx 
  ON textbook_chunks 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS textbook_chunks_textbook_idx ON textbook_chunks (textbook_id);
CREATE INDEX IF NOT EXISTS textbook_chunks_chapter_topic_idx ON textbook_chunks (chapter, topic);

-- 7. Textbook Topics Table (Extracted chapters & topic structure)
CREATE TABLE IF NOT EXISTS textbook_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER,
  chapter_name TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  subtopics JSONB DEFAULT '[]'::jsonb,
  short_description TEXT,
  page_start INTEGER,
  page_end INTEGER,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS textbook_topics_textbook_idx ON textbook_topics (textbook_id);

-- 8. Textbook Assignments Table
CREATE TABLE IF NOT EXISTS textbook_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(textbook_id, class_id)
);

-- 9. Generated Quizzes Table
CREATE TABLE IF NOT EXISTS generated_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  class_grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT,
  topic TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
  question_count INTEGER NOT NULL DEFAULT 5,
  language TEXT DEFAULT 'English',
  question_types JSONB DEFAULT '["MCQ"]'::jsonb,
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES generated_quizzes(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL,
  question_type TEXT CHECK (question_type IN ('MCQ', 'True_False', 'Fill_Blanks', 'Short_Answer')) NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  chapter TEXT,
  topic TEXT,
  page_reference INTEGER,
  chunk_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_idx ON quiz_questions (quiz_id);

-- 11. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES generated_quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  textbook_id UUID REFERENCES textbooks(id) ON DELETE SET NULL,
  chapter TEXT,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score_numerator INTEGER NOT NULL DEFAULT 0,
  score_denominator INTEGER NOT NULL DEFAULT 0,
  score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  time_taken_seconds INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_attempts_student_idx ON quiz_attempts (student_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_idx ON quiz_attempts (quiz_id);

-- 12. Quiz Responses Table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
  student_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_responses_attempt_idx ON quiz_responses (attempt_id);

-- 13. Topic Mastery Table
CREATE TABLE IF NOT EXISTS topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  mastery_level TEXT CHECK (mastery_level IN ('Low', 'Medium', 'High')) NOT NULL DEFAULT 'Low',
  mastery_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  total_attempts INTEGER DEFAULT 1,
  last_attempt_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, subject, topic)
);

CREATE INDEX IF NOT EXISTS topic_mastery_student_idx ON topic_mastery (student_id);

-- 14. Interventions Table (Compatible with existing Acculum intervention schema)
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  signal_id TEXT,
  facilitator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  intervention_type TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  subtopic TEXT,
  language TEXT DEFAULT 'English',
  format TEXT,
  difficulty TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('assigned', 'completed', 'dismissed', 'monitoring')) DEFAULT 'assigned',
  assigned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- SEMANTIC VECTOR SEARCH RPC FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION match_textbook_chunks (
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5,
  filter_textbook_id UUID DEFAULT NULL,
  filter_chapter TEXT DEFAULT NULL,
  filter_topic TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  textbook_id UUID,
  chapter TEXT,
  topic TEXT,
  page_number INT,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.id,
    tc.textbook_id,
    tc.chapter,
    tc.topic,
    tc.page_number,
    tc.chunk_text,
    1 - (tc.embedding <=> query_embedding) AS similarity
  FROM textbook_chunks tc
  WHERE
    (filter_textbook_id IS NULL OR tc.textbook_id = filter_textbook_id)
    AND (filter_chapter IS NULL OR tc.chapter ILIKE '%' || filter_chapter || '%')
    AND (filter_topic IS NULL OR tc.topic ILIKE '%' || filter_topic || '%')
    AND 1 - (tc.embedding <=> query_embedding) > match_threshold
  ORDER BY tc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE textbook_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE textbook_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE textbook_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Helper function: get user role
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Textbooks Policies:
-- Teachers can manage their own uploaded textbooks or textbooks in their school
CREATE POLICY "Teachers can manage textbooks" ON textbooks
  FOR ALL USING (
    auth.uid() = teacher_id OR auth_user_role() = 'admin'
  );

-- Students can read assigned textbooks
CREATE POLICY "Students can read assigned textbooks" ON textbooks
  FOR SELECT USING (
    id IN (
      SELECT ta.textbook_id FROM textbook_assignments ta
      JOIN profiles p ON p.class_id = ta.class_id
      WHERE p.id = auth.uid()
    ) OR auth_user_role() = 'teacher' OR auth_user_role() = 'admin'
  );

-- Textbook Chunks & Topics:
CREATE POLICY "Read textbook chunks" ON textbook_chunks
  FOR SELECT USING (TRUE);

CREATE POLICY "Manage textbook chunks" ON textbook_chunks
  FOR ALL USING (auth_user_role() IN ('teacher', 'admin'));

CREATE POLICY "Read textbook topics" ON textbook_topics
  FOR SELECT USING (TRUE);

CREATE POLICY "Manage textbook topics" ON textbook_topics
  FOR ALL USING (auth_user_role() IN ('teacher', 'admin'));

-- Quiz Attempts: Students can view and insert their own attempts; Teachers can view their students'
CREATE POLICY "Students manage own attempts" ON quiz_attempts
  FOR ALL USING (auth.uid() = student_id OR auth_user_role() IN ('teacher', 'admin'));

CREATE POLICY "Students manage own responses" ON quiz_responses
  FOR ALL USING (
    attempt_id IN (SELECT id FROM quiz_attempts WHERE student_id = auth.uid()) 
    OR auth_user_role() IN ('teacher', 'admin')
  );

-- Topic Mastery:
CREATE POLICY "Topic mastery access" ON topic_mastery
  FOR ALL USING (auth.uid() = student_id OR auth_user_role() IN ('teacher', 'admin'));

-- Interventions:
CREATE POLICY "Interventions access" ON interventions
  FOR ALL USING (auth.uid() = student_id OR auth_user_role() IN ('teacher', 'admin'));

-- ============================================================================
-- SUPABASE REALTIME REPLICATION
-- ============================================================================
-- Enable realtime publication for interactive dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE topic_mastery;
ALTER PUBLICATION supabase_realtime ADD TABLE interventions;
ALTER PUBLICATION supabase_realtime ADD TABLE textbooks;

