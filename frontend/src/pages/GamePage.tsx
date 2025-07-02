import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const GamePage: React.FC = () => {
  const { levels, progress, loading, fetchLevels } = useGame();
  const { user } = useAuth();

  useEffect(() => {
    fetchLevels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getSafetyColor = (dose: number) => {
    if (dose > 5) return 'text-red-600 bg-red-100';
    if (dose > 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSafetyIcon = (rating: string) => {
    switch (rating) {
      case 'red': return '🔴';
      case 'yellow': return '🟡';
      default: return '🟢';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">
          Radioaktivität Lernspiel
        </h1>
        <p className="text-gray-600">
          Willkommen, {user?.username}! Wähle ein Level und beginne deine Lernreise.
        </p>
      </div>

      {/* Progress Dashboard */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {progress?.knowledgePoints || 0}
              </p>
              <p className="text-sm text-gray-600">Wissenspoints</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${
            (progress?.doseMSv || 0) > 5 ? 'border-red-500' : 
            (progress?.doseMSv || 0) > 2 ? 'border-yellow-500' : 'border-green-500'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`h-8 w-8 ${
              (progress?.doseMSv || 0) > 5 ? 'text-red-600' : 
              (progress?.doseMSv || 0) > 2 ? 'text-yellow-600' : 'text-green-600'
            }`} />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {(progress?.doseMSv || 0).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">mSv Dosis</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {progress?.completedLevels || 0}/{progress?.totalLevels || 0}
              </p>
              <p className="text-sm text-gray-600">Level abgeschlossen</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${
            progress?.safetyRating === 'red' ? 'border-red-500' : 
            progress?.safetyRating === 'yellow' ? 'border-yellow-500' : 'border-green-500'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {getSafetyIcon(progress?.safetyRating || 'green')}
            </span>
            <div>
              <p className="text-lg font-bold text-gray-800">Sicherheit</p>
              <p className="text-sm text-gray-600">
                {progress?.safetyRating === 'red' ? 'Gefährlich' : 
                 progress?.safetyRating === 'yellow' ? 'Vorsicht' : 'Sicher'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Safety Message */}
      {progress?.safetyMessage && (
        <motion.div 
          className={`p-4 rounded-lg ${
            progress.safetyRating === 'red' ? 'bg-red-50 border border-red-200' : 
            progress.safetyRating === 'yellow' ? 'bg-yellow-50 border border-yellow-200' : 
            'bg-green-50 border border-green-200'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className={`text-center font-medium ${
            progress.safetyRating === 'red' ? 'text-red-800' : 
            progress.safetyRating === 'yellow' ? 'text-yellow-800' : 
            'text-green-800'
          }`}>
            {progress.safetyMessage}
          </p>
        </motion.div>
      )}

      {/* Levels Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Verfügbare Level</h2>
        
        <div className="grid gap-6">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      {level.ordering}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {level.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {level.intro_text?.substring(0, 200)}
                    {level.intro_text && level.intro_text.length > 200 ? '...' : ''}
                  </p>
                </div>

                <div className="ml-6">
                  <Link
                    to={`/level/${level.id}`}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>Level starten</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {levels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Keine Level verfügbar
          </h3>
          <p className="text-gray-500">
            Momentan sind keine Level verfügbar. Kontaktiere deinen Administrator.
          </p>
        </div>
      )}
    </div>
  );
};