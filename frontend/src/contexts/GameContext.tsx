import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Level {
  id: number;
  title: string;
  intro_text: string;
  topic_tag: string;
  ordering: number;
  tasks?: Task[];
}

interface Task {
  id: number;
  level_id: number;
  type: 'mc' | 'free';
  prompt_text: string;
  ordering: number;
  options?: Option[];
}

interface Option {
  id: number;
  task_id: number;
  option_text: string;
  points_awarded: number;
  dose_delta_msv: number;
  ordering: number;
}

interface GameProgress {
  knowledgePoints: number;
  doseMSv: number;
  completedLevels: number;
  totalLevels: number;
  safetyRating: 'green' | 'yellow' | 'red';
  safetyMessage: string;
}

interface GameContextType {
  levels: Level[];
  currentLevel: Level | null;
  progress: GameProgress | null;
  loading: boolean;
  fetchLevels: () => Promise<void>;
  fetchLevel: (id: number) => Promise<Level | null>;
  fetchProgress: () => Promise<void>;
  submitAnswer: (taskId: number, answer: any) => Promise<any>;
  startLevel: (levelId: number) => Promise<void>;
  completeLevel: (levelId: number) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchLevels();
    if (user && user.role === 'student') {
      fetchProgress();
    }
  }, [user]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/levels');
      setLevels(response.data);
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevel = async (id: number): Promise<Level | null> => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/levels/${id}`);
      const level = response.data;
      setCurrentLevel(level);
      return level;
    } catch (error) {
      console.error('Error fetching level:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!user || user.role !== 'student') return;
    
    try {
      const response = await axios.get('/api/game/progress');
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const submitAnswer = async (taskId: number, answer: any) => {
    try {
      const response = await axios.post('/api/game/submit-answer', {
        task_id: taskId,
        answer
      });
      
      // Update user stats in auth context
      if (user) {
        const { updateUser } = useAuth();
        updateUser({
          knowledge_points: response.data.totalPoints,
          dose_msv: response.data.totalDose
        });
      }
      
      // Refresh progress
      await fetchProgress();
      
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  const startLevel = async (levelId: number) => {
    try {
      await axios.post('/api/game/start-level', { level_id: levelId });
      await fetchProgress();
    } catch (error) {
      console.error('Error starting level:', error);
      throw error;
    }
  };

  const completeLevel = async (levelId: number) => {
    try {
      await axios.post('/api/game/complete-level', { level_id: levelId });
      await fetchProgress();
    } catch (error) {
      console.error('Error completing level:', error);
      throw error;
    }
  };

  const value = {
    levels,
    currentLevel,
    progress,
    loading,
    fetchLevels,
    fetchLevel,
    fetchProgress,
    submitAnswer,
    startLevel,
    completeLevel
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};