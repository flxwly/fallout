import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Zap, BookOpen, Users, Award, AlertTriangle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-green-100 rounded-full">
            <Shield className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Radioaktivität Lernspiel
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Lerne spielerisch die Grundlagen der Radioaktivität kennen. Sammle Wissenspoints, 
          achte auf deine Strahlendosis und werde zum Experten für Strahlenschutz!
        </p>
        
        {user ? (
          user.role === 'student' ? (
            <Link
              to="/game"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              <Zap className="h-5 w-5" />
              <span>Spiel starten</span>
            </Link>
          ) : (
            <Link
              to="/admin"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              <Users className="h-5 w-5" />
              <span>Admin-Bereich</span>
            </Link>
          )
        ) : (
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              <Users className="h-5 w-5" />
              <span>Jetzt registrieren</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-lg font-semibold"
            >
              <span>Anmelden</span>
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg p-8 shadow-lg border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-800">Interaktives Lernen</h3>
          </div>
          <p className="text-gray-600">
            Lerne durch Multiple-Choice-Fragen und Freitextaufgaben. 
            Erhalte sofortiges Feedback und vertiefe dein Wissen.
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg border border-yellow-100">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="h-8 w-8 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-800">Punktesystem</h3>
          </div>
          <p className="text-gray-600">
            Sammle Wissenspoints für richtige Antworten und verfolge 
            deinen Fortschritt durch alle Level.
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg border border-red-100">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Strahlenschutz</h3>
          </div>
          <p className="text-gray-600">
            Achte auf deine virtuelle Strahlendosis! Falsche Antworten 
            erhöhen deine Belastung - wie im echten Leben.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          So funktioniert's
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold text-lg">1</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Registrieren</h4>
            <p className="text-sm text-gray-600">Erstelle dein kostenloses Spielerkonto</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold text-lg">2</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Level wählen</h4>
            <p className="text-sm text-gray-600">Beginne mit den Grundlagen der Radioaktivität</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 font-bold text-lg">3</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Aufgaben lösen</h4>
            <p className="text-sm text-gray-600">Beantworte Fragen und sammle Wissenspoints</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold text-lg">4</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Experte werden</h4>
            <p className="text-sm text-gray-600">Schließe alle Level ab und meistere das Thema</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {!user && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Bereit für das Abenteuer Radioaktivität?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Starte jetzt deine Reise in die Welt der Atomkerne und Strahlung!
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold"
          >
            <Users className="h-5 w-5" />
            <span>Kostenlos registrieren</span>
          </Link>
        </div>
      )}
    </div>
  );
};