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
    const { responses } = await req.json();

    const prompt = `En tant qu'expert en développement de carrière et méthodes SMART/OKR, analysez les réponses suivantes d'un professionnel qui souhaite structurer ses objectifs de carrière selon la méthode SMART (Spécifique, Mesurable, Atteignable, Réaliste, Temporel) et l'approche OKR.

RÉPONSES DU PROFESSIONNEL :

OBJECTIF PRINCIPAL SMART :
- Objectif professionnel principal : ${responses.objectifPrincipal}
- Spécifique : ${responses.specifique}
- Mesurable : ${responses.mesurable}
- Atteignable : ${responses.atteignable}
- Réaliste : ${responses.realiste}
- Temporel : ${responses.temporel}

SOUS-OBJECTIFS ET ÉTAPES :
- Sous-objectif 1 (6 mois) : ${responses.sousObjectif1}
- Sous-objectif 2 (18 mois) : ${responses.sousObjectif2}
- Sous-objectif 3 (3 ans) : ${responses.sousObjectif3}
- Actions concrètes : ${responses.etapesAction}

MÉTRIQUES ET INDICATEURS :
- Indicateurs de succès : ${responses.indicateursSucces}
- Métriques quantitatives : ${responses.metriquesQuantitatives}
- Jalons importants : ${responses.jalonsImportants}
- Fréquence d'évaluation : ${responses.frequenceEvaluation}

PLAN D'ACTION TEMPOREL :
- Court terme (3-6 mois) : ${responses.echeanceCourt}
- Moyen terme (6-18 mois) : ${responses.echeanceMoyen}
- Long terme (1-3 ans) : ${responses.echeanceLong}
- Plan de contingence : ${responses.planContingence}

Fournissez une analyse complète structurée en 5 sections :

1. **OBJECTIF PRINCIPAL SMART** : Reformulez et optimisez l'objectif principal selon les critères SMART, en identifiant les points forts et les améliorations possibles.

2. **PLAN D'ACTION STRUCTURÉ** : Organisez les sous-objectifs et actions en un plan cohérent avec des dépendances claires entre les étapes.

3. **MÉTRIQUES ET SUIVI** : Définissez un système de mesure avec des KPIs précis et des méthodes d'évaluation régulière.

4. **CALENDRIER D'EXÉCUTION** : Créez un planning détaillé avec des jalons, des échéances et des points de contrôle réguliers.

5. **RECOMMANDATIONS PERSONNALISÉES** : Donnez des conseils spécifiques pour optimiser l'atteinte des objectifs, gérer les risques et maximiser les chances de succès.

Soyez concret, actionnable et professionnel. Mettez l'accent sur la mesurabilité et le suivi des progrès.`;

    console.log('Sending request to OpenAI for SMART/OKR analysis');

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
            content: 'Vous êtes un expert en développement de carrière spécialisé dans les méthodes SMART et OKR. Vous aidez les professionnels à structurer leurs objectifs de carrière de manière concrète et mesurable.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    const analysisText = data.choices[0].message.content;
    
    // Parse the response to extract the 5 sections
    const sections = analysisText.split(/\*\*(?:1\.|2\.|3\.|4\.|5\.)/);
    
    const analysis = {
      objectifPrincipal: sections[1]?.replace(/^\s*OBJECTIF PRINCIPAL SMART\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible',
      planAction: sections[2]?.replace(/^\s*PLAN D'ACTION STRUCTURÉ\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible',
      metriques: sections[3]?.replace(/^\s*MÉTRIQUES ET SUIVI\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible',
      calendrier: sections[4]?.replace(/^\s*CALENDRIER D'EXÉCUTION\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible',
      recommandations: sections[5]?.replace(/^\s*RECOMMANDATIONS PERSONNALISÉES\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible'
    };

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-smart-okr-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la génération de l\'analyse SMART/OKR',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});