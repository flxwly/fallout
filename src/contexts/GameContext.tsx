import React, {createContext, useContext, useEffect, useState} from 'react'
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

    // Demo data with post-apocalyptic theme and shopping task
    const demoLevels: Level[] = [
        {
            id: 'demo-level-1',
            title: 'Die verstrahlten Ruinen - Der Klamottenladen',
            intro_text: 'Du erwachst in den Trümmern einer einst blühenden Stadt. Überall siehst du seltsame Warnschilder mit dem Strahlensymbol. Die Luft flimmert merkwürdig, und dein Geigerzähler klickt bedrohlich.\n\nAuf der Ecke findest du einen halb-zerstörten Klamottenladen, in den du hineingehst. Ein alter Mann verkauft dort übrig gebliebene Kleidung und andere nützliche Dinge.\n\nDu hast wie in jedem Computerspiel eine Gesundheitsleiste, ein gewisses Budget und eine Wissensleiste. Dein Ziel ist es am Ende die beiden Leisten möglichst voll zu haben. Das Geld spielt am Ende keine große Rolle.\n\nDeine Wissensleiste ist zu Beginn leer (0 WP), dein Dosimeter hat keine Strahlung gemessen (0mSv) und du besitzt 120€.\n\nDoch Achtung: Zu viel Ausgaben direkt am Ende lassen euch wenig Geld für die weiteren Aufgaben. Die Gesundheitsleiste geht aufgrund der Radioaktivität so oder so runter. Ihr könnt sie nur verlangsamen. Einmal erlittene Schäden werden immer wieder abgezogen, sofern sie nicht geheilt werden.',
            topic_tag: 'radioactivity',
            ordering: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'demo-level-2',
            title: 'Das Strahlenschutz-Labor',
            intro_text: 'Du findest ein verlassenes Labor mit funktionierenden Geräten. An der Wand hängt ein Poster: "STRAHLENSCHUTZ RETTET LEBEN!"\n\nEin Hologramm eines Wissenschaftlers flackert auf: "Willkommen im Notfall-Ausbildungszentrum. Du musst lernen, wie Strahlendosen gemessen werden und welche Schutzmaßnahmen existieren."\n\nDein Dosimeter zeigt bereits erste Werte an. Zeit ist kostbar!\n\nThemen in diesem Labor:\n• Dosimetrie und Messeinheiten (mSv)\n• Grenzwerte für Strahlenbelastung\n• Die drei Grundregeln: Zeit, Abstand, Abschirmung\n• Praktische Schutzmaßnahmen im Notfall\n\nJede falsche Entscheidung kostet dich Gesundheit!',
            topic_tag: 'radioactivity',
            ordering: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'demo-level-3',
            title: 'Die Hoffnungszone',
            intro_text: 'Du erreichst einen Bereich, wo die Strahlung schwächer ist. Hier siehst du Schilder für ein Krankenhaus und ein Forschungszentrum. Nicht alle Radioaktivität ist schlecht!\n\nEin Arzt in Schutzkleidung erklärt dir: "Radioaktivität kann Leben retten! In der Medizin nutzen wir sie für Diagnose und Therapie. Auch in der Forschung hat sie viele positive Anwendungen."\n\nDu siehst Geräte für Krebstherapie und Altersbestimmung.\n\nWas du hier entdeckst:\n• Medizinische Anwendungen (Diagnostik, Therapie)\n• Radiokarbonmethode zur Altersbestimmung\n• Technische Anwendungen in der Industrie\n• Kernenergie als Energiequelle\n\nSelbst hier musst du vorsichtig sein - auch gute Strahlung kann gefährlich werden!',
            topic_tag: 'radioactivity',
            ordering: 3,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]
    const demoTasks: { [levelId: string]: Task[] } = {
        'demo-level-1': [
            {
                id: 'demo-task-shopping',
                level_id: 'demo-level-1',
                type: 'mc',
                prompt_text: 'Du findest einen halb-zerstörten Klamottenladen, in den du hineingehst. Ein alter Mann verkauft dort übrig gebliebene Kleidung und andere nützliche Dinge. Du musst entscheiden, was du dort kaufen willst:',
                ordering: 1,
                is_active: true,
                created_at: new Date().toISOString()
            },
            {
                id: 'demo-task-2',
                level_id: 'demo-level-1',
                type: 'free',
                prompt_text: 'Ein alter Wissenschaftler fragt dich: "Warum sind manche Atomkerne instabil und zerfallen radioaktiv?" Erkläre ihm deine Überlegungen zum Verhältnis von Protonen zu Neutronen.',
                ordering: 2,
                is_active: true,
                created_at: new Date().toISOString()
            }
        ],
        'demo-level-2': [
            {
                id: 'demo-task-3',
                level_id: 'demo-level-2',
                type: 'mc',
                prompt_text: 'Dein Dosimeter piept! Du musst eine Entscheidung treffen. Welche Aussage über Strahlendosen ist korrekt?',
                ordering: 1,
                is_active: true,
                created_at: new Date().toISOString()
            }
        ],
        'demo-level-3': [
            {
                id: 'demo-task-4',
                level_id: 'demo-level-3',
                type: 'mc',
                prompt_text: 'Im Krankenhaus siehst du Geräte mit Strahlensymbolen. Wo wird Radioaktivität in der Medizin eingesetzt?',
                ordering: 1,
                is_active: true,
                created_at: new Date().toISOString()
            }
        ]
    }
    const demoOptions: { [taskId: string]: Option[] } = {
        'demo-task-shopping': [
            {
                id: 'demo-option-tshirt',
                task_id: 'demo-task-shopping',
                option_text: 'A) T-Shirt (0€) - Bietet keinen Schutz vor Strahlung',
                points_awarded: 2,
                dose_delta_msv: 3.0,
                is_correct: false
            },
            {
                id: 'demo-option-radiation-suit',
                task_id: 'demo-task-shopping',
                option_text: 'B) Gelber Strahlenschutzanzug (50€) - Professioneller Schutz vor radioaktiver Strahlung',
                points_awarded: 8,
                dose_delta_msv: 0.0,
                is_correct: true
            },
            {
                id: 'demo-option-winter-jacket',
                task_id: 'demo-task-shopping',
                option_text: 'C) Dicke Winterjacke (20€) - Normale Kleidung, etwas Schutz vor Kälte',
                points_awarded: 4,
                dose_delta_msv: 1.5,
                is_correct: false
            },
            {
                id: 'demo-option-mask',
                task_id: 'demo-task-shopping',
                option_text: 'D) Normale Schutzmaske (20€) - Schutz vor Staub, aber nicht vor Strahlung',
                points_awarded: 3,
                dose_delta_msv: 2.0,
                is_correct: false
            },
            {
                id: 'demo-option-mouth-protection',
                task_id: 'demo-task-shopping',
                option_text: 'E) Mundschutz (3€) - Minimaler Schutz vor Partikeln',
                points_awarded: 2,
                dose_delta_msv: 2.5,
                is_correct: false
            },
            {
                id: 'demo-option-cap',
                task_id: 'demo-task-shopping',
                option_text: 'F) Mütze (5€) - Schutz vor Sonne, nicht vor Strahlung',
                points_awarded: 1,
                dose_delta_msv: 2.8,
                is_correct: false
            },
            {
                id: 'demo-option-filter-mask',
                task_id: 'demo-task-shopping',
                option_text: 'G) Filtermaske fürs komplette Gesicht (70€) - Guter Schutz vor radioaktiven Partikeln',
                points_awarded: 7,
                dose_delta_msv: 0.5,
                is_correct: true
            }
        ],
        'demo-task-3': [
            {
                id: 'demo-option-5',
                task_id: 'demo-task-3',
                option_text: '1 mSv pro Jahr ist der Grenzwert für die Allgemeinbevölkerung in Deutschland',
                points_awarded: 5,
                dose_delta_msv: 0.0,
                is_correct: true
            },
            {
                id: 'demo-option-6',
                task_id: 'demo-task-3',
                option_text: 'Je höher die Dosis, desto besser für die Gesundheit',
                points_awarded: 0,
                dose_delta_msv: 3.0,
                is_correct: false
            },
            {
                id: 'demo-option-7',
                task_id: 'demo-task-3',
                option_text: 'Strahlendosen sind nur bei direktem Kontakt gefährlich',
                points_awarded: 1,
                dose_delta_msv: 1.5,
                is_correct: false
            },
            {
                id: 'demo-option-8',
                task_id: 'demo-task-3',
                option_text: 'Radioaktive Strahlung ist grundsätzlich ungefährlich',
                points_awarded: 0,
                dose_delta_msv: 5.0,
                is_correct: false
            }
        ],
        'demo-task-4': [
            {
                id: 'demo-option-9',
                task_id: 'demo-task-4',
                option_text: 'In der Krebstherapie und bei bildgebenden Verfahren wie PET',
                points_awarded: 5,
                dose_delta_msv: 0.0,
                is_correct: true
            },
            {
                id: 'demo-option-10',
                task_id: 'demo-task-4',
                option_text: 'Nur zur Desinfektion von Operationssälen',
                points_awarded: 2,
                dose_delta_msv: 0.2,
                is_correct: false
            },
            {
                id: 'demo-option-11',
                task_id: 'demo-task-4',
                option_text: 'Ausschließlich zur Behandlung von Knochenbrüchen',
                points_awarded: 0,
                dose_delta_msv: 1.0,
                is_correct: false
            },
            {
                id: 'demo-option-12',
                task_id: 'demo-task-4',
                option_text: 'Radioaktivität wird nicht in der Medizin verwendet',
                points_awarded: 0,
                dose_delta_msv: 2.0,
                is_correct: false
            }
        ]
    }

    const loadLevels = async () => {
        setLoading(true)

        console.log('Loading levels from database...')
        const {data, error} = await supabase
            .from('levels')
            .select('*')

        if (error) {
            console.log('Using demo data due to connection error')
            console.error(error)
            setLevels(demoLevels)
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
            console.log('Using demo data due to connection error')
            console.error(error)
            const level = demoLevels.find(l => l.id === levelId)
            setCurrentLevel(level || null)
        } else {
            setCurrentLevel(data)
        }
    }

    const loadTasks = async (levelId: string) => {
        console.log('Loading levels from database...')
        const {data, error} = await supabase
            .from('tasks')
            .select('*')
            .eq('level_id', levelId)

        if (error) {
            console.log('Using demo data due to connection error')
            console.error(error)
            const levelTasks = demoTasks[levelId] || []
            setTasks(levelTasks)
        } else {
            setTasks(data)
        }

        if (tasks.length > 0) {
            setCurrentTask(tasks[0])
        }
    }

    const loadOptions = async (taskId: string) => {
        console.log('Loading levels from database...')
        const {data, error} = await supabase
            .from('options')
            .select('*')
            .eq('task_id', taskId)

        if (error) {
            console.log('Using demo data due to connection error')
            console.error(error)
            const taskOptions = demoOptions[taskId] || []
            setOptions(taskOptions)
        } else {
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
        if (!user) return

        // Skip database operations for demo users
        if (isDemoUser(user.id)) {
            // Set empty progress for demo users
            setUserProgress([])
            return
        }

        const {data, error} = await supabase
            .from('user_level_progress')
            .select('*')
            .eq('user_id', user.id)

        if (error) {
            console.error('Error loading user progress:', error)
        }

        setUserProgress(data || [])
    }

    const startLevel = async (levelId: string) => {
        if (!user) return

        // Skip database operations for demo users
        if (isDemoUser(user.id)) {
            // Simulate successful level start for demo users
            console.log('Demo user starting level:', levelId)
            return
        }

        const {error} = await supabase
            .from('user_level_progress')
            .upsert({
                user_id: user.id,
                level_id: levelId,
                completed: false
            })

        if (error) {
            console.error('Error starting level:', error)
        }

        await getUserProgress()
    }

    const completeLevel = async (levelId: string) => {
        if (!user) return

        // Skip database operations for demo users
        if (isDemoUser(user.id)) {
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
            .eq('user_id', user.id)
            .eq('level_id', levelId)

        if (error) {
            console.error('Error completing level:', error)
        }

        await getUserProgress()
    }

    // Initialize demo data immediately when component mounts
    useEffect(() => {
        console.log('GameProvider initialized, setting demo levels immediately...')
        setLevels(demoLevels)

        if (user && !isDemoUser(user.id)) {
            void getUserProgress()
        }
    }, [])

    // Also load when user changes
    useEffect(() => {
        if (user) {
            console.log('User changed, ensuring demo levels are loaded...')
            setLevels(demoLevels)

            if (!isDemoUser(user.id)) {
                void getUserProgress()
            }
        }
    }, [user])

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