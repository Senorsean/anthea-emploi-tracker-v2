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

    const prompt = `Tu es un expert en orientation professionnelle et conseiller en carrière, spécialisé dans la théorie des Ancres de Carrière d'Edgar Schein.

Un candidat a évalué l'importance de chaque ancre de carrière sur une échelle de 1 à 10 :

1. Compétence Technique/Fonctionnelle : ${scores.technique}/10
2. Compétence Managériale : ${scores.management}/10
3. Autonomie/Indépendance : ${scores.autonomie}/10
4. Sécurité/Stabilité : ${scores.securite}/10
5. Créativité Entrepreneuriale : ${scores.creativite}/10
6. Service/Dévouement à une cause : ${scores.service}/10
7. Défi Pur : ${scores.defi}/10
8. Style de Vie : ${scores.styleVie}/10

Sur la base de ces scores, fournis une analyse professionnelle et complète en français.

Réponds UNIQUEMENT avec un JSON valide contenant exactement 4 clés :

{
  "ancresDominantes": "Une analyse des 2-3 ancres les plus élevées et ce qu'elles révèlent sur les motivations principales du candidat (200-250 mots)",
  "profilCarriere": "Une description du profil de carrière basée sur la combinaison des ancres dominantes et secondaires (200-250 mots)",
  "implications": "Les implications concrètes pour le choix de métiers, secteurs, types d'organisations, et environnements de travail adaptés (200-250 mots)",
  "recommandations": "Des recommandations pratiques et actionnables pour orienter les recherches d'emploi et les choix de carrière (200-250 mots)"
}

IMPORTANT : 
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après
- Utilise des retours à la ligne (\\n) pour structurer le contenu
- Sois précis, professionnel et bienveillant
- Mentionne les scores spécifiques pour illustrer ton analyse
- Donne des exemples concrets de métiers et d'environnements professionnels`;

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
            content: 'Tu es un expert en orientation professionnelle spécialisé dans les Ancres de Carrière de Schein. Tu fournis des analyses structurées au format JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate analysis');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      // Remove any potential markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse JSON:', content);
      throw new Error('Invalid JSON response from AI');
    }

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-ancres-carriere-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
