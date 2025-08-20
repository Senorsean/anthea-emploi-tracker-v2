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
    const { responses } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Tu es un expert en développement professionnel et en analyse stratégique personnelle. Analyse les réponses SWOT suivantes et génère une analyse complète et personnalisée.

RÉPONSES DU CANDIDAT :

FORCES (Atouts internes) :
- Compétences techniques : ${responses.competencesTechniques}
- Qualités personnelles : ${responses.qualitesPersonnelles}
- Expériences : ${responses.experiences}
- Réseau professionnel : ${responses.reseauProfessionnel}

FAIBLESSES (Points d'amélioration internes) :
- Compétences à améliorer : ${responses.competencesAmeliorer}
- Traits limitants : ${responses.traitsLimitants}
- Manque d'expérience : ${responses.manqueExperience}
- Freins personnels : ${responses.freinsPersonnels}

OPPORTUNITÉS (Environnement externe favorable) :
- Tendances secteur : ${responses.tendancesSecteur}
- Nouvelles technologies : ${responses.nouvellesTechnologies}
- Réseau et contacts : ${responses.reseauEtContacts}
- Formations disponibles : ${responses.formationsCertifications}

MENACES (Risques externes) :
- Concurrence marché : ${responses.concurrenceMarche}
- Automation/IA : ${responses.automationIA}
- Instabilité secteur : ${responses.instabiliteSecteur}
- Contraintes économiques : ${responses.contraintesEconomiques}

CONSIGNE :
Génère une analyse SWOT structurée avec :

1. FORCES : Synthèse des atouts principaux et comment les valoriser
2. FAIBLESSES : Points d'amélioration prioritaires avec recommandations
3. OPPORTUNITÉS : Comment saisir les opportunités identifiées
4. MENACES : Stratégies de mitigation des risques
5. STRATÉGIES RECOMMANDÉES : Stratégies SO (Forces-Opportunités), ST (Forces-Menaces), WO (Faiblesses-Opportunités), WT (Faiblesses-Menaces)
6. PLAN D'ACTION : Actions concrètes à court, moyen et long terme

Utilise un ton professionnel mais bienveillant. Sois spécifique et actionnable.

FORMAT DE RÉPONSE JSON :
{
  "forces": "Analyse des forces...",
  "faiblesses": "Analyse des faiblesses...",
  "opportunites": "Analyse des opportunités...",
  "menaces": "Analyse des menaces...",
  "strategies": "Stratégies recommandées...",
  "planAction": "Plan d'action détaillé..."
}`;

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
            content: 'Tu es un expert en développement professionnel et en analyse stratégique. Tu produis des analyses SWOT personnalisées et actionnables pour aider les professionnels dans leur carrière.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const analysisText = data.choices[0].message.content;
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', analysisText);
      throw new Error('Invalid JSON response from OpenAI');
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-swot-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});