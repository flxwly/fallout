import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import {roles} from "../supabase/supabase.ts";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();

  if (user.profile && user.stats) {
    return <Navigate to={roles.indexOf(user.profile?.permission_level || 'STUDENT') > 0 ? '/admin' : '/game'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    const result = await signIn(username, password);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Willkommen zurück, ${username}!`);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <Shield className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Anmelden
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Benutzername
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Dein Benutzername"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Passwort
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Dein Passwort"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Anmeldung läuft...' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Noch kein Konto?{' '}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
              Jetzt registrieren
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Demo-Zugangsdaten:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Schüler:</strong> student1 / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};