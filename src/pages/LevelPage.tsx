import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useGame} from '../contexts/GameContext';
import {useAuth} from '../contexts/AuthContext';
import {AlertTriangle, ArrowLeft, Brain, CheckCircle, Lightbulb, Send, XCircle} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import toast from 'react-hot-toast';
import {supabase} from "../supabase/supabase.ts";

type AIFeedback = {
    feedback: string;
    score: number;
    suggestions: string[];
}

type TaskFeedback = {
    isCorrect: boolean;
    pointsAwarded: number;
    doseReceived: number;
    feedback: string,
    aiFeedback: AIFeedback,
    reasoning: string;
}

export const LevelPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user, updateUser} = useAuth();
    const {
        loadLevel,
        loadTasks,
        loadOptions,
        currentLevel,
        tasks,
        options,
        submitAnswer,
        startLevel,
        completeLevel
    } = useGame();

    const [loading, setLoading] = useState(true);
    const [showIntro, setShowIntro] = useState(true);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [reasoning, setReasoning] = useState<{ [key: string]: string }>({});
    const [feedback, setFeedback] = useState<TaskFeedback | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [evaluatingReasoning, setEvaluatingReasoning] = useState(false);

    useEffect(() => {
        if (id) {
            loadLevelData(id);
        }
    }, [id]);

    const loadLevelData = async (levelId: string) => {
        try {
            setLoading(true);
            await loadLevel(levelId);
            await loadTasks(levelId);
            await startLevel(levelId);
        } catch (error) {
            toast.error('Error while loading level...');
            console.error(error);
            navigate('/game');
        } finally {
            setLoading(false);
        }
    };

    const handleStartLevel = () => {
        setShowIntro(false);
        // Load options for the first task
        if (tasks.length > 0) {
            loadOptions(tasks[0].id);
        }
    };

    // Enhanced AI evaluation with comprehensive fallback system
    const evaluateReasoningWithAI = async (
        taskPrompt: string,
        selectedAnswer: string,
        studentReasoning: string,
        isCorrect: boolean
    ): Promise<AIFeedback> => {

        try {
            const feedback = await generateAIFeedback(studentReasoning, isCorrect, taskPrompt, selectedAnswer)
            if (!feedback) throw 'Error while getting ai feedback';
            console.log(feedback);
            return feedback;
        } catch (error) {
            console.warn('Fallback to basic analysis:', error);
            return generateLocalDemoFeedback(studentReasoning, isCorrect, taskPrompt);
        } finally {
            setEvaluatingReasoning(false);
        }
    };

    const generateAIFeedback = async (
        reasoning: string,
        isCorrect: boolean,
        taskPrompt: string,
        selectedAnswer: string
    ): Promise<AIFeedback | null> => {

        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-r1:32b",
                prompt: "Du bist ein hilfreicher Tutor für Quizfragen.\n" +
                    "\n" +
                    "Hier sind die Daten zu einer Frage:\n" +
                    "- Frage: " + taskPrompt + "\n" +
                    "- Antwort des Nutzers: " + selectedAnswer + "\n" +
                    "- Begründung des Nutzers: " + reasoning + "\n" +
                    "\n" +
                    "Deine Aufgaben:\n" +
                    "1. Bewerte die Antwort und erkläre in einfacher Sprache, ob und warum sie richtig oder falsch ist. \n" +
                    "2. Gib konstruktives Feedback zur Begründung des Nutzers (was war gut, was könnte verbessert werden).\n" +
                    "3. Gib eine Bewertung von 0 bis 10 Punkten, wobei 10 Punkte die perfekte Antwort sind.\n" +
                    "4. Antworte bitte ausschließlich auf Deutsch, klar strukturiert und in kurzen Absätzen.\n" +
                    "5. Achte auf fachliche Korrektheit. Eine Antwort, die falsch ist, sollte auch so dargestellt sein.\n" +
                    "\n" +
                    "Gib dein Feedback im folgenden JSON-Format zurück:\n" +
                    "{\n" +
                    "  \"evaluation\": [0-10],\n" +
                    "  \"feedback\": \"detailliertes Feedback in Deutsch\",\n" +
                    "  \"suggestions\": [\"Verbesserung 1\", \"Verbesserung 2]\", ...\n" +
                    "}\n",
                type: "json",
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! ${response.status}`);
        }

        const data = await response.json();
        const cleaned = data.response.replace(/<think>[\s\S]*?<\/think>/, "").trim();
        const jsonMatch = cleaned.match(/```json([\s\S]*?)```/);
        const jsonString = jsonMatch ? jsonMatch[1] : cleaned;

        console.log(jsonString);

        try {
            const parsed = JSON.parse(jsonString);
            return {
                feedback: parsed.feedback,
                score: parsed.score,
                suggestions: parsed.verbesserungen
            }
        } catch (err) {
            console.error("Failed to parse JSON:", err, { cleaned });
            return null;
        }
    }

    // Demo analysis based on length and keywords
    // Not AI. TODO: maybe add notice that no AI was used and this feedback is easily deceived.
    const generateLocalDemoFeedback = (
        reasoning: string,
        isCorrect: boolean,
        taskPrompt: string,
    ): AIFeedback => {
        const reasoningLength = reasoning.trim().length;
        const words = reasoning.trim().split(/\s+/).length;
        const sentences = reasoning.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

        // Advanced keyword analysis
        const scientificTerms = {
            basic: ['radioaktiv', 'strahlung', 'zerfall', 'atom', 'kern'],
            intermediate: ['isotop', 'halbwertszeit', 'alpha', 'beta', 'gamma', 'dosimeter', 'millisievert', 'msv'],
            advanced: ['ionisierend', 'abschirmung', 'absorption', 'streuung', 'aktivität', 'becquerel', 'gray', 'sievert'],
            protection: ['schutz', 'abstand', 'zeit', 'abschirmung', 'dosis', 'grenzwert', 'sicherheit'],
            physics: ['energie', 'teilchen', 'elektron', 'neutron', 'proton', 'photon', 'wellenlänge', 'frequenz']
        };

        let termScore = 0;
        let usedCategories = 0;

        Object.entries(scientificTerms).forEach(([category, terms]) => {
            const categoryTerms = terms.filter(term =>
                reasoning.toLowerCase().includes(term)
            );
            if (categoryTerms.length > 0) {
                usedCategories++;
                termScore += categoryTerms.length * (category === 'advanced' ? 3 : category === 'intermediate' ? 2 : 1);
            }
        });

        // Linguistic analysis
        const hasExplanation = /\b(weil|da|deshalb|daher|denn|aufgrund|durch|wegen)\b/i.test(reasoning);
        const hasComparison = /\b(besser|schlechter|mehr|weniger|höher|niedriger|größer|kleiner)\b/i.test(reasoning);
        const hasConclusion = /\b(darum|folglich|somit|also|deshalb|deswegen)\b/i.test(reasoning);
        const hasQuantification = /\b(\d+\s*(msv|sv|gy|bq|prozent|%|grad|meter|sekunden?))\b/i.test(reasoning);
        const hasNegation = /\b(nicht|kein|ohne|niemals|nie)\b/i.test(reasoning);

        // Context analysis based on task content
        const isShoppingTask = taskPrompt.toLowerCase().includes('klamottenladen') || taskPrompt.toLowerCase().includes('kaufen');
        const isDosimetryTask = taskPrompt.toLowerCase().includes('dosimeter') || taskPrompt.toLowerCase().includes('dosis');
        const isMedicalTask = taskPrompt.toLowerCase().includes('medizin') || taskPrompt.toLowerCase().includes('krankenhaus');

        // Calculate sophisticated quality score
        let qualityScore = 3; // Base score

        // Length and structure bonus
        if (reasoningLength >= 100) qualityScore += 2;
        else if (reasoningLength >= 50) qualityScore += 1;

        if (sentences >= 3) qualityScore += 1;
        if (words >= 20) qualityScore += 1;

        // Scientific terminology bonus
        qualityScore += Math.min(3, Math.floor(termScore / 2));
        if (usedCategories >= 3) qualityScore += 1;

        // Linguistic sophistication bonus
        if (hasExplanation) qualityScore += 1;
        if (hasComparison) qualityScore += 1;
        if (hasConclusion) qualityScore += 1;
        if (hasQuantification) qualityScore += 1;

        // Context appropriateness bonus
        if (isShoppingTask && reasoning.toLowerCase().includes('schutz')) qualityScore += 1;
        if (isDosimetryTask && reasoning.toLowerCase().includes('msv')) qualityScore += 1;
        if (isMedicalTask && reasoning.toLowerCase().includes('therapie')) qualityScore += 1;

        // Correctness bonus/penalty
        if (isCorrect) qualityScore += 2;
        else qualityScore -= 1;

        // Ensure score is within bounds
        qualityScore = Math.min(10, Math.max(1, qualityScore));

        // Generate contextual feedback
        let feedback = '';
        let suggestions: string[] = [];

        if (qualityScore <= 3) {
            feedback = generateLowQualityFeedback(reasoning, isCorrect, termScore, hasExplanation);
            suggestions = [
                "Schreibe mindestens 3-4 vollständige Sätze",
                "Verwende Fachbegriffe wie 'Radioaktivität', 'Strahlung', 'Dosis'",
                "Erkläre die physikalischen Zusammenhänge",
                "Begründe deine Entscheidung Schritt für Schritt"
            ];
        } else if (qualityScore <= 6) {
            feedback = generateMediumQualityFeedback(reasoning, isCorrect, termScore, hasExplanation, usedCategories);
            suggestions = [
                termScore < 3 ? "Verwende mehr physikalische Fachbegriffe" : "Gute Verwendung von Fachbegriffen!",
                !hasExplanation ? "Erkläre deine Überlegungen mit 'weil', 'da', 'deshalb'" : "Gute Erklärungsstruktur!",
                isCorrect ? "Vertiefe dein Wissen mit weiteren Details" : "Überprüfe die physikalischen Grundlagen",
                !hasQuantification ? "Verwende konkrete Zahlen und Einheiten (mSv, etc.)" : "Gut, dass du Zahlen verwendest!"
            ];
        } else {
            feedback = generateHighQualityFeedback(reasoning, isCorrect, termScore, usedCategories, hasExplanation, hasComparison);
            suggestions = [
                isCorrect ? "Exzellente Argumentation! Weiter so!" : "Sehr gute Begründung, aber überprüfe das Ergebnis",
                qualityScore >= 9 ? "Du argumentierst auf Expertenniveau!" : "Du könntest noch mehr Details erklären",
                usedCategories >= 3 ? "Hervorragende Fachsprachenkompetenz!" : "Versuche noch vielfältigere Fachbegriffe zu verwenden"
            ];
        }

        return {
            feedback: feedback,
            score: qualityScore,
            suggestions: suggestions.slice(0, 3)
        };
    };

    const generateLowQualityFeedback = (reasoning: string, _isCorrect: boolean, termScore: number, hasExplanation: boolean) => {
        if (reasoning.length < 20) {
            return "Deine Begründung ist viel zu kurz! Ein Wissenschaftler muss seine Gedanken ausführlich erklären. Schreibe mindestens 3-4 Sätze und erkläre, warum du diese Antwort gewählt hast.";
        }

        if (termScore === 0) {
            return "Du verwendest keine Fachbegriffe! In der Physik ist präzise Sprache wichtig. Verwende Begriffe wie 'Radioaktivität', 'Strahlung', 'Dosis', 'Zerfall' oder 'Schutz'.";
        }

        if (!hasExplanation) {
            return "Du beschreibst nur, was du machst, aber nicht WARUM. Verwende Wörter wie 'weil', 'da', 'deshalb' um deine Überlegungen zu erklären.";
        }

        return "Deine Begründung ist noch sehr oberflächlich. Erkläre die physikalischen Zusammenhänge genauer und verwende mehr Fachbegriffe.";
    };

    const generateMediumQualityFeedback = (_reasoning: string, isCorrect: boolean, termScore: number, hasExplanation: boolean, usedCategories: number) => {
        let feedback = '';

        if (isCorrect) {
            feedback = "Gute Antwort! Du zeigst solides Grundverständnis. ";
            if (termScore >= 3) feedback += "Deine Verwendung von Fachbegriffen ist angemessen. ";
            if (hasExplanation) feedback += "Deine Erklärung ist nachvollziehbar. ";
            feedback += "Mit etwas mehr Detail könntest du noch überzeugender argumentieren.";
        } else {
            feedback = "Deine Begründung ist gut strukturiert, aber die Antwort ist nicht korrekt. ";
            if (termScore >= 2) feedback += "Du kennst die Fachbegriffe, ";
            feedback += "aber überdenke die physikalischen Grundlagen noch einmal. ";
            if (hasExplanation) feedback += "Deine Denkweise ist nachvollziehbar, führt aber zum falschen Ergebnis.";
        }

        if (usedCategories >= 2) {
            feedback += " Du zeigst bereits gute Fachkompetenz!";
        }

        return feedback;
    };

    const generateHighQualityFeedback = (_reasoning: string, isCorrect: boolean, termScore: number, usedCategories: number, hasExplanation: boolean, hasComparison: boolean) => {
        let feedback = '';

        if (isCorrect) {
            feedback = "Ausgezeichnete Begründung! Du argumentierst wie ein echter Wissenschaftler. ";
            if (termScore >= 5) feedback += "Deine Fachsprachenkompetenz ist beeindruckend. ";
            if (hasExplanation) feedback += "Deine logische Argumentation ist vorbildlich. ";
            if (hasComparison) feedback += "Du kannst verschiedene Optionen hervorragend gegeneinander abwägen. ";
            if (usedCategories >= 3) feedback += "Du beherrschst verschiedene Fachbereiche der Physik. ";
            feedback += "So macht wissenschaftliches Arbeiten richtig Spaß!";
        } else {
            feedback = "Deine Begründung ist von sehr hoher Qualität und zeigt tiefes wissenschaftliches Verständnis. ";
            if (termScore >= 4) feedback += "Du beherrschst die Fachsprache exzellent. ";
            feedback += "Leider ist die gewählte Antwort nicht korrekt. ";
            if (hasExplanation) feedback += "Deine Argumentation ist logisch aufgebaut, aber überprüfe die physikalischen Grundlagen noch einmal. ";
            feedback += "Mit deinen analytischen Fähigkeiten wirst du den Fehler sicher finden!";
        }

        return feedback;
    };

    const handleAnswerSubmit = async () => {
        if (!tasks || !tasks[currentTaskIndex]) return;

        const task = tasks[currentTaskIndex];
        const answer = answers[task.id];
        const userReasoning = reasoning[task.id];


        if (!currentLevel) {
            toast.error('Kein Level geladen');
            return;
        }

        if (!user) {
            toast.error('Kein Nutzer angemeldet');
            return;
        }

        if (!answer) {
            toast.error('Bitte wähle eine Antwort aus');
            return;
        }

        if (!userReasoning || userReasoning.trim().length < 10) {
            toast.error('Bitte begründe deine Antwort ausführlich (mindestens 10 Zeichen)');
            return;
        }

        try {
            setSubmitting(true);

            // TODO: Make isCorrect optional for free text answers.
            //  In that case let the AI decide if the answer is correct.
            //  Also reward points based on qualityScore.
            const selectedOption = options.find(opt => opt.id === answer);
            const isCorrect = selectedOption?.is_correct || false;
            const pointsAwarded = selectedOption?.points_awarded || 0;
            const doseReceived = selectedOption?.dose_delta_msv || 0;

            // Get AI feedback for the reasoning
            const aiEvaluation = await evaluateReasoningWithAI(
                task.prompt_text,
                selectedOption?.option_text || answer,
                userReasoning,
                isCorrect
            );

            // Update demo user stats
            if (user && updateUser) {
                updateUser({
                    knowledge_points: user.knowledge_points + pointsAwarded,
                    dose_msv: user.dose_msv + doseReceived
                });
            }

            const {error} = await supabase
                .from("attempts")
                .insert({
                    user_id: user.id,
                    level_id: currentLevel.id,
                    task_id: task.id,
                    option_id: selectedOption?.id || null,

                    answer: selectedOption?.option_text || answer,
                    reasoning: userReasoning,

                    is_correct: isCorrect,
                    points_got: pointsAwarded,
                    dose_msv_got: doseReceived,

                    ai_feedback: aiEvaluation.feedback,
                    ai_suggestions: aiEvaluation.suggestions,
                    ai_score: aiEvaluation.score,

                    timestamp: new Date().toISOString()
                });

            if (error) {
                console.error("Couldn't upload attempt data to Database", error);
            }

            setFeedback({
                isCorrect,
                pointsAwarded,
                doseReceived,
                feedback: isCorrect
                    ? 'Richtig! Du hast die korrekte Antwort gewählt.'
                    : 'Das ist nicht ganz richtig. Versuche es beim nächsten Mal besser!',
                aiFeedback: aiEvaluation,
                reasoning: userReasoning
            });

        } catch (error) {
            toast.error('Fehler beim Übermitteln der Antwort');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNextTask = () => {
        setFeedback(null);
        if (currentTaskIndex < tasks.length - 1) {
            const nextIndex = currentTaskIndex + 1;
            setCurrentTaskIndex(nextIndex);
            loadOptions(tasks[nextIndex].id);
        } else {
            handleCompleteLevel();
        }
    };

    const handleCompleteLevel = async () => {
        try {
            if (id) {
                await completeLevel(id);
            }
            toast.success('Level abgeschlossen!');
            navigate('/game');
        } catch (error) {
            toast.error('Fehler beim Abschließen des Levels');
            console.error(error);
        }
    };

    const handleAnswerChange = (taskId: string, answer: any) => {
        setAnswers(prev => ({...prev, [taskId]: answer}));
    };

    const handleReasoningChange = (taskId: string, reasoningText: string) => {
        setReasoning(prev => ({...prev, [taskId]: reasoningText}));
    };

    const getQualityColor = (score: number) => {
        if (score >= 8) return 'text-green-600 bg-green-100 border-green-300';
        if (score >= 6) return 'text-blue-600 bg-blue-100 border-blue-300';
        if (score >= 4) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
        return 'text-red-600 bg-red-100 border-red-300';
    };

    const getQualityText = (score: number) => {
        if (score >= 9) return 'Exzellent';
        if (score >= 8) return 'Sehr gut';
        if (score >= 6) return 'Gut';
        if (score >= 4) return 'Befriedigend';
        return 'Verbesserungsbedarf';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!currentLevel) {
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
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
            >
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <button
                            onClick={() => navigate('/game')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5"/>
                            <span>Zurück</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h1 className="text-3xl font-bold text-gray-800">{currentLevel.title}</h1>
                    </div>

                    <div className="prose max-w-none mb-8">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {currentLevel.intro_text}
                        </div>
                    </div>

                    {/* Important Notice about AI Feedback */}
                    <div
                        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <div className="flex items-start space-x-3">
                            <Brain className="h-6 w-6 text-blue-600 mt-1"/>
                            <div>
                                <h3 className="font-semibold text-blue-800 mb-2">🤖 Intelligentes Feedback-System</h3>
                                <p className="text-blue-700 mb-3">
                                    Bei jeder Aufgabe musst du deine Antwort <strong>begründen</strong>.
                                    Unser fortschrittliches KI-System analysiert deine Begründung und gibt dir
                                    sofortiges, personalisiertes Feedback!
                                </p>
                                <div className="bg-white/50 rounded-lg p-3">
                                    <p className="text-sm text-blue-600">
                                        <strong>Das System bewertet:</strong> Fachliche Korrektheit • Verwendung von
                                        Fachbegriffen •
                                        Logische Struktur • Tiefe des Verständnisses • Wissenschaftliche Argumentation
                                    </p>
                                </div>
                                <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-700">
                                    💡 <strong>Tipp:</strong> Verwende Fachbegriffe wie "Radioaktivität", "Strahlung",
                                    "Dosis" und erkläre deine Überlegungen ausführlich!
                                </div>
                            </div>
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

    if (tasks.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Keine Aufgaben verfügbar</h2>
                    <p className="text-gray-600 mb-6">
                        Für dieses Level sind noch keine Aufgaben konfiguriert.
                    </p>
                    <button
                        onClick={() => navigate('/game')}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Zurück zum Spiel
                    </button>
                </div>
            </div>
        );
    }

    const currentTask = tasks[currentTaskIndex];
    const isLastTask = currentTaskIndex === tasks.length - 1;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/game')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5"/>
                        <span>Zurück</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <h1 className="text-2xl font-bold text-gray-800">{currentLevel.title}</h1>
                </div>

                <div className="text-sm text-gray-600">
                    Aufgabe {currentTaskIndex + 1} von {tasks.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{width: `${((currentTaskIndex + 1) / tasks.length) * 100}%`}}
                ></div>
            </div>

            <AnimatePresence mode="wait">
                {!feedback ? (
                    <motion.div
                        key={`task-${currentTaskIndex}`}
                        className="bg-white rounded-lg shadow-lg p-8"
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: -20}}
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">
                            {currentTask.prompt_text}
                        </h2>

                        {/* Answer Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Deine Antwort:</h3>

                            {currentTask.type === 'mc' ? (
                                <div className="space-y-4">
                                    {options.map((option) => (
                                        <label
                                            key={option.id}
                                            className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name={`task-${currentTask.id}`}
                                                value={option.id}
                                                checked={answers[currentTask.id] === option.id}
                                                onChange={(e) => handleAnswerChange(currentTask.id, e.target.value)}
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
                                </div>
                            )}
                        </div>

                        {/* Reasoning Section */}
                        <div className="mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <Brain className="h-5 w-5 text-purple-600"/>
                                <h3 className="text-lg font-medium text-gray-800">Wissenschaftliche Begründung
                                    (Pflichtfeld):</h3>
                            </div>

                            <div
                                className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-purple-700">
                                    <strong>🤖 KI-Analyse:</strong> Erkläre deine Antwort wissenschaftlich fundiert.
                                    Das System bewertet deine Begründung auf fachliche Korrektheit, Verwendung von
                                    Fachbegriffen
                                    und logische Struktur. Je besser deine Begründung, desto hilfreicher das Feedback!
                                </p>
                                <div className="mt-2 text-xs text-purple-600">
                                    💡 <strong>Verwende Fachbegriffe wie:</strong> Radioaktivität, Strahlung, Dosis,
                                    Zerfall, Isotop, Schutz, Abschirmung
                                </div>
                            </div>

                            <textarea
                                value={reasoning[currentTask.id] || ''}
                                onChange={(e) => handleReasoningChange(currentTask.id, e.target.value)}
                                placeholder="Begründe hier deine Antwort wissenschaftlich...

Beispiel: 'Ich wähle den Strahlenschutzanzug, weil er speziell entwickelt wurde, um vor radioaktiver Strahlung zu schützen. Radioaktive Strahlung kann Zellen schädigen und die Dosis in mSv erhöhen. Ein normales T-Shirt bietet keinen Schutz vor Alpha-, Beta- oder Gammastrahlung...'"
                                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                required
                            />

                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-gray-500">
                                    Zeichen: {(reasoning[currentTask.id] || '').length} / mindestens 10
                                </p>
                                <p className="text-sm text-purple-600">
                                    🧠 Intelligente KI-Bewertung deiner Argumentation!
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleAnswerSubmit}
                                disabled={
                                    !answers[currentTask.id] ||
                                    !reasoning[currentTask.id] ||
                                    reasoning[currentTask.id].trim().length < 10 ||
                                    submitting ||
                                    evaluatingReasoning
                                }
                                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {evaluatingReasoning ? (
                                    <>
                                        <Brain className="h-4 w-4 animate-pulse"/>
                                        <span>KI analysiert deine Begründung...</span>
                                    </>
                                ) : submitting ? (
                                    <>
                                        <Send className="h-4 w-4"/>
                                        <span>Wird übermittelt...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4"/>
                                        <span>Antwort mit KI-Analyse abgeben</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={`feedback-${currentTaskIndex}`}
                        className="bg-white rounded-lg shadow-lg p-8"
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                    >
                        <div className="space-y-8">
                            {/* Answer Feedback */}
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                    feedback.isCorrect ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {feedback.isCorrect ? (
                                        <CheckCircle className="h-8 w-8 text-green-600"/>
                                    ) : (
                                        <XCircle className="h-8 w-8 text-red-600"/>
                                    )}
                                </div>

                                <h3 className={`text-2xl font-bold mb-2 ${
                                    feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {feedback.isCorrect ? 'Richtig!' : 'Nicht ganz richtig'}
                                </h3>
                                <p className="text-gray-700 text-lg">{feedback.feedback}</p>
                            </div>

                            {/* Points and Dose */}
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

                            {/* AI Feedback on Reasoning */}
                            <div
                                className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                                <div className="flex items-start space-x-3 mb-4">
                                    <Brain className="h-6 w-6 text-purple-600 mt-1"/>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="font-semibold text-purple-800">🤖 KI-Bewertung deiner
                                                Begründung:</h4>
                                            {feedback.aiFeedback.feedback && (
                                                <div
                                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getQualityColor(feedback.aiFeedback.score)}`}>
                                                    {feedback.aiFeedback.score}/10 • {getQualityText(feedback.aiFeedback.score)}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-purple-700 leading-relaxed">{feedback.aiFeedback.feedback}</p>
                                    </div>
                                </div>

                                {/* AI Suggestions */}
                                {feedback.aiFeedback.suggestions && feedback.aiFeedback.suggestions.length > 0 && (
                                    <div className="mt-4 p-4 bg-white/50 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-600"/>
                                            <h5 className="font-medium text-purple-800">Verbesserungsvorschläge:</h5>
                                        </div>
                                        <ul className="space-y-1">
                                            {feedback.aiFeedback.suggestions.map((suggestion: string, index: number) => (
                                                <li key={index}
                                                    className="text-sm text-purple-600 flex items-start space-x-2">
                                                    <span className="text-yellow-500 mt-1">•</span>
                                                    <span>{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Show User's Reasoning */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <h4 className="font-semibold text-gray-800 mb-2">Deine Begründung:</h4>
                                <p className="text-gray-700 leading-relaxed italic">"{feedback.reasoning}"</p>
                            </div>

                            {/* Dose Warning */}
                            {feedback.doseReceived > 0 && (
                                <div
                                    className="flex items-center justify-center space-x-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                    <AlertTriangle className="h-5 w-5"/>
                                    <span className="text-sm">
                    Vorsicht! Deine Strahlenbelastung ist gestiegen.
                  </span>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    onClick={handleNextTask}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {isLastTask ? 'Level abschließen' : 'Nächste Aufgabe'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};