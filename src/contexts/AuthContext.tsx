import React, {createContext, useContext, useEffect, useState} from 'react'
import {type Role, supabase, type UserProfile, type UserStats} from '../supabase/supabase.ts'
import type {Session} from '@supabase/supabase-js'

interface AuthContextType {
    // TODO: Change this...
    user: {profile: UserProfile | null, stats: UserStats | null}
    session: Session | null
    loading: boolean
    signIn: (username: string, password: string) => Promise<{ error?: string }>
    signUp: (username: string, email: string, password: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
    updateProfile: (userData: Partial<UserProfile>) => void
    updateStats: (statsData: Partial<UserStats>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [stats, setStats] = useState<UserStats | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session)
            setLoading(true)
            if (session?.user) {
                void fetchUser(session.user.id)
            } else {
                setUser(null)
                setStats(null)
                setLoading(false)
            }
        })

        // Listen for auth changes
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setLoading(true)
            if (session?.user) {
                void fetchUser(session.user.id)
            } else {
                setUser(null)
                setStats(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUser = async (userId: string) => {
        const {data: profile, error: profileError} = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        const {data: stats, error: statsError} = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (profileError) {
            console.error('Error fetching user profile:', profileError)
            return
        } else if (statsError) {
            console.error('Error fetching user profile:', statsError)
            return
        }

        setUser(profile)
        setStats(stats)

        setLoading(false)
    }

    const createUser = async (
        userId: string,
        username: string,
        email: string,
        permission_level: Role
    ) => {

        setLoading(true)
        const userProfile: UserProfile = {
            user_id: userId,
            username: username,
            email: email,
            permission_level: permission_level,
            created_at: new Date().toISOString()
        }

        const {error: profileError} = await supabase
            .from('user_profiles')
            .insert(userProfile)

        const {error: statsError} = await supabase
            .from('user_stats')
            .insert({user_id: userId})

        if (profileError) {
            console.error('Error creating user profile:', profileError)
            return null
        } else if (statsError) {
            console.error('Error creating user stats:', statsError)
            return null
        }

        setLoading(false)
    }

    const updateProfile = (userData: Partial<UserProfile>) => {
        setUser(prev => prev ? {...prev, ...userData} : null)
    }

    const updateStats = (statsData: Partial<UserStats>) => {
        setStats(prev => prev ? {...prev, ...statsData} : null)
    }

    const signIn = async (username: string, password: string) => {
        try {
            // Handle demo credentials specially
            if (username === 'admin' && password === 'admin123') {
                // Create a demo admin session
                const demoUser: UserProfile = {
                    user_id: 'demo-admin-id',
                    username: 'admin',
                    email: 'admin@example.com',
                    permission_level: "ADMIN",
                    created_at: new Date().toISOString()
                }
                setUser(demoUser)
                setStats({dose_msv: 0, knowledge_points: 0, user_id: 'demo-admin-id'})
                const session: Session = {
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
                        role: 'authenticated',
                        app_metadata: {},
                        user_metadata: {}
                    }
                }
                setSession(session)
                return {}
            }
            if (username === 'student1' && password === 'admin123') {
                // Create a demo student session
                const demoUser: UserProfile = {
                    user_id: 'demo-student-id',
                    username: 'student1',
                    email: 'student1@example.com',
                    permission_level: "STUDENT",
                    created_at: new Date().toISOString()
                }
                setUser(demoUser)
                setStats({dose_msv: 0, knowledge_points: 0, user_id: 'demo-student-id'})
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
            const {data: userData, error: userError} = await supabase
                .from('user_profiles')
                .select('*')
                .eq('username', username)
                .single()

            if (userError || !userData || !userData?.email) {
                return {error: 'Invalid username or password'}
            }

            const {error} = await supabase.auth.signInWithPassword({
                email: userData.email,
                password: password,
            })

            if (error) {
                return {error: error.message}
            }

            return {}
        } catch (error) {
            console.error(error)
            return {error: 'An unexpected error occurred'}
        }
    }

    const signUp = async (username: string, email: string, password: string) => {

        // Check if username already exists
        const {data: existingUser} = await supabase
            .from('user_profiles')
            .select('username', {head: true, count: 'exact'})
            .eq('username', username)
            .single()

        if (existingUser) {
            return {error: 'Username already exists'}
        }

        const {data: authDetails, error} = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            return {error: error.message}
        }

        void createUser(authDetails.user!.id, username, email, 'STUDENT')
        setSession(authDetails.session)

        return {}
    }

    const signOut = async () => {
        // Clear demo session
        setUser(null)
        setStats(null)
        setSession(null)

        // Also sign out from Supabase if there's a real session
        await supabase.auth.signOut()
    }

    const value = {
        user: {profile: user, stats: stats},
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateStats
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}