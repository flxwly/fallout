import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, Trophy, Skull, RadioIcon as Radiation, Heart, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

export const GamePage: React.FC = () => {
  const { levels, loading, loadLevels } = useGame();
  const { user } = useAuth();

  useEffect(() => {
    loadLevels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const getHealthStatus = (dose: number) => {
    if (dose > 5) return { icon: '💀', status: 'Kritisch', color: 'text-red-600' };
    if (dose > 2) return { icon: '🤒', status: 'Krank', color: 'text-yellow-600' };
    return { icon: '💚', status: 'Gesund', color: 'text-green-600' };
  };

  const healthStatus = getHealthStatus(user?.dose_msv || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-full border-2 border-red-300">
            <Radiation className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800">
          Willkommen in der <span className="text-red-600">Wasteland</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Du bist erwacht, {user?.username}! Die Stadt liegt in Trümmern, überall kleben komische Aufkleber. 
          Es gab einen radioaktiven Unfall. Sammle Wissen, achte auf deine Gesundheit und überlebe!
        </p>
      </div>

      {/* Survival Dashboard */}
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
                {user?.knowledge_points || 0}
              </p>
              <p className="text-sm text-gray-600">Wissenspunkte</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600">
            💡 Sammle durch richtige Antworten
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <Coins className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                120€
              </p>
              <p className="text-sm text-gray-600">Budget</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            💰 Für Ausrüstung & Schutz
          </div>
        </motion.div>

        <motion.div 
          className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${
            (user?.dose_msv || 0) > 5 ? 'border-red-500' : 
            (user?.dose_msv || 0) > 2 ? 'border-yellow-500' : 'border-green-500'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <Radiation className={`h-8 w-8 ${
              (user?.dose_msv || 0) > 5 ? 'text-red-600' : 
              (user?.dose_msv || 0) > 2 ? 'text-yellow-600' : 'text-green-600'
            }`} />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {(user?.dose_msv || 0).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">mSv Strahlung</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-red-600">
            ☢️ Halte sie niedrig!
          </div>
        </motion.div>

        <motion.div 
          className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${
            healthStatus.color === 'text-red-600' ? 'border-red-500' : 
            healthStatus.color === 'text-yellow-600' ? 'border-yellow-500' : 'border-green-500'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            <Heart className={`h-8 w-8 ${healthStatus.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {healthStatus.icon}
              </p>
              <p className={`text-sm font-medium ${healthStatus.color}`}>
                {healthStatus.status}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            🏥 Gesundheitszustand
          </div>
        </motion.div>
      </div>

      {/* Health Warning */}
      {user && user.dose_msv > 2 && (
        <motion.div 
          className={`p-4 rounded-lg border-2 ${
            user.dose_msv > 5 ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <Skull className={`h-6 w-6 ${user.dose_msv > 5 ? 'text-red-600' : 'text-yellow-600'}`} />
            <p className={`font-medium ${user.dose_msv > 5 ? 'text-red-800' : 'text-yellow-800'}`}>
              {user.dose_msv > 5 
                ? '💀 KRITISCH! Deine Strahlendosis ist lebensgefährlich! Du musst sofort bessere Entscheidungen treffen!'
                : '🤒 WARNUNG! Du wirst krank durch die Strahlung. Achte besser auf deine Antworten!'
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Mission Briefing */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">🏚️ Aktuelle Mission</h2>
        <p className="text-gray-300 leading-relaxed">
          Du befindest dich in einer verstrahlten Stadt nach einem nuklearen Unfall. 
          Überall siehst du Warnschilder und merkwürdige Aufkleber. Deine Aufgabe: 
          <strong className="text-orange-400"> Sammle Wissen über Radioaktivität</strong>, 
          treffe kluge Entscheidungen und <strong className="text-red-400">überlebe</strong>!
        </p>
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="text-sm text-yellow-300">
            💡 <strong>Tipp:</strong> Jede Entscheidung hat Konsequenzen. Falsche Antworten erhöhen deine Strahlendosis. 
            Begründe deine Entscheidungen wissenschaftlich - das kann dein Leben retten!
          </p>
        </div>
      </div>

      {/* Exploration Areas (Levels) */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
          <Radiation className="h-6 w-6 text-red-600" />
          <span>Erkundungsgebiete</span>
        </h2>
        
        <div className="grid gap-6">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all border-l-4 border-orange-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {level.ordering}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        🏚️ {level.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          ☢️ Verstrahlt
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          🎯 Mission verfügbar
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {level.intro_text?.substring(0, 200)}
                    {level.intro_text && level.intro_text.length > 200 ? '...' : ''}
                  </p>
                </div>

                <div className="ml-6">
                  <Link
                    to={`/level/${level.id}`}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
                  >
                    <Play className="h-4 w-4" />
                    <span>Erkunden</span>
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
            <Skull className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Keine Gebiete verfügbar
          </h3>
          <p className="text-gray-500">
            Die Wasteland wird noch kartographiert. Bald gibt es neue Gebiete zu erkunden!
          </p>
        </div>
      )}
    </div>
  );
};