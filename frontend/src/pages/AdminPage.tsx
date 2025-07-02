import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Settings, 
  Plus,
  Download,
  TrendingUp,
  Activity
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

// Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Übersicht über das Lernspiel-System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-gray-600">Gesamte Nutzer</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.activeUsers || 0}</p>
              <p className="text-sm text-gray-600">Aktive Nutzer (7 Tage)</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalLevels || 0}</p>
              <p className="text-sm text-gray-600">Level</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-yellow-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalTasks || 0}</p>
              <p className="text-sm text-gray-600">Aufgaben</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Level Statistics */}
      {stats?.levelStats && (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">Level-Statistiken</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Gestartet</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Abgeschlossen</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Erfolgsquote</th>
                </tr>
              </thead>
              <tbody>
                {stats.levelStats.map((level: any) => (
                  <tr key={level.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-800">{level.title}</td>
                    <td className="py-3 px-4 text-gray-600">{level.users_started}</td>
                    <td className="py-3 px-4 text-gray-600">{level.users_completed}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        level.completion_rate >= 80 ? 'bg-green-100 text-green-800' :
                        level.completion_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {level.completion_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {stats?.recentAttempts && (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">Letzte Aktivitäten</h2>
          <div className="space-y-4">
            {stats.recentAttempts.map((attempt: any) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{attempt.username}</p>
                  <p className="text-sm text-gray-600">{attempt.level_title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">+{attempt.points_got} Punkte</p>
                  <p className="text-xs text-gray-500">
                    {new Date(attempt.timestamp).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Admin Users Component
const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users', {
        params: { search, limit: 50 }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async () => {
    try {
      const response = await axios.get('/api/admin/export/users', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Benutzerverwaltung</h1>
          <p className="text-gray-600">Verwalte alle registrierten Schüler</p>
        </div>
        <button
          onClick={exportUsers}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>CSV Export</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Suche nach Benutzername oder E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Benutzername</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">E-Mail</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Punkte</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Dosis (mSv)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Registriert</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Letzte Anmeldung</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{user.username}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email || '-'}</td>
                    <td className="py-3 px-4 text-green-600 font-medium">{user.knowledge_points}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        user.dose_msv > 5 ? 'text-red-600' :
                        user.dose_msv > 2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {user.dose_msv.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('de-DE') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Levels Component (simplified)
const AdminLevels: React.FC = () => {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await axios.get('/api/admin/levels');
      setLevels(response.data);
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Level-Verwaltung</h1>
          <p className="text-gray-600">Verwalte Inhalte und Aufgaben</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Neues Level</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {levels.map((level) => (
              <div key={level.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{level.title}</h3>
                    <p className="text-gray-600 mb-4">{level.intro_text?.substring(0, 150)}...</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Reihenfolge: {level.ordering}</span>
                      <span>Aufgaben: {level.taskCount}</span>
                      <span>Status: {level.is_active ? 'Aktiv' : 'Inaktiv'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      Bearbeiten
                    </button>
                    <button className="px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors">
                      Klonen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Admin Page Component
export const AdminPage: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3, current: location.pathname === '/admin' },
    { name: 'Benutzer', href: '/admin/users', icon: Users, current: location.pathname === '/admin/users' },
    { name: 'Level', href: '/admin/levels', icon: BookOpen, current: location.pathname === '/admin/levels' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex space-x-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Administration</h2>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/levels" element={<AdminLevels />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};