import { createClient } from '@supabase/supabase-js'
import type {Database} from "./dbtyps.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


export type User = Database['public']['Tables']['user_profiles']['Row']
export type Level = Database['public']['Tables']['levels']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Option = Database['public']['Tables']['options']['Row']
export type Attempt = Database['public']['Tables']['attempts']['Row']
export type UserLevelProgress = Database['public']['Tables']['user_level_progress']['Row']