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
    const { formData } = await req.json();

    console.log('Received form data:', formData);

    const prompt = `En tant qu'expert en développement professionnel et formation, analysez le profil suivant et créez un plan de développement complet focalisé sur les compétences de demain :

**PROFIL :**
- Poste actuel : ${formData.currentRole}
- Expérience : ${formData.experience}
- Secteur : ${formData.industry}
- Compétences actuelles : ${formData.currentSkills}
- Objectifs de carrière : ${formData.careerGoals}
- Temps disponible : ${formData.timeAvailable}
- Budget : ${formData.budget}
- Style d'apprentissage : ${formData.learningStyle}

**MISSION :**
Générez un plan de développement structuré qui identifie :

1. **COMPÉTENCES CLÉS DE DEMAIN** (keySkills) :
   - ai : 4-5 compétences liées à l'IA et automatisation
   - digital : 4-5 compétences digitales/tech essentielles
   - softSkills : 4-5 soft skills critiques pour l'avenir

2. **PLAN DE MONTÉE EN COMPÉTENCES** (trainingPlan) :
   - mooc : 3-4 MOOC recommandés avec provider, durée, niveau
   - certifications : 3-4 formations certifiantes avec provider, durée, coût
   - mentoring : 2-3 options de mentorat avec type, description, durée

3. **PORTFOLIO & SUIVI** (portfolio) :
   - structure : 4-5 éléments de structure du portfolio
   - trackingMethods : 3-4 méthodes de suivi de progression
   - examples : 4 exemples de formats de portfolio

4. **TIMELINE** (timeline) :
   - immediate : 3-4 actions à faire maintenant
   - shortTerm : 3-4 actions 3-6 mois
   - longTerm : 3-4 actions 6-12 mois+

5. **RÉSUMÉ** (summary) : Synthèse du plan en 2-3 phrases

**IMPORTANT :**
- Adaptez les recommandations au profil, secteur et objectifs
- Proposez des solutions réalistes selon le temps/budget disponible
- Mettez l'accent sur les compétences IA, digital et soft skills de demain
- Soyez spécifique sur les formations et certifications
- Le portfolio doit être un vrai outil de suivi de progression

Répondez uniquement avec un JSON valide suivant exactement cette structure :

{
  "keySkills": {
    "ai": ["compétence1", "compétence2", "compétence3", "compétence4"],
    "digital": ["compétence1", "compétence2", "compétence3", "compétence4"],
    "softSkills": ["compétence1", "compétence2", "compétence3", "compétence4"]
  },
  "trainingPlan": {
    "mooc": [
      {"name": "Nom du MOOC", "provider": "Plateforme", "duration": "X semaines", "level": "Niveau"},
      {"name": "Nom du MOOC", "provider": "Plateforme", "duration": "X semaines", "level": "Niveau"}
    ],
    "certifications": [
      {"name": "Nom certification", "provider": "Organisme", "duration": "X mois", "cost": "X€"},
      {"name": "Nom certification", "provider": "Organisme", "duration": "X mois", "cost": "X€"}
    ],
    "mentoring": [
      {"type": "Type de mentorat", "description": "Description", "duration": "X mois"},
      {"type": "Type de mentorat", "description": "Description", "duration": "X mois"}
    ]
  },
  "portfolio": {
    "structure": ["élément1", "élément2", "élément3", "élément4"],
    "trackingMethods": ["méthode1", "méthode2", "méthode3"],
    "examples": ["exemple1", "exemple2", "exemple3", "exemple4"]
  },
  "timeline": {
    "immediate": ["action1", "action2", "action3"],
    "shortTerm": ["action1", "action2", "action3"],
    "longTerm": ["action1", "action2", "action3"]
  },
  "summary": "Résumé en 2-3 phrases du plan de développement recommandé."
}`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en développement professionnel et formation continue, spécialisé dans l\'identification des compétences de demain (IA, digital, soft skills) et la création de plans de formation personnalisés. Tu réponds toujours en français avec des recommandations pratiques et réalistes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response data:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Generated content:', content);

    // Try to parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    console.log('Parsed analysis result:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-competences-formation-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});