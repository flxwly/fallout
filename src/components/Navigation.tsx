import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {Home, LogOut, RadioIcon as Radiation, Settings, Skull, User} from 'lucide-react';

export const Navigation: React.FC = () => {
    const {user, signOut} = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const getHealthIcon = (dose: number) => {
        if (dose > 5) return '💀';
        if (dose > 2) return '🤒';
        return '💚';
    };

    return (
        <nav className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg border-b-2 border-red-600">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-red-600 rounded-full">
                            <Radiation className="h-6 w-6 text-white"/>
                        </div>
                        <Link to="/" className="text-2xl font-bold text-white">
                            <span className="text-red-400">Fallout</span> Survival Academy
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link
                            to="/"
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${isActive('/') ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                        >
                            <Home className="h-4 w-4"/>
                            <span>Basis</span>
                        </Link>

                        {user && user.role === 'STUDENT' && (<Link
                                to="/game"
                                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${isActive('/game') ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                            >
                                <Skull className="h-4 w-4"/>
                                <span>Wasteland</span>
                            </Link>)}

                        {user && user.role === 'ADMIN' && (<Link
                                to="/admin"
                                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${location.pathname.startsWith('/admin') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                            >
                                <Settings className="h-4 w-4"/>
                                <span>Kommando</span>
                            </Link>)}

                        {user ? (<div className="flex items-center space-x-4">
                                <Link
                                    to="/profile"
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${isActive('/profile') ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                                >
                                    <User className="h-4 w-4"/>
                                    <span>{user.username}</span>
                                </Link>

                                {user.role === 'STUDENT' && (<div className="flex items-center space-x-4 text-sm">
                                        <div
                                            className="flex items-center space-x-1 px-2 py-1 bg-green-600 rounded-full">
                                            <span
                                                className="text-white font-semibold">🧠 {user.knowledge_points} WP</span>
                                        </div>
                                        <div className="flex items-center space-x-1 px-2 py-1 bg-red-600 rounded-full">
                      <span className="text-white font-semibold">
                        {getHealthIcon(user.dose_msv)} {user.dose_msv.toFixed(1)} mSv
                      </span>
                                        </div>
                                    </div>)}

                                <button
                                    onClick={signOut}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-300 hover:text-red-400 hover:bg-gray-700 transition-colors"
                                >
                                    <LogOut className="h-4 w-4"/>
                                    <span>Verlassen</span>
                                </button>
                            </div>) : (<div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    Anmelden
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Überlebender werden
                                </Link>
                            </div>)}
                    </div>
                </div>
            </div>
        </nav>);
};