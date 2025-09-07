import { createClient } from '@supabase/supabase-js'
import {Constants, type Database} from "../../db/database.types.ts"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const roles = Constants.public.Enums.role
export type Role = Database['public']['Enums']['role']
export const taskTypes = Constants.public.Enums.task_type
export type TaskType = Database['public']['Enums']['task_type']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserStats = Database['public']['Tables']['user_stats']['Row']
export type Level = Database['public']['Tables']['levels']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Option = Database['public']['Tables']['options']['Row']
export type Attempt = Database['public']['Tables']['attempts']['Row']
export type UserLevelProgress = Database['public']['Tables']['user_level_progress']['Row']