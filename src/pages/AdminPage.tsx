import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Settings, 
  Plus,
  Download,
  TrendingUp,
  Activity,
  Edit2,
  Trash2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Star,
  Target,
  Lightbulb,
  DollarSign,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Enhanced Level Editor Component
const LevelEditor: React.FC<{
  level?: any;
  onSave: (levelData: any) => void;
  onCancel: () => void;
}> = ({ level, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: level?.title || '',
    intro_text: level?.intro_text || '',
    ordering: level?.ordering || 1,
    is_active: level?.is_active ?? true,
    tasks: level?.tasks || []
  });

  const [currentTask, setCurrentTask] = useState<any>(null);
  const [showTaskEditor, setShowTaskEditor] = useState(false);

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Titel ist erforderlich');
      return;
    }
    onSave(formData);
  };

  const handleAddTask = () => {
    setCurrentTask({
      id: `task-${Date.now()}`,
      type: 'mc',
      prompt_text: '',
      ordering: formData.tasks.length + 1,
      is_active: true,
      options: [],
      evaluation_criteria: ''
    });
    setShowTaskEditor(true);
  };

  const handleEditTask = (task: any) => {
    setCurrentTask(task);
    setShowTaskEditor(true);
  };

  const handleSaveTask = (taskData: any) => {
    const updatedTasks = currentTask.id.startsWith('task-') && !formData.tasks.find((t: any) => t.id === currentTask.id)
      ? [...formData.tasks, taskData]
      : formData.tasks.map((t: any) => t.id === taskData.id ? taskData : t);
    
    setFormData(prev => ({ ...prev, tasks: updatedTasks }));
    setShowTaskEditor(false);
    setCurrentTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Aufgabe wirklich löschen?')) {
      setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.filter((t: any) => t.id !== taskId)
      }));
    }
  };

  if (showTaskEditor) {
    return (
      <TaskEditor
        task={currentTask}
        onSave={handleSaveTask}
        onCancel={() => {
          setShowTaskEditor(false);
          setCurrentTask(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {level ? 'Level bearbeiten' : 'Neues Level erstellen'}
        </h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Basic Level Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titel *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="z.B. Die verstrahlten Ruinen"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reihenfolge
          </label>
          <input
            type="number"
            value={formData.ordering}
            onChange={(e) => setFormData(prev => ({ ...prev, ordering: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Einführungstext
        </label>
        <textarea
          value={formData.intro_text}
          onChange={(e) => setFormData(prev => ({ ...prev, intro_text: e.target.value }))}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Beschreibe das Setting und was die Schüler lernen werden..."
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="mr-2 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Level ist aktiv</span>
        </label>
      </div>

      {/* Tasks Section */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-800">Aufgaben ({formData.tasks.length})</h4>
          <button
            onClick={handleAddTask}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Aufgabe hinzufügen</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.tasks.map((task: any, index: number) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">#{task.ordering}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.type === 'mc' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {task.type === 'mc' ? 'Multiple Choice' : 'Freitext'}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-2">{task.prompt_text || 'Keine Aufgabenstellung'}</p>
                  {task.options && task.options.length > 0 && (
                    <p className="text-sm text-gray-600">{task.options.length} Antwortoptionen</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {formData.tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Noch keine Aufgaben erstellt</p>
              <p className="text-sm">Füge die erste Aufgabe hinzu</p>
            </div>
          )}
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Level speichern</span>
        </button>
      </div>
    </div>
  );
};

// Task Editor Component
const TaskEditor: React.FC<{
  task: any;
  onSave: (taskData: any) => void;
  onCancel: () => void;
}> = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: task.id,
    type: task.type || 'mc',
    prompt_text: task.prompt_text || '',
    ordering: task.ordering || 1,
    is_active: task.is_active ?? true,
    evaluation_criteria: task.evaluation_criteria || '',
    options: task.options || []
  });

  const handleSave = () => {
    if (!formData.prompt_text.trim()) {
      toast.error('Aufgabenstellung ist erforderlich');
      return;
    }
    if (formData.type === 'mc' && formData.options.length === 0) {
      toast.error('Multiple Choice Aufgaben benötigen mindestens eine Antwortoption');
      return;
    }
    onSave(formData);
  };

  const handleAddOption = () => {
    const newOption = {
      id: `option-${Date.now()}`,
      option_text: '',
      points_awarded: 0,
      cost_euros: 0,
      dose_delta_msv: 0,
      is_correct: false,
      ordering: formData.options.length + 1
    };
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
  };

  const handleUpdateOption = (optionId: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt: any) => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    }));
  };

  const handleDeleteOption = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((opt: any) => opt.id !== optionId)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Aufgabe bearbeiten</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Task Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aufgabentyp
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="mc">Multiple Choice</option>
            <option value="free">Freitext</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reihenfolge
          </label>
          <input
            type="number"
            value={formData.ordering}
            onChange={(e) => setFormData(prev => ({ ...prev, ordering: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aufgabenstellung *
        </label>
        <textarea
          value={formData.prompt_text}
          onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Beschreibe die Aufgabe im Kontext des Spiels..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          KI-Bewertungskriterien
        </label>
        <textarea
          value={formData.evaluation_criteria}
          onChange={(e) => setFormData(prev => ({ ...prev, evaluation_criteria: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Spezifische Kriterien für die KI-Bewertung der Schüler-Begründungen..."
        />
        <p className="text-sm text-gray-500 mt-1">
          Diese Kriterien werden der KI übergeben, um die Begründungen der Schüler zu bewerten.
        </p>
      </div>

      {/* Multiple Choice Options */}
      {formData.type === 'mc' && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-800">Antwortoptionen</h4>
            <button
              onClick={handleAddOption}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Option hinzufügen</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.options.map((option: any, index: number) => (
              <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Antworttext
                    </label>
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => handleUpdateOption(option.id, { option_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="z.B. Gelber Strahlenschutzanzug (50€)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Zap className="inline h-4 w-4 text-green-600 mr-1" />
                      Wissenspunkte
                    </label>
                    <input
                      type="number"
                      value={option.points_awarded}
                      onChange={(e) => handleUpdateOption(option.id, { points_awarded: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline h-4 w-4 text-blue-600 mr-1" />
                      Kosten (€)
                    </label>
                    <input
                      type="number"
                      value={option.cost_euros || 0}
                      onChange={(e) => handleUpdateOption(option.id, { cost_euros: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ☢️ Strahlendosis (mSv)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={option.dose_delta_msv}
                      onChange={(e) => handleUpdateOption(option.id, { dose_delta_msv: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={(e) => handleUpdateOption(option.id, { is_correct: e.target.checked })}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Beste Antwort</span>
                    </label>
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {formData.options.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Noch keine Antwortoptionen</p>
                <p className="text-sm">Füge die erste Option hinzu</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save/Cancel Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Aufgabe speichern</span>
        </button>
      </div>
    </div>
  );
};

// Enhanced Admin Levels Component with full editor
const AdminLevels: React.FC = () => {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Demo levels data with the shopping task
  const demoLevels = [
    {
      id: 'demo-level-1',
      title: 'Die verstrahlten Ruinen - Der Klamottenladen',
      intro_text: 'Du erwachst in den Trümmern einer einst blühenden Stadt. Überall siehst du seltsame Warnschilder mit dem Strahlensymbol. Die Luft flimmert merkwürdig, und dein Geigerzähler klickt bedrohlich.\n\nAuf der Ecke findest du einen halb-zerstörten Klamottenladen, in den du hineingehst. Ein alter Mann verkauft dort übrig gebliebene Kleidung und andere nützliche Dinge.\n\nDu hast wie in jedem Computerspiel eine Gesundheitsleiste, ein gewisses Budget und eine Wissensleiste. Dein Ziel ist es am Ende die beiden Leisten möglichst voll zu haben. Das Geld spielt am Ende keine große Rolle.',
      topic_tag: 'radioactivity',
      ordering: 1,
      is_active: true,
      taskCount: 2,
      tasks: [
        {
          id: 'demo-task-shopping',
          type: 'mc',
          prompt_text: 'Du findest einen halb-zerstörten Klamottenladen, in den du hineingehst. Ein alter Mann verkauft dort übrig gebliebene Kleidung und andere nützliche Dinge. Du musst entscheiden, was du dort kaufen willst:',
          ordering: 1,
          evaluation_criteria: 'Bewerte ob der Schüler versteht, dass Strahlenschutz wichtiger ist als Kosten. Achte auf Verständnis von Schutzwirkung verschiedener Materialien.',
          options: [
            { id: 'opt1', option_text: 'A) T-Shirt (0€)', points_awarded: 2, cost_euros: 0, dose_delta_msv: 3.0, is_correct: false },
            { id: 'opt2', option_text: 'B) Gelber Strahlenschutzanzug (50€)', points_awarded: 8, cost_euros: 50, dose_delta_msv: 0.0, is_correct: true },
            { id: 'opt3', option_text: 'C) Dicke Winterjacke (20€)', points_awarded: 4, cost_euros: 20, dose_delta_msv: 1.5, is_correct: false },
            { id: 'opt4', option_text: 'D) Normale Schutzmaske (20€)', points_awarded: 3, cost_euros: 20, dose_delta_msv: 2.0, is_correct: false },
            { id: 'opt5', option_text: 'E) Mundschutz (3€)', points_awarded: 2, cost_euros: 3, dose_delta_msv: 2.5, is_correct: false },
            { id: 'opt6', option_text: 'F) Mütze (5€)', points_awarded: 1, cost_euros: 5, dose_delta_msv: 2.8, is_correct: false },
            { id: 'opt7', option_text: 'G) Filtermaske fürs komplette Gesicht (70€)', points_awarded: 7, cost_euros: 70, dose_delta_msv: 0.5, is_correct: true }
          ]
        }
      ]
    },
    {
      id: 'demo-level-2',
      title: 'Das Strahlenschutz-Labor',
      intro_text: 'Du findest ein verlassenes Labor mit funktionierenden Geräten...',
      topic_tag: 'radioactivity',
      ordering: 2,
      is_active: true,
      taskCount: 1,
      tasks: []
    },
    {
      id: 'demo-level-3',
      title: 'Die Hoffnungszone',
      intro_text: 'Du erreichst einen Bereich, wo die Strahlung schwächer ist...',
      topic_tag: 'radioactivity',
      ordering: 3,
      is_active: true,
      taskCount: 1,
      tasks: []
    }
  ];

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    setLoading(true);
    setTimeout(() => {
      setLevels(demoLevels);
      setLoading(false);
    }, 500);
  };

  const handleCreateLevel = async (levelData: any) => {
    const level = {
      id: `demo-level-${Date.now()}`,
      ...levelData,
      taskCount: levelData.tasks?.length || 0
    };

    setLevels(prev => [...prev, level].sort((a, b) => a.ordering - b.ordering));
    setShowCreateForm(false);
    toast.success('Level erfolgreich erstellt!');
  };

  const handleUpdateLevel = async (levelId: string, levelData: any) => {
    setLevels(prev => prev.map(level => 
      level.id === levelId ? { ...levelData, id: levelId, taskCount: levelData.tasks?.length || 0 } : level
    ));
    setEditingLevel(null);
    toast.success('Level erfolgreich aktualisiert!');
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (window.confirm('Möchtest du dieses Level wirklich löschen?')) {
      setLevels(prev => prev.filter(level => level.id !== levelId));
      toast.success('Level erfolgreich gelöscht!');
    }
  };

  if (editingLevel) {
    return (
      <LevelEditor
        level={editingLevel}
        onSave={(levelData) => handleUpdateLevel(editingLevel.id, levelData)}
        onCancel={() => setEditingLevel(null)}
      />
    );
  }

  if (showCreateForm) {
    return (
      <LevelEditor
        onSave={handleCreateLevel}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Level-Editor</h1>
          <p className="text-gray-600">Erstelle und bearbeite Lernlevel mit Aufgaben und Bewertungskriterien</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Neues Level</span>
        </button>
      </div>

      {/* Levels List */}
      <div className="bg-white rounded-lg shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {levels.map((level) => (
              <div key={level.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-bold text-blue-600">
                        #{level.ordering}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {level.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {level.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Aktiv
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            Inaktiv
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {level.taskCount} Aufgaben
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {level.intro_text?.substring(0, 200)}
                      {level.intro_text && level.intro_text.length > 200 ? '...' : ''}
                    </p>

                    {/* Show task preview */}
                    {level.tasks && level.tasks.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Aufgaben-Vorschau:</h4>
                        {level.tasks.slice(0, 2).map((task: any) => (
                          <div key={task.id} className="text-sm text-gray-600 mb-1">
                            • {task.prompt_text.substring(0, 100)}...
                          </div>
                        ))}
                        {level.tasks.length > 2 && (
                          <div className="text-sm text-gray-500">
                            ... und {level.tasks.length - 2} weitere Aufgaben
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => setEditingLevel(level)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteLevel(level.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {levels.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Noch keine Level vorhanden
                </h3>
                <p className="text-gray-500 mb-4">
                  Erstelle dein erstes Level mit dem Level-Editor.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Erstes Level erstellen
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Student Attempts Tracking Component with AI Feedback (unchanged from previous version)
const AdminAttempts: React.FC = () => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = () => {
    setLoading(true);
    // Load attempts from localStorage (demo data)
    const demoAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
    setAttempts(demoAttempts.reverse()); // Show newest first
    setLoading(false);
  };

  const filteredAttempts = attempts.filter(attempt => {
    // Filter by correctness
    if (filter === 'correct' && !attempt.is_correct) return false;
    if (filter === 'incorrect' && attempt.is_correct) return false;
    
    // Filter by AI quality score
    if (qualityFilter === 'high' && (attempt.ai_quality_score || 0) < 7) return false;
    if (qualityFilter === 'medium' && ((attempt.ai_quality_score || 0) < 4 || (attempt.ai_quality_score || 0) >= 7)) return false;
    if (qualityFilter === 'low' && (attempt.ai_quality_score || 0) >= 4) return false;
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-blue-100 text-blue-800';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 8) return 'Exzellent';
    if (score >= 6) return 'Gut';
    if (score >= 4) return 'Befriedigend';
    return 'Verbesserungsbedarf';
  };

  const exportAttempts = () => {
    const csvContent = [
      ['Zeitstempel', 'Schüler', 'Level', 'Aufgabe', 'Antwort', 'Begründung', 'Korrekt', 'Punkte', 'Dosis', 'KI-Feedback', 'KI-Bewertung', 'KI-Vorschläge'].join(','),
      ...attempts.map(attempt => [
        formatDate(attempt.timestamp),
        attempt.username,
        attempt.level_title,
        `"${attempt.prompt_text.replace(/"/g, '""')}"`,
        `"${attempt.selected_answer.replace(/"/g, '""')}"`,
        `"${attempt.reasoning.replace(/"/g, '""')}"`,
        attempt.is_correct ? 'Ja' : 'Nein',
        attempt.points_got,
        attempt.dose_got_msv,
        `"${attempt.ai_feedback.replace(/"/g, '""')}"`,
        attempt.ai_quality_score || 'N/A',
        `"${(attempt.ai_suggestions || []).join('; ')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `schueler-antworten-ki-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV-Export mit KI-Daten erfolgreich!');
  };

  const averageQualityScore = attempts.length > 0 
    ? attempts.reduce((sum, attempt) => sum + (attempt.ai_quality_score || 0), 0) / attempts.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Schüler-Antworten mit KI-Feedback</h1>
          <p className="text-gray-600">Verfolge die Antworten, Begründungen und KI-Bewertungen der Schüler</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportAttempts}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={loadAttempts}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Aktualisieren</span>
          </button>
        </div>
      </div>

      {/* Enhanced Filter Buttons */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <span className="text-sm font-medium text-gray-700 py-2">Korrektheit:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Alle ({attempts.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'correct' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Richtig ({attempts.filter(a => a.is_correct).length})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'incorrect' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Falsch ({attempts.filter(a => !a.is_correct).length})
          </button>
        </div>

        <div className="flex space-x-2">
          <span className="text-sm font-medium text-gray-700 py-2">KI-Bewertung:</span>
          <button
            onClick={() => setQualityFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              qualityFilter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setQualityFilter('high')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              qualityFilter === 'high' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hoch (7-10)
          </button>
          <button
            onClick={() => setQualityFilter('medium')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              qualityFilter === 'medium' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mittel (4-6)
          </button>
          <button
            onClick={() => setQualityFilter('low')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              qualityFilter === 'low' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Niedrig (1-3)
          </button>
        </div>
      </div>

      {/* Attempts List */}
      <div className="bg-white rounded-lg shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAttempts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAttempts.map((attempt) => (
              <div key={attempt.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        attempt.is_correct ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <h3 className="font-semibold text-gray-800">{attempt.username}</h3>
                      <span className="text-sm text-gray-500">{attempt.level_title}</span>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(attempt.timestamp)}</span>
                      </div>
                      {/* AI Quality Score Badge */}
                      {attempt.ai_quality_score && (
                        <div className="flex items-center space-x-1">
                          <Brain className="h-3 w-3 text-purple-600" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(attempt.ai_quality_score)}`}>
                            {attempt.ai_quality_score}/10 - {getQualityLabel(attempt.ai_quality_score)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-700 font-medium mb-1">Aufgabe:</p>
                      <p className="text-gray-600 text-sm">{attempt.prompt_text}</p>
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-700 font-medium mb-1">Gewählte Antwort:</p>
                      <p className={`text-sm px-3 py-1 rounded-lg inline-block ${
                        attempt.is_correct 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.selected_answer}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-700 font-medium mb-1">Begründung des Schülers:</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-blue-800 text-sm italic">"{attempt.reasoning}"</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <p className="text-gray-700 font-medium">KI-Feedback:</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-purple-800 text-sm">{attempt.ai_feedback}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-700 font-medium mb-1">KI-Verbesserungsvorschläge:</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          {attempt.ai_suggestions && attempt.ai_suggestions.length > 0 ? (
                            <ul className="space-y-1">
                              {attempt.ai_suggestions.map((suggestion: string, index: number) => (
                                <li key={index} className="text-yellow-800 text-xs flex items-start space-x-1">
                                  <span className="text-yellow-600 mt-1">•</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-yellow-700 text-xs">Keine Vorschläge verfügbar</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">+{attempt.points_got}</div>
                        <div className="text-xs text-gray-500">Punkte</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${
                          attempt.dose_got_msv > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {attempt.dose_got_msv > 0 ? '+' : ''}{attempt.dose_got_msv}
                        </div>
                        <div className="text-xs text-gray-500">mSv</div>
                      </div>
                    </div>
                    
                    {attempt.is_correct ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mx-auto" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Keine Antworten gefunden
            </h3>
            <p className="text-gray-500">
              Ändere die Filter oder warte auf weitere Schüler-Aktivitäten.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Statistics with AI Metrics */}
      {attempts.length > 0 && (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{attempts.length}</p>
                <p className="text-sm text-gray-600">Gesamte Antworten</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {attempts.filter(a => a.is_correct).length}
                </p>
                <p className="text-sm text-gray-600">Richtige Antworten</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {attempts.filter(a => !a.is_correct).length}
                </p>
                <p className="text-sm text-gray-600">Falsche Antworten</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {averageQualityScore.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Ø KI-Bewertung</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {attempts.length > 0 ? Math.round((attempts.filter(a => a.is_correct).length / attempts.length) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Erfolgsquote</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    // Load recent attempts for dashboard
    const demoAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
    setAttempts(demoAttempts.slice(-5).reverse()); // Show last 5 attempts
  }, []);

  const stats = {
    totalUsers: 3,
    activeUsers: 2,
    totalLevels: 3,
    totalTasks: 6,
    totalAttempts: JSON.parse(localStorage.getItem('demo_attempts') || '[]').length,
    averageAIScore: attempts.length > 0 
      ? attempts.reduce((sum, attempt) => sum + (attempt.ai_quality_score || 0), 0) / attempts.length 
      : 0
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Willkommen, {user?.username}! Übersicht über das KI-gestützte Lernspiel-System</p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid md:grid-cols-6 gap-6">
        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Nutzer</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.activeUsers}</p>
              <p className="text-sm text-gray-600">Aktive Nutzer</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.totalLevels}</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.totalTasks}</p>
              <p className="text-sm text-gray-600">Aufgaben</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-red-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalAttempts}</p>
              <p className="text-sm text-gray-600">Antworten</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-indigo-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.averageAIScore.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Ø KI-Score</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity with AI Feedback */}
      {attempts.length > 0 && (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Letzte Schüler-Antworten mit KI-Feedback</h2>
            <Link
              to="/admin/attempts"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Alle anzeigen →
            </Link>
          </div>
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    attempt.is_correct ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-800">{attempt.username}</p>
                    <p className="text-sm text-gray-600">{attempt.level_title}</p>
                  </div>
                  {attempt.ai_quality_score && (
                    <div className="flex items-center space-x-1">
                      <Brain className="h-3 w-3 text-purple-600" />
                      <span className="text-xs text-purple-600 font-medium">
                        KI: {attempt.ai_quality_score}/10
                      </span>
                    </div>
                  )}
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

      {/* Enhanced Quick Actions */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">Schnellaktionen</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/admin/levels"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-800">Level-Editor</h3>
              <p className="text-sm text-gray-600">Erstelle und bearbeite Lernlevel</p>
            </div>
          </Link>

          <Link
            to="/admin/attempts"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-800">KI-Feedback Dashboard</h3>
              <p className="text-sm text-gray-600">Analysiere Begründungen und KI-Bewertungen</p>
            </div>
          </Link>

          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg opacity-50">
            <Users className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-600">Benutzer verwalten</h3>
              <p className="text-sm text-gray-500">Verfügbar nach Supabase-Setup</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Main Admin Page Component
export const AdminPage: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3, current: location.pathname === '/admin' },
    { name: 'Level-Editor', href: '/admin/levels', icon: BookOpen, current: location.pathname === '/admin/levels' },
    { name: 'KI-Feedback', href: '/admin/attempts', icon: Brain, current: location.pathname === '/admin/attempts' },
    { name: 'Benutzer', href: '/admin/users', icon: Users, current: location.pathname === '/admin/users', disabled: true },
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
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.disabled && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Bald
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/levels" element={<AdminLevels />} />
            <Route path="/attempts" element={<AdminAttempts />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};