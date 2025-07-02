import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Send, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from  'react-hot-toast';

export const LevelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchLevel, submitAnswer, startLevel, completeLevel } = useGame();
  
  const [level, setLevel] = useState<any>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (id) {
      loadLevel(parseInt(id));
    }
  }, [id]);

  const loadLevel = async (levelId: number) => {
    try {
      setLoading(true);
      const levelData = await fetchLevel(levelId);
      if (levelData) {
        setLevel(levelData);
        await startLevel(levelId);
      } else {
        toast.error('Level nicht gefunden');
        navigate('/game');
      }
    } catch (error) {
      toast.error('Fehler beim Laden des Levels');
      navigate('/game');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLevel = () => {
    setShowIntro(false);
  };

  const handleAnswerSubmit = async () => {
    if (!level || !level.tasks || !level.tasks[currentTaskIndex]) return;

    const currentTask = level.tasks[currentTaskIndex];
    const answer = answers[currentTask.id];

    if (!answer) {
      toast.error('Bitte wähle eine Antwort aus');
      return;
    }

    try {
      setSubmitting(true);
      const result = await submitAnswer(currentTask.id, answer);
      setFeedback(result);
    } catch (error) {
      toast.error('Fehler beim Übermitteln der Antwort');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextTask = () => {
    setFeedback(null);
    if (currentTaskIndex < level.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleCompleteLevel();
    }
  };

  const handleCompleteLevel = async () => {
    try {
      await completeLevel(level.id);
      toast.success('Level abgeschlossen!');
      navigate('/game');
    } catch (error) {
      toast.error('Fehler beim Abschließen des Levels');
    }
  };

  const handleAnswerChange = (taskId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [taskId]: answer }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Level nicht gefunden</h2>
        <button
          onClick={() => navigate('/game')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Zurück zum Spiel
        </button>
      </div>
    );
  }

  if (showIntro) {
    return (
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('/game')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Zurück</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-800">{level.title}</h1>
          </div>

          <div className="prose max-w-none mb-8">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {level.intro_text}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleStartLevel}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              Level starten
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentTask = level.tasks[currentTaskIndex];
  const isLastTask = currentTaskIndex === level.tasks.length - 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/game')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Zurück</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-800">{level.title}</h1>
        </div>

        <div className="text-sm text-gray-600">
          Aufgabe {currentTaskIndex + 1} von {level.tasks.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentTaskIndex + 1) / level.tasks.length) * 100}%` }}
        ></div>
      </div>

      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div
            key={`task-${currentTaskIndex}`}
            className="bg-white rounded-lg shadow-lg p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentTask.prompt_text}
            </h2>

            {currentTask.type === 'mc' ? (
              <div className="space-y-4">
                {currentTask.options?.map((option: any) => (
                  <label
                    key={option.id}
                    className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={`task-${currentTask.id}`}
                      value={option.id}
                      checked={answers[currentTask.id] === option.id}
                      onChange={(e) => handleAnswerChange(currentTask.id, parseInt(e.target.value))}
                      className="mt-1 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">{option.option_text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <textarea
                  value={answers[currentTask.id] || ''}
                  onChange={(e) => handleAnswerChange(currentTask.id, e.target.value)}
                  placeholder="Schreibe deine Antwort hier..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tipp: Schreibe mindestens 2-3 Sätze für eine gute Bewertung.
                </p>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={handleAnswerSubmit}
                disabled={!answers[currentTask.id] || submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Wird übermittelt...' : 'Antwort abgeben'}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`feedback-${currentTaskIndex}`}
            className="bg-white rounded-lg shadow-lg p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center space-y-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                feedback.isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {feedback.isCorrect ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
              </div>

              <div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {feedback.isCorrect ? 'Richtig!' : 'Nicht ganz richtig'}
                </h3>
                <p className="text-gray-700 text-lg">{feedback.feedback}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{feedback.pointsAwarded}
                  </div>
                  <div className="text-sm text-gray-600">Wissenspoints</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    feedback.doseReceived > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {feedback.doseReceived > 0 ? '+' : ''}{feedback.doseReceived.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">mSv Dosis</div>
                </div>
              </div>

              {feedback.doseReceived > 0 && (
                <div className="flex items-center justify-center space-x-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">
                    Vorsicht! Deine Strahlenbelastung ist gestiegen.
                  </span>
                </div>
              )}

              <button
                onClick={handleNextTask}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLastTask ? 'Level abschließen' : 'Nächste Aufgabe'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};