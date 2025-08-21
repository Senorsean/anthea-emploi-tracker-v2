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
    console.log('Génération de l\'analyse des motivations...');
    const { scores } = await req.json();
    console.log('Scores:', scores);

    console.log('Envoi de la requête à OpenAI...');
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
            content: `Tu es un expert en psychologie du travail spécialisé dans l'analyse des motivations professionnelles.
            Tu analyses les profils motivationnels selon 8 dimensions clés :
            - Pouvoir (POU) : besoin d'influence et de contrôle
            - Sécurité (SEC) : besoin de stabilité et de prévisibilité
            - Liberté (LIB) : besoin d'autonomie et d'indépendance
            - Reconnaissance (REC) : besoin de valorisation et d'appréciation
            - Curiosité (CUR) : besoin d'apprentissage et de nouveauté
            - Social (SOC) : besoin d'aider et d'avoir un impact positif
            - Autonomie (AUT) : besoin de prise de décision et d'initiative
            - Statut (STA) : besoin de prestige et de reconnaissance sociale
            
            Génère une analyse personnalisée en français, structurée et actionnable.`
          },
          {
            role: 'user',
            content: `Voici les scores du questionnaire motivationnel (sur 100) :
            
Pouvoir: ${scores.POU}%
Sécurité: ${scores.SEC}%
Liberté: ${scores.LIB}%
Reconnaissance: ${scores.REC}%
Curiosité: ${scores.CUR}%
Social: ${scores.SOC}%
Autonomie: ${scores.AUT}%
Statut: ${scores.STA}%

Génère une analyse complète incluant :

## Profil Motivationnel Dominant
- Identifie les 3 motivations les plus élevées
- Explique ce qu'elles révèlent sur la personne

## Analyse des Dimensions

### Motivations Principales (scores > 70%)
Pour chaque motivation principale, explique :
- Ce que cela signifie concrètement
- Comment cela se manifeste au travail
- Les besoins associés

### Motivations Modérées (scores 40-70%)
Analyse brièvement les motivations intermédiaires

### Motivations Faibles (scores < 40%)
Explique ce que les scores faibles révèlent

## Environnements de Travail Favorables
- 3-4 types d'environnements qui correspondent au profil
- Éléments clés à rechercher dans un poste
- Signaux d'alarme à éviter

## Recommandations Personnalisées
- Actions concrètes pour maximiser la motivation
- Stratégies pour combler les besoins identifiés
- Conseils pour l'épanouissement professionnel

## Pistes de Développement
- Compétences à développer en lien avec les motivations
- Opportunités d'évolution cohérentes avec le profil

Sois concret, pratique et bienveillant. Utilise un ton professionnel mais accessible.`
          }
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    console.log('Réponse OpenAI reçue avec succès');
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erreur OpenAI:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-motivation-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});