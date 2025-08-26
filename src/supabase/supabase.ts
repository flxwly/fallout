import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface User {
  id: string
  username: string
  email?: string
  role: 'student' | 'admin'
  knowledge_points: number
  dose_msv: number
  created_at: string
  last_login?: string
}

export interface Level {
  id: string
  title: string
  intro_text?: string
  topic_tag: string
  ordering: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  level_id: string
  type: 'mc' | 'free'
  prompt_text: string
  ordering: number
  is_active: boolean
  created_at: string
}

export interface Option {
  id: string
  task_id: string
  option_text: string
  points_awarded: number
  dose_delta_msv: number
  is_correct: boolean
  ordering: number
}

export interface Attempt {
  id: string
  user_id: string
  task_id: string
  answer_json?: any
  points_got: number
  dose_got_msv: number
  ai_feedback?: string
  timestamp: string
}

export interface UserLevelProgress {
  id: string
  user_id: string
  level_id: string
  completed: boolean
  started_at: string
  completed_at?: string
}