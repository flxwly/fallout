import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, Home, Gamepad2, Shield } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b-2 border-green-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-green-600" />
            <Link to="/" className="text-2xl font-bold text-gray-800">
              Radioaktivität Lernspiel
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {user && user.role === 'student' && (
              <Link
                to="/game"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/game') 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Spiel</span>
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  location.pathname.startsWith('/admin') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/profile') 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </Link>
                
                {user.role === 'student' && (
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-600 font-semibold">🏆 {user.knowledge_points}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`font-semibold ${
                        user.dose_msv > 5 ? 'text-red-600' : 
                        user.dose_msv > 2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        ☢️ {user.dose_msv.toFixed(1)} mSv
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Abmelden</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-green-600 hover:text-green-700 transition-colors"
                >
                  Anmelden
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Registrieren
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};