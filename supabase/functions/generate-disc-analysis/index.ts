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
    const { scores } = await req.json();

    console.log('Generating DISC analysis for scores:', scores);

    const prompt = `
En tant qu'expert en évaluation DISC (Dominance, Influence, Stabilité, Conformité), analysez ce profil comportemental professionnel.

SCORES DISC :
- Dominance (D) : ${scores.D}%
- Influence (I) : ${scores.I}%
- Stabilité (S) : ${scores.S}%
- Conformité (C) : ${scores.C}%

CONSIGNES D'ANALYSE :

1. **Profil comportemental dominant** : Identifiez les dimensions les plus élevées et ce qu'elles révèlent sur le style de communication et de travail

2. **Style de leadership et management** : Comment cette personne dirige, motive et interagit avec les autres

3. **Forces professionnelles** : Les atouts naturels dans l'environnement de travail basés sur ce profil DISC

4. **Zones de vigilance** : Les aspects à surveiller ou développer pour une meilleure efficacité

5. **Communication optimale** : Comment communiquer efficacement avec cette personne et comment elle devrait adapter sa communication

6. **Environnement de travail idéal** : Le type d'environnement, de rôle et de culture qui convient le mieux

7. **Développement professionnel** : 3-5 recommandations concrètes pour optimiser son impact professionnel

FORMAT DE RÉPONSE :
- Utilisez un style professionnel et bienveillant
- Donnez des exemples concrets et applicables
- Soyez spécifique sur les comportements observables
- Incluez des conseils pratiques pour le développement

Limitez votre réponse à 2000 mots maximum.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-11-20',
        messages: [
          { 
            role: 'system', 
            content: 'Vous êtes un expert en analyse comportementale DISC, spécialisé dans l\'évaluation des profils professionnels.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      throw new Error(data.error.message || 'Erreur de l\'API OpenAI');
    }

    const analysis = data.choices[0].message.content;

    console.log('DISC analysis generated successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-disc-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la génération de l\'analyse DISC',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
