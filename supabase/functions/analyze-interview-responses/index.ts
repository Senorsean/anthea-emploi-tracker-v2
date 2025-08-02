import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { questions, responses, jobOffer, companyInfo, cvInfo } = await req.json();

    const prompt = `En tant qu'expert en recrutement et coach en préparation d'entretiens, analysez les réponses de ce candidat aux questions d'entretien personnalisées.

CONTEXTE :
Offre d'emploi : ${jobOffer || "Non fournie"}
Présentation de l'entreprise : ${companyInfo || "Non fournie"}
Informations du CV : ${cvInfo || "Non fournies"}

QUESTIONS ET RÉPONSES :
${questions.map((q: any, index: number) => `
Question ${index + 1} (${q.category}) :
${q.question}

Réponse du candidat :
${responses[q.id] || "Aucune réponse fournie"}
`).join('\n')}

ANALYSE DEMANDÉE :
Pour chaque réponse, analysez :
1. La pertinence par rapport à la question posée
2. L'adéquation avec le poste et l'entreprise
3. La structure et la clarté de la réponse
4. Les points forts à maintenir
5. Les axes d'amélioration spécifiques
6. Des conseils pratiques pour l'entretien réel

CONSEILS GÉNÉRAUX :
Donnez aussi des conseils généraux basés sur l'ensemble des réponses pour :
- L'attitude à adopter lors de l'entretien
- Les points clés à retenir sur l'entreprise
- Les éléments du CV à mettre en avant
- Les questions à poser au recruteur

Répondez avec un objet JSON structuré :
{
  "globalScore": 85,
  "globalFeedback": "Analyse générale des réponses...",
  "questionAnalyses": [
    {
      "questionId": 1,
      "score": 80,
      "strengths": ["Point fort 1", "Point fort 2"],
      "improvements": ["Amélioration 1", "Amélioration 2"],
      "specificAdvice": "Conseil spécifique pour cette question..."
    }
  ],
  "interviewTips": [
    "Conseil pratique 1 pour l'entretien",
    "Conseil pratique 2 pour l'entretien"
  ],
  "companyFocus": [
    "Point clé 1 sur l'entreprise à retenir",
    "Point clé 2 sur l'entreprise à retenir"
  ],
  "cvHighlights": [
    "Élément du CV 1 à mettre en avant",
    "Élément du CV 2 à mettre en avant"
  ],
  "questionsToAsk": [
    "Question pertinente 1 à poser au recruteur",
    "Question pertinente 2 à poser au recruteur"
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en recrutement et coach professionnel spécialisé dans la préparation d\'entretiens. Tu analyses les réponses de manière constructive et donnes des conseils pratiques et personnalisés. Réponds toujours avec un JSON valide.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, return a structured error
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-interview-responses function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Une erreur est survenue lors de l\'analyse des réponses'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});