import React, {createContext, useContext, useState} from 'react'
import {supabase, type Level, type Task, type Option, type UserLevelProgress} from '../supabase/supabase.ts'
import {useAuth} from './AuthContext'

interface GameContextType {
    levels: Level[]
    currentLevel: Level | null
    tasks: Task[]
    currentTask: Task | null
    options: Option[]
    userProgress: UserLevelProgress[]
    loading: boolean
    loadLevels: () => Promise<void>
    loadLevel: (levelId: string) => Promise<void>
    loadTasks: (levelId: string) => Promise<void>
    loadOptions: (taskId: string) => Promise<void>
    submitAnswer: (taskId: string, answer: never) => Promise<{ success: boolean; feedback?: string }>
    getUserProgress: () => Promise<void>
    startLevel: (levelId: string) => Promise<void>
    completeLevel: (levelId: string) => Promise<void>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({children}: { children: React.ReactNode }) {
    const {user} = useAuth()
    const [levels, setLevels] = useState<Level[]>([])
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [currentTask, setCurrentTask] = useState<Task | null>(null)
    const [options, setOptions] = useState<Option[]>([])
    const [userProgress, setUserProgress] = useState<UserLevelProgress[]>([])
    const [loading, setLoading] = useState(false)

    // Helper function to check if user is a demo user
    const isDemoUser = (userId: string) => {
        return userId.startsWith('demo-')
    }

    const loadLevels = async () => {
        setLoading(true)

        console.log('Loading levels from database...')
        const {data, error} = await supabase
            .from('levels')
            .select('*')

        if (error) {
            console.error("Couldn't get levels from db: " + error)
        } else {
            setLevels(data)
        }
        setLoading(false)
    }

    const loadLevel = async (levelId: string) => {
        console.log(`Loading level "${levelId}" from database...`)
        const {data, error} = await supabase
            .from('levels')
            .select('*')
            .eq('id', levelId)
            .single()

        if (error) {

            console.error("Couldn't get level from db: " + error)
        } else {
            setCurrentLevel(data)
        }
    }

    const loadTasks = async (levelId: string) => {
        console.log('Loading tasks from database...')
        const {data, error} = await supabase
            .from('tasks')
            .select('*')
            .eq('level_id', levelId)

        if (error) {
            console.error("Couldn't get tasks for " + levelId + " from db: " + error)
        } else {
            setTasks(data)
        }

        if (tasks.length > 0) {
            setCurrentTask(tasks[0])
        }
    }

    const loadOptions = async (taskId: string) => {
        const {data, error} = await supabase
            .from('options')
            .select('*')
            .eq('task_id', taskId)

        if (error) {
            console.error("Couldn't get options from db: " + error)
        } else {
            console.log('Loaded Options', data)
            setOptions(data)
        }
    }

    const submitAnswer = async (taskId: string, answer: never) => {
        if (!user) return {success: false}

        // For demo users, simulate answer submission
        console.log('Submitting demo answer:', {taskId, answer})
        return {success: true, feedback: 'Demo-Antwort erfolgreich übermittelt!'}
    }

    const getUserProgress = async () => {
        if (!user.profile || !user.stats) return

        // Skip database operations for demo users
        if (isDemoUser(user.profile.user_id)) {
            // Set empty progress for demo users
            setUserProgress([])
            return
        }

        const {data, error} = await supabase
            .from('user_level_progress')
            .select('*')
            .eq('user_id', user.profile.user_id)

        if (error) {
            console.error('Error loading user progress:', error)
        }

        setUserProgress(data || [])
    }

    const startLevel = async (levelId: string) => {
        if (!user.profile || !user.stats) return

        // Skip database operations for demo users
        if (isDemoUser(user.profile.user_id)) {
            // Simulate successful level start for demo users
            console.log('Demo user starting level:', levelId)
            return
        }

        const {error} = await supabase
            .from('user_level_progress')
            .upsert({
                user_id: user.profile.user_id,
                level_id: levelId,
                completed: false
            })

        if (error) {
            console.error('Error starting level:', error)
        }

        await getUserProgress()
    }

    const completeLevel = async (levelId: string) => {
        if (!user.profile || !user.stats) return

        // Skip database operations for demo users
        if (isDemoUser(user.profile.user_id)) {
            // Simulate successful level completion for demo users
            console.log('Demo user completing level:', levelId)
            return
        }

        const {error} = await supabase
            .from('user_level_progress')
            .update({
                completed: true,
                completed_at: new Date().toISOString()
            })
            .eq('user_id', user.profile.user_id)
            .eq('level_id', levelId)

        if (error) {
            console.error('Error completing level:', error)
        }

        await getUserProgress()
    }

    const value = {
        levels,
        currentLevel,
        tasks,
        currentTask,
        options,
        userProgress,
        loading,
        loadLevels,
        loadLevel,
        loadTasks,
        loadOptions,
        submitAnswer,
        getUserProgress,
        startLevel,
        completeLevel,
    }

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextType {
    const context: GameContextType | undefined = useContext(GameContext)
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider')
    }
    return context
}