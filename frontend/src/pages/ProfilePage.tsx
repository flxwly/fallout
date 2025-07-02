import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { User, Trophy, AlertTriangle, Calendar, Mail, Edit2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { progress } = useGame();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      setProfileData(response.data);
      setEmail(response.data.user.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Fehler beim Laden des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      const response = await axios.put('/api/users/profile', { email });
      updateUser(response.data);
      setEditing(false);
      toast.success('E-Mail erfolgreich aktualisiert');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Aktualisieren der E-Mail';
      toast.error(message);
    }
  };

  const getSafetyColor = (dose: number) => {
    if (dose > 5) return 'text-red-600 bg-red-100 border-red-200';
    if (dose > 2) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mein Profil</h1>
        <p className="text-gray-600">Verwalte deine Kontoinformationen und verfolge deinen Fortschritt</p>
      </div>

      {/* User Info Card */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{user?.username}</h2>
            <p className="text-gray-600 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benutzername
            </label>
            <div className="p-3 bg-gray-50 rounded-md text-gray-800">
              {user?.username}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail
            </label>
            {editing ? (
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="deine@email.de"
                />
                <button
                  onClick={handleSaveEmail}
                  className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEmail(user?.email || '');
                  }}
                  className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-md text-gray-800">
                  {user?.email || 'Keine E-Mail hinterlegt'}
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {profileData?.user && (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registriert seit
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md text-gray-800">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(profileData.user.created_at)}</span>
              </div>
            </div>

            {profileData.user.last_login && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Letzte Anmeldung
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md text-gray-800">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(profileData.user.last_login)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Game Statistics (only for students) */}
      {user?.role === 'student' && (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">Spielstatistiken</h3>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <Trophy className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-green-800 mb-1">
                {user.knowledge_points}
              </div>
              <div className="text-sm text-green-600">Wissenspoints</div>
            </div>

            <div className={`text-center p-6 rounded-lg border ${getSafetyColor(user.dose_msv)}`}>
              <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">
                {user.dose_msv.toFixed(1)}
              </div>
              <div className="text-sm">mSv Strahlendosis</div>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-800 mb-1">
                {progress?.completedLevels || 0}/{progress?.totalLevels || 0}
              </div>
              <div className="text-sm text-blue-600">Level abgeschlossen</div>
            </div>
          </div>

          {progress?.safetyMessage && (
            <div className={`p-4 rounded-lg border ${getSafetyColor(user.dose_msv)}`}>
              <p className="text-center font-medium">
                {progress.safetyMessage}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Activity (only for students) */}
      {user?.role === 'student' && profileData?.recentAttempts && (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">Letzte Aktivitäten</h3>

          {profileData.recentAttempts.length > 0 ? (
            <div className="space-y-4">
              {profileData.recentAttempts.map((attempt: any, index: number) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{attempt.level_title}</h4>
                    <p className="text-sm text-gray-600">{attempt.prompt_text.substring(0, 100)}...</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      +{attempt.points_got} Punkte
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(attempt.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Noch keine Aktivitäten vorhanden.</p>
              <p className="text-sm">Starte dein erstes Level, um hier Fortschritte zu sehen!</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};