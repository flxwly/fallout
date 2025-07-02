import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Trophy, AlertTriangle, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mein Profil</h1>
        <p className="text-gray-600">Verwalte deine Kontoinformationen und verfolge deinen Fortschritt</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
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
            <div className="p-3 bg-gray-50 rounded-md text-gray-800">
              {user?.email || 'Keine E-Mail hinterlegt'}
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'student' && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Spielstatistiken</h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <Trophy className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-green-800 mb-1">
                {user.knowledge_points}
              </div>
              <div className="text-sm text-green-600">Wissenspoints</div>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-yellow-800 mb-1">
                {user.dose_msv.toFixed(1)}
              </div>
              <div className="text-sm text-yellow-600">mSv Strahlendosis</div>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-800 mb-1">
                0/3
              </div>
              <div className="text-sm text-blue-600">Level abgeschlossen</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};