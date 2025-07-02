import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EvaluationRequest {
  task_prompt: string
  selected_answer: string
  student_reasoning: string
  is_correct: boolean
  topic: string
}

interface EvaluationResponse {
  feedback: string
  quality_score: number
  suggestions: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { task_prompt, selected_answer, student_reasoning, is_correct, topic }: EvaluationRequest = await req.json()

    // Validate input
    if (!task_prompt || !selected_answer || !student_reasoning) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare the prompt for the AI
    const systemPrompt = `Du bist ein erfahrener Physiklehrer, der Schüler beim Lernen über Radioaktivität unterstützt. 
    
Deine Aufgabe ist es, die Begründung eines Schülers zu bewerten und konstruktives Feedback zu geben.

Bewertungskriterien:
1. Fachliche Korrektheit der Argumentation
2. Verwendung von Fachbegrffen
3. Logische Struktur der Begründung
4. Tiefe des Verständnisses
5. Bezug zur Aufgabenstellung

Gib immer:
- Konstruktives, ermutigendes Feedback
- Spezifische Verbesserungsvorschläge
- Lob für gute Ansätze
- Hinweise auf Missverständnisse
- Anregungen zum Weiterlernen

Antworte auf Deutsch und sei pädagogisch wertvoll.`

    const userPrompt = `
AUFGABE: ${task_prompt}

GEWÄHLTE ANTWORT: ${selected_answer}
KORREKTHEIT: ${is_correct ? 'Richtig' : 'Falsch'}

BEGRÜNDUNG DES SCHÜLERS:
"${student_reasoning}"

Bitte bewerte diese Begründung und gib konstruktives Feedback. Berücksichtige dabei:
- Die fachliche Qualität der Argumentation
- Ob die Begründung zur gewählten Antwort passt
- Verbesserungsmöglichkeiten
- Positive Aspekte der Begründung

Gib eine Bewertung von 1-10 für die Qualität der Begründung und erkläre deine Einschätzung.`

    // Call OpenAI API (or other AI service)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      // Fallback to rule-based feedback if no API key
      const fallbackFeedback = generateFallbackFeedback(student_reasoning, is_correct)
      return new Response(
        JSON.stringify(fallbackFeedback),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const aiFeedback = openaiData.choices[0]?.message?.content || 'Feedback konnte nicht generiert werden.'

    // Extract quality score from AI response (simple regex approach)
    const scoreMatch = aiFeedback.match(/(\d+)\/10|(\d+) von 10|Bewertung:?\s*(\d+)/i)
    const qualityScore = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) : 5

    // Generate suggestions based on the feedback
    const suggestions = generateSuggestions(aiFeedback, is_correct, student_reasoning)

    const response: EvaluationResponse = {
      feedback: aiFeedback,
      quality_score: qualityScore,
      suggestions: suggestions
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in evaluate-reasoning function:', error)
    
    // Return fallback feedback on error
    const fallbackFeedback = generateFallbackFeedback('', false)
    return new Response(
      JSON.stringify(fallbackFeedback),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateFallbackFeedback(reasoning: string, isCorrect: boolean): EvaluationResponse {
  const reasoningLength = reasoning.trim().length
  
  let feedback = ''
  let qualityScore = 5
  let suggestions: string[] = []

  if (reasoningLength < 20) {
    feedback = "Deine Begründung ist sehr kurz. Versuche deine Gedanken ausführlicher zu erklären und gehe auf die wissenschaftlichen Hintergründe ein."
    qualityScore = 3
    suggestions = [
      "Erkläre die physikalischen Grundlagen ausführlicher",
      "Verwende mehr Fachbegriffe",
      "Beschreibe deine Denkschritte genauer"
    ]
  } else if (isCorrect) {
    const positiveResponses = [
      "Ausgezeichnete Begründung! Du zeigst ein gutes Verständnis der physikalischen Zusammenhänge.",
      "Sehr gut! Deine Argumentation ist logisch nachvollziehbar und fachlich korrekt.",
      "Perfekt! Du hast die wichtigsten Aspekte erfasst und gut erklärt.",
      "Hervorragend! Deine Begründung zeigt tiefes Verständnis des Themas."
    ]
    feedback = positiveResponses[Math.floor(Math.random() * positiveResponses.length)]
    qualityScore = reasoningLength > 100 ? 8 : 7
    suggestions = [
      "Weiter so! Deine Argumentation ist sehr gut",
      "Vertiefe dein Wissen mit weiteren Aufgaben",
      "Du könntest noch mehr Fachbegriffe verwenden"
    ]
  } else {
    const constructiveResponses = [
      "Deine Begründung zeigt Denkansätze, aber überdenke die physikalischen Grundlagen noch einmal. Achte besonders auf die Eigenschaften radioaktiver Strahlung.",
      "Du bist auf dem richtigen Weg, aber es gibt noch Verbesserungspotential. Denke an die Grundprinzipien der Kernphysik.",
      "Interessanter Ansatz, aber nicht ganz richtig. Wiederhole die Grundlagen über Atomkerne und radioaktiven Zerfall.",
      "Deine Überlegungen sind nachvollziehbar, führen aber zum falschen Schluss. Beschäftige dich nochmal mit den verschiedenen Strahlungsarten."
    ]
    feedback = constructiveResponses[Math.floor(Math.random() * constructiveResponses.length)]
    qualityScore = reasoningLength > 50 ? 4 : 3
    suggestions = [
      "Wiederhole die Grundlagen der Radioaktivität",
      "Achte auf die verschiedenen Strahlungsarten",
      "Denke an die Eigenschaften von Atomkernen",
      "Verwende mehr wissenschaftliche Begriffe"
    ]
  }

  return {
    feedback,
    quality_score: qualityScore,
    suggestions
  }
}

function generateSuggestions(feedback: string, isCorrect: boolean, reasoning: string): string[] {
  const suggestions: string[] = []
  
  if (feedback.toLowerCase().includes('fachbegriff')) {
    suggestions.push("Verwende mehr physikalische Fachbegriffe")
  }
  
  if (feedback.toLowerCase().includes('kurz') || reasoning.length < 50) {
    suggestions.push("Erkläre deine Gedanken ausführlicher")
  }
  
  if (!isCorrect) {
    suggestions.push("Wiederhole die Grundlagen zu diesem Thema")
    suggestions.push("Achte auf die physikalischen Zusammenhänge")
  }
  
  if (feedback.toLowerCase().includes('gut') || feedback.toLowerCase().includes('richtig')) {
    suggestions.push("Weiter so! Du bist auf dem richtigen Weg")
  }
  
  // Default suggestions if none were generated
  if (suggestions.length === 0) {
    suggestions.push("Denke über die physikalischen Grundlagen nach")
    suggestions.push("Erkläre deine Überlegungen Schritt für Schritt")
  }
  
  return suggestions.slice(0, 3) // Limit to 3 suggestions
}