import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {AlertTriangle, BookOpen, Heart, Play, RadioIcon as Radiation, Shield, Skull, Users} from 'lucide-react';

export const HomePage: React.FC = () => {
    const {user} = useAuth();

    return (<div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div
                        className="p-4 bg-gradient-to-br from-red-100 to-orange-100 rounded-full border-2 border-red-300">
                        <Radiation className="h-16 w-16 text-red-600"/>
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                    <span className="text-red-600">Fallout</span> Survival Academy
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Du erwachst in einer verstrahlten Stadt voller Trümmer. Überall kleben komische Aufkleber -
                    es gab einen radioaktiven Unfall! Sammle <span
                    className="text-green-600 font-semibold">Wissenspunkte</span>,
                    achte auf deine <span className="text-red-600 font-semibold">Strahlendosis</span> und überlebe in
                    der Wasteland!
                </p>

                {user ? (user.role === 'STUDENT' ? (<Link
                            to="/game"
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all text-lg font-semibold shadow-lg"
                        >
                            <Radiation className="h-5 w-5"/>
                            <span>Wasteland betreten</span>
                        </Link>) : (<Link
                            to="/admin"
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                        >
                            <Shield className="h-5 w-5"/>
                            <span>Kommandozentrale</span>
                        </Link>)) : (<div className="flex justify-center space-x-4">
                        <Link
                            to="/register"
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all text-lg font-semibold shadow-lg"
                        >
                            <Users className="h-5 w-5"/>
                            <span>Überlebender werden</span>
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-lg font-semibold"
                        >
                            <span>Anmelden</span>
                        </Link>
                    </div>)}
            </div>

            {/* Game Mechanics Section */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg p-8 shadow-lg border border-green-200 relative overflow-hidden">
                    <div
                        className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                    <div className="flex items-center space-x-3 mb-4">
                        <BookOpen className="h-8 w-8 text-green-600"/>
                        <h3 className="text-xl font-semibold text-gray-800">Wissen sammeln</h3>
                    </div>
                    <p className="text-gray-600">
                        Löse Rätsel und beantworte Fragen über Radioaktivität.
                        Jede richtige Antwort bringt dir <strong>Wissenspunkte (WP)</strong> -
                        deine Währung zum Überleben!
                    </p>
                </div>

                <div className="bg-white rounded-lg p-8 shadow-lg border border-red-200 relative overflow-hidden">
                    <div
                        className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                    <div className="flex items-center space-x-3 mb-4">
                        <Radiation className="h-8 w-8 text-red-600"/>
                        <h3 className="text-xl font-semibold text-gray-800">Strahlung meiden</h3>
                    </div>
                    <p className="text-gray-600">
                        Falsche Entscheidungen erhöhen deine <strong>Strahlendosis (mSv)</strong>!
                        Zu viel Strahlung macht dich krank. Denke gut nach, bevor du handelst.
                    </p>
                </div>

                <div className="bg-white rounded-lg p-8 shadow-lg border border-blue-200 relative overflow-hidden">
                    <div
                        className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                    <div className="flex items-center space-x-3 mb-4">
                        <Heart className="h-8 w-8 text-blue-600"/>
                        <h3 className="text-xl font-semibold text-gray-800">Überleben</h3>
                    </div>
                    <p className="text-gray-600">
                        Begründe deine Entscheidungen wissenschaftlich!
                        Eine KI analysiert deine Argumentation und hilft dir,
                        ein echter Strahlenschutz-Experte zu werden.
                    </p>
                </div>
            </div>

            {/* Survival Guide */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 shadow-lg text-white">
                <h2 className="text-3xl font-bold mb-8 text-center text-orange-400">
                    🏚️ Überlebenshandbuch für die Wasteland
                </h2>

                <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div
                            className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">1</span>
                        </div>
                        <h4 className="font-semibold text-orange-300 mb-2">Erwachen</h4>
                        <p className="text-sm text-gray-300">Du erwachst in den Trümmern einer verstrahlten Stadt</p>
                    </div>

                    <div className="text-center">
                        <div
                            className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">2</span>
                        </div>
                        <h4 className="font-semibold text-red-300 mb-2">Erkunden</h4>
                        <p className="text-sm text-gray-300">Finde Hinweise und löse Rätsel über Radioaktivität</p>
                    </div>

                    <div className="text-center">
                        <div
                            className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">3</span>
                        </div>
                        <h4 className="font-semibold text-yellow-300 mb-2">Entscheiden</h4>
                        <p className="text-sm text-gray-300">Treffe kluge Entscheidungen und sammle Wissenspunkte</p>
                    </div>

                    <div className="text-center">
                        <div
                            className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">4</span>
                        </div>
                        <h4 className="font-semibold text-green-300 mb-2">Überleben</h4>
                        <p className="text-sm text-gray-300">Werde zum Strahlenschutz-Experten und überlebe!</p>
                    </div>
                </div>
            </div>

            {/* Game Stats */}
            <div className="bg-white rounded-lg p-8 shadow-lg border-l-4 border-orange-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                    <Skull className="h-6 w-6 text-orange-600"/>
                    <span>Deine Überlebensstatistiken</span>
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600 mb-1">💰 120€</div>
                        <div className="text-sm text-green-700">Startbudget</div>
                        <div className="text-xs text-gray-600 mt-1">Für Ausrüstung und Schutz</div>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600 mb-1">🧠 0 WP</div>
                        <div className="text-sm text-blue-700">Wissenspunkte</div>
                        <div className="text-xs text-gray-600 mt-1">Sammle durch richtige Antworten</div>
                    </div>

                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600 mb-1">☢️ 0 mSv</div>
                        <div className="text-sm text-red-700">Strahlendosis</div>
                        <div className="text-xs text-gray-600 mt-1">Halte sie niedrig!</div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1"/>
                        <div>
                            <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Überlebenswichtig!</h4>
                            <p className="text-sm text-yellow-700">
                                Zu viele Ausgaben lassen wenig Geld für weitere Aufgaben.
                                Die Gesundheitsleiste sinkt durch Radioaktivität.
                                Einmal erlittene Schäden werden nicht geheilt -
                                <strong> argumentiere physikalisch fundiert für weniger Strahlenschäden!</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Section */}
            {!user && (<div
                    className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-lg p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">
                            🎮 Bereit für das Wasteland-Abenteuer?
                        </h2>
                        <p className="text-xl mb-6 opacity-90">
                            Teste das Spiel mit den Demo-Zugangsdaten
                        </p>
                        <div className="bg-black/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                            <div className="text-left space-y-2">
                                <p><strong>🛡️ Kommandant:</strong> admin / admin123</p>
                                <p><strong>🎯 Überlebender:</strong> student1 / admin123</p>
                            </div>
                        </div>
                        <Link
                            to="/login"
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold shadow-lg"
                        >
                            <Play className="h-5 w-5"/>
                            <span>Wasteland betreten</span>
                        </Link>
                    </div>
                </div>)}
        </div>);
};