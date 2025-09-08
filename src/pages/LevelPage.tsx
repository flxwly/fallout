import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useGame} from '../contexts/GameContext';
import {useAuth} from '../contexts/AuthContext';
import {AlertTriangle, ArrowLeft, Brain, CheckCircle, Lightbulb, Send, XCircle} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import {Mistral} from '@mistralai/mistralai';
import toast from 'react-hot-toast';
import {supabase} from "../supabase/supabase.ts";

type AIFeedback = {
    score: number;
    summary: string;
    good: string[];
    bad: string[];
}

type MultipleChoiceAnswer = {
    taskPrompt: string,
    possibleOptions: string[],
    bestOption: string,
    selectedAnswer: string,
    reasoning: string,
    exampleReasoning: string
}

type FreeTextAnswer = {
    taskPrompt: string,
    exampleAnswer: string,
    answer: string,
}

type TaskFeedback = {
    correctness: number;
    pointsAwarded: number;
    doseReceived: number;
    feedback: string,
    aiFeedback: AIFeedback | null,
    reasoning: string;
}

export const LevelPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user, updateProfile, updateStats} = useAuth();
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
            void loadLevelData(id);
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
        levelText: string,
        freeTextAnswer: FreeTextAnswer | undefined,
        multipleChoiceAnswer: MultipleChoiceAnswer | undefined,
        evaluationCriteria: string
    ): Promise<AIFeedback | null> => {

        let feedback: AIFeedback | null = null
        try {
            feedback = await generateAIFeedback(levelText, freeTextAnswer, multipleChoiceAnswer, evaluationCriteria);
        } catch (error) {
            console.warn("Couldn't get AI feedback.", error);
        }
        setEvaluatingReasoning(false);
        return feedback
    };

    const generateAIPromptForMC = (
        taskPrompt: string,
        possibleAnswers: string[],
        selectedAnswer: string,
        bestAnswer: string,
        reasoning: string,
        exampleReasoning: string,
        aiEvaluationCriteria: string
    ): string => {
        return "### KONTEXT ###\n" +
            "Frage: " + taskPrompt + "\n" +
            "Antwortmöglichkeiten:\n" + possibleAnswers.join("\n") + "\n" +
            "Beste Antwort: " + bestAnswer + "\n" +
            "Beispielbegründung: " + exampleReasoning + "\n" +
            "\n" +
            "### ABGABE DES SCHÜLERS ###\n" +
            "Antwort des Schülers: " + selectedAnswer + "\n" +
            "Begründung des Schülers: " + reasoning + "\n" +
            "\n" +
            "### BEWERTUNGSKRITERIEN ###\n" +
            aiEvaluationCriteria +
            "\n" +
            "### DEINE AUFGABE ###\n" +
            "1.  Analysiere die Abgabe des Schülers under den Bewertungskriterien\n" +
            "2.  Zeige richtige Konzepte auf, die der Schüler benannt oder auf die er hingewiesen hat.\n" +
            "3.  Korrigiere Missverständnisse und weise dabei auf die relevanten Konzepte hin.\n" +
            "4.  Das Feedback soll konstruktiv sein, ermutigen weiter zu lernen und direkt an den Schüler gerichtet sein. Sprich ihn mit \"du\" an.\n" +
            "5.  Gebe außerdem einen Score von 0 bis 10, wobei eine perfekte Antwort 10 Punkte erhält und eine komplett falsche Antwort 0 Punkte.\n" +
            "\n" +
            "### RÜCKGABEN FORMAT ###\n" +
            "Gib deine Antwort in einem JSON Objekt nach folgender Form und ausschließlich auf Deutsch zurück:\n" +
            "{\n" +
            "  \"score\": integer,\n" +
            "  \"summary\": \"string\",\n" +
            "  \"gutes\": [\n" +
            "    \"string 1\", ...\n" +
            "  ],\n" +
            "  \"verbesserungsbedarf\": [\n" +
            "    \"string 1\", ...\n" +
            "  ]\n" +
            "}"
    }

    const generateAIPromptForFreeText = (
        taskPrompt: string,
        givenAnswer: string,
        exampleAnswer: string,
        aiEvaluationCriteria: string
    ): string => {
        return "### KONTEXT ###\n" +
            "Frage: " + taskPrompt + "\n" +
            "Beispiel Antwort: " + exampleAnswer + "\n" +
            "\n" +
            "### ABGABE DES SCHÜLERS ###\n" +
            "Antwort des Schülers: " + givenAnswer + "\n" +
            "\n" +
            "### BEWERTUNGSKRITERIEN ###\n" +
            aiEvaluationCriteria +
            "\n" +
            "### DEINE AUFGABE ###\n" +
            "1.  Analysiere die Abgabe des Schülers under den Bewertungskriterien.\n" +
            "2.  Zeige richtige Konzepte auf, die der Schüler benannt oder auf die er hingewiesen hat.\n" +
            "3.  Korrigiere Missverständnisse und weise dabei auf die relevanten Konzepte hin.\n" +
            "4.  Das Feedback soll konstruktiv sein, ermutigen weiter zu lernen und direkt an den Schüler gerichtet sein. Sprich ihn mit \"du\" an.\n" +
            "5.  Gebe außerdem einen Score von 0 bis 10, wobei eine perfekte Antwort 10 Punkte erhält und eine komplett falsche Antwort 0 Punkte.\n" +
            "\n" +
            "### RÜCKGABEN FORMAT ###\n" +
            "Gib deine Antwort in einem JSON Objekt nach folgender Form und ausschließlich auf Deutsch zurück:\n" +
            "{\n" +
            "  \"score\": integer,\n" +
            "  \"summary\": \"string\",\n" +
            "  \"gutes\": [\n" +
            "    \"string 1\", ...\n" +
            "  ],\n" +
            "  \"verbesserungsbedarf\": [\n" +
            "    \"string 1\", ...\n" +
            "  ]\n" +
            "}"
    }

    const generateAIFeedback = async (
        levelText: string,
        freeTextAnswer: FreeTextAnswer | undefined,
        multipleChoiceAnswer: MultipleChoiceAnswer | undefined,
        evaluationCriteria: string
    ): Promise<AIFeedback | null> => {

        const aiPrompt = freeTextAnswer ? generateAIPromptForFreeText(
            freeTextAnswer.taskPrompt,
            freeTextAnswer.answer,
            freeTextAnswer.exampleAnswer,
            evaluationCriteria
        ) : multipleChoiceAnswer ? generateAIPromptForMC(
            multipleChoiceAnswer.taskPrompt,
            multipleChoiceAnswer.possibleOptions,
            multipleChoiceAnswer.selectedAnswer,
            multipleChoiceAnswer.bestOption,
            multipleChoiceAnswer.reasoning,
            multipleChoiceAnswer.exampleReasoning,
            evaluationCriteria
        ) : undefined
        if (!aiPrompt) throw "Exactly one answer must be provided"

        const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
        const mistralClient = new Mistral({apiKey: apiKey});

        const response = await mistralClient.chat.complete({
            model: 'mistral-small-latest',
            messages: [{role: 'user', content: levelText + "\n" + aiPrompt}],
        })

        if (response.choices.length === 0) {
            console.error("No AI response received");
            return {
                score: 0,
                summary: "Es konnte kein KI Feedback generiert werden.",
                good: [],
                bad: []
            };
        }

        const data = response.choices[0];
        const cleaned = data.message.content ? data.message.content.toString().replace(/<think>[\s\S]*?<\/think>/, "").trim() : "";
        const jsonMatch = cleaned.match(/```json([\s\S]*?)```/);
        const jsonString = jsonMatch ? jsonMatch[1] : cleaned;

        try {
            const parsed = JSON.parse(jsonString);
            return {
                score: parsed.score,
                summary: parsed.summary,
                good: parsed.gutes,
                bad: parsed.verbesserungsbedarf
            }
        } catch (err) {
            console.error("Failed to parse JSON:", err, {cleaned});
            return {
                score: 0,
                summary: "Es konnte kein KI Feedback generiert werden.",
                good: [],
                bad: []
            };
        }

    }

    const handleAnswerSubmit = async () => {
        if (!tasks || !tasks[currentTaskIndex]) return;

        const task = tasks[currentTaskIndex];
        const answer = answers[task.id];
        const userReasoning = reasoning[task.id];
        const optionsByCorrectness = options.sort((optA) => optA.correctness)


        if (!currentLevel) {
            toast.error('Kein Level geladen');
            return;
        }

        if (!user.profile || !user.stats) {
            toast.error('Kein Nutzer angemeldet');
            return;
        }

        if (!answer) {
            toast.error('Bitte wähle eine Antwort aus');
            return;
        }

        if (currentTask.type === 'MC' && (!userReasoning || userReasoning.trim().length < 10)) {
            toast.error('Bitte begründe deine Antwort ausführlich (mindestens 10 Zeichen)');
            return;
        }

        try {
            setSubmitting(true);

            const freeTextAnswer: FreeTextAnswer | undefined = task.type === "FREE" ? {
                taskPrompt: task.prompt_text,
                exampleAnswer: task.example_answer,
                answer: answer
            } : undefined

            const selectedOption = options.find(opt => opt.id === answer);

            const multipleChoiceAnswer: MultipleChoiceAnswer | undefined = task.type === "MC" ? {
                taskPrompt: task.prompt_text,
                possibleOptions: options.map((opt) => opt.option_text),
                bestOption: optionsByCorrectness[0].option_text,
                selectedAnswer: selectedOption?.option_text || '',
                reasoning: userReasoning,
                exampleReasoning: task.example_answer
            } : undefined

            const pointsAwarded = selectedOption?.points_awarded || 0;
            const doseReceived = selectedOption?.dose_delta_msv || 0;

            // Get AI feedback for the reasoning

            const szenario = "Du bist ein freundlicher Physiklehrer der Feedback gibt.\n" +
                "### SZENARIO ###\n" +
                currentLevel.intro_text + "\n"

            const aiEvaluation = await evaluateReasoningWithAI(
                szenario, freeTextAnswer, multipleChoiceAnswer, task.evaluation_criteria
            );

            console.log(aiEvaluation)

            // TODO: Update user stats

            const {error} = await supabase
                .from("attempts")
                .insert({
                    user_id: user.profile?.user_id,
                    level_id: currentLevel.id,
                    task_id: task.id,
                    option_id: selectedOption?.id || null,

                    answer: selectedOption?.option_text || answer,
                    reasoning: userReasoning,
                    correctness: selectedOption?.correctness || 0,

                    points_got: pointsAwarded,
                    dose_msv_got: doseReceived,

                    ai_score: aiEvaluation?.score,
                    ai_summary: aiEvaluation?.summary,
                    ai_good: aiEvaluation?.good,
                    ai_bad: aiEvaluation?.bad,

                    timestamp: new Date().toISOString()
                });

            const userStats = await supabase
                .from("user_stats")
                .select("*")
                .eq("user_id", user.profile.user_id)
                .single();

            await supabase
                .from("user_stats")
                .update({
                    dose_msv: userStats.data.dose_msv + doseReceived,
                    knowledge_points: userStats.data.knowledge_points + pointsAwarded
                })
                .eq("user_id", user.profile.user_id);

            if (error) {
                console.error("Couldn't upload attempt data to Database", error);
            }

            updateStats({
                knowledge_points: user.stats.knowledge_points + pointsAwarded,
                dose_msv: user.stats.dose_msv + doseReceived
            })

            setFeedback({
                correctness: aiEvaluation?.score || 0,
                pointsAwarded,
                doseReceived,
                feedback: aiEvaluation?.score || 0 > 0
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

    const suggestions = feedback?.aiFeedback ? Array.of(...feedback.aiFeedback.good, ...feedback.aiFeedback.bad).filter((elem) => elem.length != 0) : []

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

                            {
                                currentTask.type === 'MC' ? (
                                    <>
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

                                        <div className="flex items-center space-x-2 mb-4">
                                            <Brain className="h-5 w-5 text-purple-600"/>
                                            <h3 className="text-lg font-medium text-gray-800">Wissenschaftliche
                                                Begründung
                                                (Pflichtfeld):</h3>
                                        </div>

                                        <div
                                            className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                                            <p className="text-sm text-purple-700">
                                                <strong>🤖 KI-Analyse:</strong> Erkläre deine Antwort wissenschaftlich
                                                fundiert.
                                                Das System bewertet deine Begründung auf fachliche Korrektheit,
                                                Verwendung von
                                                Fachbegriffen
                                                und logische Struktur. Je besser deine Begründung, desto hilfreicher das
                                                Feedback!
                                            </p>
                                            <div className="mt-2 text-xs text-purple-600">
                                                💡 <strong>Verwende Fachbegriffe wie:</strong> Radioaktivität, Strahlung,
                                                Dosis,
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

                                    </>

                                ) : (
                                    <div>
                                        <textarea
                                            value={answers[currentTask.id] || ''}
                                            onChange={(e) => handleAnswerChange(currentTask.id, e.target.value)}
                                            placeholder="Schreibe deine Antwort hier..."
                                            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                )
                            }
                        </div>

                        {/* Reasoning Section */}

                        <div className="flex justify-end">
                            <button
                                onClick={handleAnswerSubmit}
                                disabled={
                                    !answers[currentTask.id] ||
                                    (currentTask.type === 'MC' && (!reasoning[currentTask.id] ||
                                        reasoning[currentTask.id].trim().length <= 10)) ||
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
                                    feedback.correctness ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {feedback.correctness > 0 ? (
                                        <CheckCircle className="h-8 w-8 text-green-600"/>
                                    ) : (
                                        <XCircle className="h-8 w-8 text-red-600"/>
                                    )}
                                </div>

                                <h3 className={`text-2xl font-bold mb-2 ${
                                    feedback.correctness > 0 ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {feedback.correctness > 0 ? 'Richtig!' : 'Nicht ganz richtig'}
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
                            {feedback.aiFeedback ?
                                <div
                                    className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                                    <div className="flex items-start space-x-3 mb-4">
                                        <Brain className="h-6 w-6 text-purple-600 mt-1"/>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h4 className="font-semibold text-purple-800">🤖 KI-Bewertung deiner
                                                    Begründung:</h4>
                                                {feedback.aiFeedback.summary && (
                                                    <div
                                                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getQualityColor(feedback.aiFeedback.score)}`}>
                                                        {feedback.aiFeedback.score}/10
                                                        • {getQualityText(feedback.aiFeedback.score)}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-purple-700 leading-relaxed">{feedback.aiFeedback.summary}</p>
                                        </div>
                                    </div>

                                    {/* AI Suggestions */}
                                    {suggestions.length > 0 && (
                                        <div className="mt-4 p-4 bg-white/50 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Lightbulb className="h-4 w-4 text-yellow-600"/>
                                                <h5 className="font-medium text-purple-800">Verbesserungsvorschläge:</h5>
                                            </div>
                                            <ul className="space-y-1">
                                                {suggestions.map((suggestion: string, index: number) => (
                                                    <li key={index}
                                                        className="text-sm text-purple-600 flex items-start space-x-2">
                                                        <span className="text-yellow-500 mt-1">•</span>
                                                        <span>{suggestion}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div> :
                                <></>}

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