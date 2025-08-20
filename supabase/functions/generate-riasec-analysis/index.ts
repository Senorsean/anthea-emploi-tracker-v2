import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { likedActivities, dislikedActivities } = await req.json();

    console.log('Analyse RIASEC demandée:', { likedActivities, dislikedActivities });

    const prompt = `En tant qu'expert en orientation professionnelle et en modèle RIASEC (Holland), analysez les préférences suivantes :

ACTIVITÉS APPRÉCIÉES :
${likedActivities.map((a: any) => `- ${a.title} (${a.category})`).join('\n')}

ACTIVITÉS NON APPRÉCIÉES :
${dislikedActivities.map((a: any) => `- ${a.title} (${a.category})`).join('\n')}

Légende RIASEC :
- R (Réaliste) : Activités pratiques et concrètes
- I (Investigateur) : Recherche et analyse  
- A (Artistique) : Création et expression
- S (Social) : Aide et accompagnement
- E (Entreprenant) : Leadership et influence
- C (Conventionnel) : Organisation et structure

Fournissez une analyse structurée au format JSON avec :

1. "dominantProfiles" : les 2-3 pôles dominants avec leur description
2. "personalityTraits" : les traits de personnalité associés
3. "recommendations" : liste de 8-10 métiers correspondants
4. "actionPlan" : 5 étapes concrètes d'exploration professionnelle
5. "marketOpportunities" : secteurs porteurs liés aux pôles dominants

Soyez précis, bienveillant et actionnable.`;

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
            content: 'Tu es un expert en orientation professionnelle et en typologie RIASEC. Tu fournis des analyses personnalisées et des recommandations actionables.'
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse OpenAI reçue:', data);

    let analysisResult;
    try {
      const content = data.choices[0].message.content;
      console.log('Contenu brut:', content);
      
      // Extraire le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Aucun JSON trouvé dans la réponse');
      }
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      // Fallback en cas d'erreur de parsing
      analysisResult = {
        dominantProfiles: [
          { category: 'I', description: 'Vous appréciez l\'analyse et la recherche' },
          { category: 'S', description: 'Vous êtes orienté vers l\'aide aux autres' }
        ],
        personalityTraits: [
          'Esprit analytique',
          'Empathie naturelle',
          'Goût pour l\'apprentissage'
        ],
        recommendations: [
          'Psychologue',
          'Conseiller en orientation',
          'Chercheur en sciences sociales',
          'Formateur',
          'Consultant RH',
          'Travailleur social',
          'Analyste de données',
          'Professeur'
        ],
        actionPlan: [
          'Rencontrer des professionnels des métiers identifiés',
          'Effectuer des stages d\'observation',
          'Rejoindre des associations professionnelles',
          'Suivre des formations courtes dans les domaines ciblés',
          'Développer un portfolio de compétences'
        ],
        marketOpportunities: [
          'Secteur de la santé mentale en expansion',
          'Formation professionnelle continue',
          'Conseil en ressources humaines',
          'Recherche et développement'
        ]
      };
    }

    console.log('Analyse finale:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans generate-riasec-analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'analyse RIASEC',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});