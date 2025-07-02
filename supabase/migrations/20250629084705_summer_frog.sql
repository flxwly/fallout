/*
  # Complete Radioactivity Learning Game Database Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, optional)
      - `password_hash` (text)
      - `role` (text, either 'student' or 'admin')
      - `knowledge_points` (integer, default 0)
      - `dose_msv` (decimal, default 0.0)
      - `created_at` (timestamp)
      - `last_login` (timestamp, optional)

    - `levels`
      - `id` (uuid, primary key)
      - `title` (text)
      - `intro_text` (text)
      - `topic_tag` (text, default 'radioactivity')
      - `ordering` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `tasks`
      - `id` (uuid, primary key)
      - `level_id` (uuid, foreign key to levels)
      - `type` (text, either 'mc' or 'free')
      - `prompt_text` (text)
      - `ordering` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

    - `options`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key to tasks)
      - `option_text` (text)
      - `points_awarded` (integer, default 0)
      - `dose_delta_msv` (decimal, default 0.0)
      - `is_correct` (boolean, default false)
      - `ordering` (integer, default 0)

    - `attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `task_id` (uuid, foreign key to tasks)
      - `answer_json` (jsonb)
      - `points_got` (integer, default 0)
      - `dose_got_msv` (decimal, default 0.0)
      - `ai_feedback` (text, optional)
      - `timestamp` (timestamp, default now)

    - `user_level_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `level_id` (uuid, foreign key to levels)
      - `completed` (boolean, default false)
      - `started_at` (timestamp, default now)
      - `completed_at` (timestamp, optional)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for admin users to access all data

  3. Seed Data
    - Create admin user with credentials admin/admin123
    - Create sample student users
    - Create 3 sample levels with tasks and options
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  knowledge_points integer DEFAULT 0,
  dose_msv decimal(10,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  intro_text text,
  topic_tag text DEFAULT 'radioactivity',
  ordering integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('mc', 'free')),
  prompt_text text NOT NULL,
  ordering integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create options table
CREATE TABLE IF NOT EXISTS options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  points_awarded integer DEFAULT 0,
  dose_delta_msv decimal(10,2) DEFAULT 0.0,
  is_correct boolean DEFAULT false,
  ordering integer DEFAULT 0
);

-- Create attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  answer_json jsonb,
  points_got integer DEFAULT 0,
  dose_got_msv decimal(10,2) DEFAULT 0.0,
  ai_feedback text,
  timestamp timestamptz DEFAULT now()
);

-- Create user_level_progress table
CREATE TABLE IF NOT EXISTS user_level_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, level_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for levels table (public read access)
CREATE POLICY "Anyone can read active levels" ON levels
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage levels" ON levels
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for tasks table
CREATE POLICY "Anyone can read active tasks" ON tasks
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage tasks" ON tasks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for options table
CREATE POLICY "Anyone can read options for active tasks" ON options
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_id AND is_active = true
    )
  );

CREATE POLICY "Admins can manage options" ON options
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for attempts table
CREATE POLICY "Users can read own attempts" ON attempts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts" ON attempts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all attempts" ON attempts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for user_level_progress table
CREATE POLICY "Users can read own progress" ON user_level_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" ON user_level_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all progress" ON user_level_progress
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_levels_ordering ON levels(ordering);
CREATE INDEX IF NOT EXISTS idx_tasks_level_id ON tasks(level_id);
CREATE INDEX IF NOT EXISTS idx_tasks_ordering ON tasks(ordering);
CREATE INDEX IF NOT EXISTS idx_options_task_id ON options(task_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_task_id ON attempts(task_id);
CREATE INDEX IF NOT EXISTS idx_user_level_progress_user_id ON user_level_progress(user_id);

-- Insert seed data

-- Create admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGmQ3mRmTqNRYlK', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Create sample levels
INSERT INTO levels (title, intro_text, topic_tag, ordering, is_active) VALUES 
('Grundlagen der Radioaktivität', 'Willkommen zum ersten Level! Hier lernst du die Grundlagen der Radioaktivität kennen. Radioaktivität ist ein natürliches Phänomen, bei dem instabile Atomkerne spontan zerfallen und dabei Strahlung aussenden. Diese Strahlung kann verschiedene Formen annehmen: Alpha-, Beta- und Gammastrahlung.', 'radioactivity', 1, true),
('Strahlenschutz und Dosimetrie', 'Im zweiten Level beschäftigen wir uns mit dem Schutz vor radioaktiver Strahlung. Du lernst, wie Strahlendosen gemessen werden und welche Schutzmaßnahmen es gibt. Die Einheit der Strahlendosis ist Millisievert (mSv).', 'radioactivity', 2, true),
('Anwendungen der Radioaktivität', 'Das dritte Level zeigt dir die positiven Anwendungen der Radioaktivität in Medizin, Technik und Forschung. Von der Krebstherapie bis zur Altersbestimmung - radioaktive Isotope haben viele nützliche Eigenschaften.', 'radioactivity', 3, true);

-- Get level IDs for tasks (we'll use the titles to match)
DO $$
DECLARE
    level1_id uuid;
    level2_id uuid;
    level3_id uuid;
    task1_id uuid;
    task2_id uuid;
    task3_id uuid;
    task4_id uuid;
    task5_id uuid;
    task6_id uuid;
BEGIN
    -- Get level IDs
    SELECT id INTO level1_id FROM levels WHERE title = 'Grundlagen der Radioaktivität';
    SELECT id INTO level2_id FROM levels WHERE title = 'Strahlenschutz und Dosimetrie';
    SELECT id INTO level3_id FROM levels WHERE title = 'Anwendungen der Radioaktivität';

    -- Level 1 Tasks
    INSERT INTO tasks (level_id, type, prompt_text, ordering, is_active) VALUES 
    (level1_id, 'mc', 'Was passiert bei radioaktivem Zerfall?', 1, true)
    RETURNING id INTO task1_id;

    INSERT INTO tasks (level_id, type, prompt_text, ordering, is_active) VALUES 
    (level1_id, 'free', 'Erkläre in eigenen Worten, warum manche Atomkerne instabil sind und radioaktiv zerfallen. Berücksichtige dabei das Verhältnis von Protonen zu Neutronen.', 2, true)
    RETURNING id INTO task2_id;

    -- Level 1, Task 1 Options (Multiple Choice)
    INSERT INTO options (task_id, option_text, points_awarded, dose_delta_msv, is_correct, ordering) VALUES 
    (task1_id, 'Instabile Atomkerne senden Strahlung aus und wandeln sich in stabilere Kerne um', 5, 0.0, true, 1),
    (task1_id, 'Atome verschmelzen miteinander zu größeren Atomen', 0, 1.0, false, 2),
    (task1_id, 'Elektronen springen von einem Atom zum anderen', 1, 0.5, false, 3),
    (task1_id, 'Die Atome lösen sich vollständig auf', 0, 2.0, false, 4);

    -- Level 2 Tasks
    INSERT INTO tasks (level_id, type, prompt_text, ordering, is_active) VALUES 
    (level2_id, 'mc', 'Welche Aussage über Strahlendosen ist korrekt?', 1, true)
    RETURNING id INTO task3_id;

    INSERT INTO tasks (level_id, type, prompt_text, ordering, is_active) VALUES 
    (level2_id, 'free', 'Du arbeitest in einem Labor mit radioaktiven Materialien. Beschreibe drei wichtige Schutzmaßnahmen, die du beachten musst, und erkläre, warum sie wichtig sind.', 2, true)
    RETURNING id INTO task4_id;

    -- Level 2, Task 3 Options
    INSERT INTO options (task_id, option_text, points_awarded, dose_delta_msv, is_correct, ordering) VALUES 
    (task3_id, '1 mSv pro Jahr ist der Grenzwert für die Allgemeinbevölkerung in Deutschland', 5, 0.0, true, 1),
    (task3_id, 'Je höher die Dosis, desto besser für die Gesundheit', 0, 3.0, false, 2),
    (task3_id, 'Strahlendosen sind nur bei direktem Kontakt gefährlich', 1, 1.5, false, 3),
    (task3_id, 'Radioaktive Strahlung ist grundsätzlich ungefährlich', 0, 5.0, false, 4);

    -- Level 3 Tasks
    INSERT INTO tasks (level_id, type, prompt_text, ordering, is_active) VALUES 
    (level3_id, 'mc', 'Wo wird Radioaktivität in der Medizin eingesetzt?', 1, true)
    RETURNING id INTO task5_id;

    INSERT INTO tasks (level_id, type, prompt_text, ordering, is_active) VALUES 
    (level3_id, 'free', 'Recherchiere und erkläre, wie die Radiokarbonmethode (C-14-Methode) funktioniert und wofür sie verwendet wird. Gehe dabei auf die Halbwertszeit ein.', 2, true)
    RETURNING id INTO task6_id;

    -- Level 3, Task 5 Options
    INSERT INTO options (task_id, option_text, points_awarded, dose_delta_msv, is_correct, ordering) VALUES 
    (task5_id, 'In der Krebstherapie und bei bildgebenden Verfahren wie PET', 5, 0.0, true, 1),
    (task5_id, 'Nur zur Desinfektion von Operationssälen', 2, 0.2, false, 2),
    (task5_id, 'Ausschließlich zur Behandlung von Knochenbrüchen', 0, 1.0, false, 3),
    (task5_id, 'Radioaktivität wird nicht in der Medizin verwendet', 0, 2.0, false, 4);
END $$;

-- Create some sample student users
INSERT INTO users (username, password_hash, role, knowledge_points, dose_msv) VALUES 
('student1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGmQ3mRmTqNRYlK', 'student', 15, 0.5),
('student2', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGmQ3mRmTqNRYlK', 'student', 8, 1.2)
ON CONFLICT (username) DO NOTHING;