import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();

    console.log('Received form data:', formData);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Construire le prompt pour l'analyse transactionnelle
    const prompt = `Tu es un expert en analyse transactionnelle et coaching professionnel. Analyse les réponses suivantes d'un candidat concernant les 5 drivers de l'analyse transactionnelle.

Réponses du candidat:
${Object.entries(formData)
  .map(([key, value]) => `${key}: ${value}/5`)
  .join('\n')}

Les 5 drivers sont:
1. "Sois parfait" - Besoin de perfection qui peut créer stress et procrastination
2. "Fais plaisir" - Besoin d'être apprécié qui peut mener à l'épuisement et difficulté à dire non  
3. "Sois fort" - Besoin de ne pas montrer ses émotions qui peut isoler et empêcher de demander de l'aide
4. "Dépêche-toi" - Besoin de rapidité qui peut mener à l'impatience et erreurs par précipitation
5. "Fais des efforts" - Besoin de prouver sa valeur par l'effort qui peut mener au surmenage

Fournir une analyse JSON structurée avec:

{
  "dominantDrivers": [
    {
      "driver": "nom du driver",
      "score": score sur 100,
      "description": "description personnalisée de comment ce driver se manifeste chez cette personne"
    }
  ],
  "professionalImpact": {
    "strengths": ["liste des forces que ces drivers apportent dans le contexte professionnel"],
    "blockages": ["liste des blocages et limitations que ces drivers peuvent créer"],
    "opportunities": ["opportunités de développement en s'appuyant sur ces drivers"]
  },
  "actionPlan": [
    {
      "driver": "nom du driver dominant",
      "actions": ["actions concrètes pour mieux gérer ce driver au travail"]
    }
  ],
  "coaching_tips": [
    "conseils pratiques de coaching pour transformer ces patterns",
    "techniques pour développer plus de flexibilité"
  ],
  "reflection_questions": [
    "questions de réflexion pour approfondir la prise de conscience",
    "questions pour explorer l'origine de ces patterns"
  ]
}

Important:
- Calculer le score de chaque driver basé sur les réponses (moyenne des 5 questions par driver * 20)
- Identifier les 2-3 drivers les plus dominants
- Donner des conseils pratiques et applicables
- Adopter un ton bienveillant et professionnel
- Utiliser un langage accessible, éviter le jargon technique
- Proposer des actions concrètes pour le développement professionnel`;

    console.log('Sending request to OpenAI...');

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
            content: 'Tu es un expert en analyse transactionnelle et coaching professionnel. Tu fournis des analyses structurées et bienveillantes pour aider les professionnels à comprendre leurs patterns comportementaux.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const analysisContent = data.choices[0].message.content;

    let analysisResult;
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.log('Raw content:', analysisContent);
      
      // Fallback avec une structure basique
      analysisResult = {
        dominantDrivers: [
          {
            driver: "Analyse en cours",
            score: 75,
            description: "L'analyse détaillée sera disponible sous peu. Veuillez réessayer."
          }
        ],
        professionalImpact: {
          strengths: ["Capacité d'adaptation", "Sens des responsabilités"],
          blockages: ["Perfectionnisme", "Difficulté à déléguer"],
          opportunities: ["Développement du leadership", "Amélioration de la communication"]
        },
        actionPlan: [
          {
            driver: "Développement personnel",
            actions: ["Pratiquer l'auto-compassion", "Définir des priorités claires"]
          }
        ],
        coaching_tips: [
          "Prenez conscience de vos patterns automatiques",
          "Pratiquez la pause avant de réagir"
        ],
        reflection_questions: [
          "Dans quelles situations ces patterns se manifestent-ils le plus ?",
          "Quel serait l'impact de plus de flexibilité dans ces moments ?"
        ]
      };
    }

    // Validation de la structure
    if (!analysisResult.dominantDrivers || !Array.isArray(analysisResult.dominantDrivers)) {
      analysisResult.dominantDrivers = [];
    }
    if (!analysisResult.professionalImpact) {
      analysisResult.professionalImpact = { strengths: [], blockages: [], opportunities: [] };
    }
    if (!analysisResult.actionPlan || !Array.isArray(analysisResult.actionPlan)) {
      analysisResult.actionPlan = [];
    }
    if (!analysisResult.coaching_tips || !Array.isArray(analysisResult.coaching_tips)) {
      analysisResult.coaching_tips = [];
    }
    if (!analysisResult.reflection_questions || !Array.isArray(analysisResult.reflection_questions)) {
      analysisResult.reflection_questions = [];
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-transactional-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de la génération de l\'analyse transactionnelle',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});