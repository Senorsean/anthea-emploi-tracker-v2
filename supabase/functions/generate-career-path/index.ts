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
    const { careerData } = await req.json();

    if (!careerData) {
      throw new Error('Career data is required');
    }

    const prompt = `Tu es un expert en ressources humaines et développement de carrière. 

Profil actuel :
- Poste : ${careerData.jobTitle}
- Expérience : ${careerData.experience} ans
- Secteur : ${careerData.industry}
- Taille d'équipe : ${careerData.teamSize}
- Périmètre : ${careerData.scope}
- Formation : ${careerData.education}
- Lieu : ${careerData.location}

Génère un parcours de carrière personnalisé et réaliste avec 3-4 étapes d'évolution possibles pour les 10 prochaines années. Pour chaque étape, fournis :

1. Titre de poste précis et réaliste
2. Délai estimé (en années)
3. Description courte de l'évolution
4. Prérequis spécifiques
5. Augmentation salariale estimée (%)
6. Responsabilités détaillées (4-5 points)
7. Compétences à développer (4-5 points)
8. Opportunités de formation/développement (4-5 points)

Assure-toi que :
- Les évolutions sont cohérentes avec le secteur d'activité
- Les délais sont réalistes selon l'expérience actuelle
- Les titres de postes correspondent aux standards du marché français
- Les augmentations salariales sont cohérentes avec le marché

Réponds uniquement en JSON valide avec cette structure :
{
  "steps": [
    {
      "title": "Titre du poste",
      "timeframe": "X-Y ans",
      "description": "Description de l'évolution",
      "requirements": ["Prérequis 1", "Prérequis 2"],
      "salaryIncrease": "+X-Y%",
      "details": {
        "responsibilities": ["Responsabilité 1", "Responsabilité 2", "Responsabilité 3", "Responsabilité 4"],
        "skills": ["Compétence 1", "Compétence 2", "Compétence 3", "Compétence 4"],
        "opportunities": ["Opportunité 1", "Opportunité 2", "Opportunité 3", "Opportunité 4"]
      }
    }
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
          { role: 'system', content: 'Tu es un expert en ressources humaines spécialisé dans le développement de carrière en France. Tu connais parfaitement les évolutions possibles dans tous les secteurs d\'activité.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const careerPath = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(careerPath), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-career-path function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});