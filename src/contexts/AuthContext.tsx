import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error?: string }>
  signUp: (username: string, email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const signIn = async (username: string, password: string) => {
    try {
      // Handle demo credentials specially
      if (username === 'admin' && password === 'admin123') {
        // Create a demo admin session
        const demoUser: User = {
          id: 'demo-admin-id',
          username: 'admin',
          email: 'admin@example.com',
          password_hash: '',
          role: 'admin',
          knowledge_points: 0,
          dose_msv: 0,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
        setUser(demoUser)
        setSession({
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'demo-admin-id',
            email: 'admin@example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated'
          }
        } as Session)
        return {}
      }

      if (username === 'student1' && password === 'admin123') {
        // Create a demo student session
        const demoUser: User = {
          id: 'demo-student-id',
          username: 'student1',
          email: 'student1@example.com',
          password_hash: '',
          role: 'student',
          knowledge_points: 15,
          dose_msv: 0.5,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
        setUser(demoUser)
        setSession({
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'demo-student-id',
            email: 'student1@example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated'
          }
        } as Session)
        return {}
      }

      // For non-demo users, try the regular Supabase auth flow
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)

      if (userError || !userData || userData.length === 0 || !userData[0]?.email) {
        return { error: 'Invalid username or password' }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: userData[0].email,
        password: password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (username: string, email: string, password: string) => {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        return { error: 'Username already exists' }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username,
            email,
            password_hash: '', // This will be handled by Supabase auth
            role: 'student',
            knowledge_points: 0,
            dose_msv: 0.0
          })

        if (profileError) {
          return { error: 'Failed to create user profile' }
        }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    // Clear demo session
    setUser(null)
    setSession(null)
    
    // Also sign out from Supabase if there's a real session
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}