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
    console.log('Génération de l\'analyse Big Five...');
    
    const { scores, answers } = await req.json();
    console.log('Scores:', scores);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Envoi de la requête à OpenAI...');

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
            content: `Tu es un psychologue expert en évaluation de la personnalité et spécialiste du modèle Big Five (OCEAN). 
            Tu dois analyser les résultats d'un test Big Five et fournir une analyse détaillée en français, 
            professionnelle et bienveillante, adaptée au contexte professionnel et du développement personnel.

            Le modèle Big Five évalue 5 dimensions :
            - Ouverture (Openness) : créativité, curiosité intellectuelle, ouverture aux expériences
            - Conscienciosité (Conscientiousness) : organisation, persévérance, autodiscipline  
            - Extraversion : sociabilité, énergie, assertivité
            - Agréabilité (Agreeableness) : coopération, confiance, empathie
            - Neuroticisme (Neuroticism) : stabilité émotionnelle, gestion du stress

            Ton analyse doit être structurée ainsi :
            1. Introduction du profil global
            2. Analyse détaillée de chaque dimension avec implications professionnelles
            3. Points forts et défis identifiés
            4. Recommandations pour le développement professionnel
            5. Environnements de travail favorables

            Utilise un ton professionnel mais accessible, évite le jargon psychologique complexe.`
          },
          {
            role: 'user',
            content: `Voici les scores Big Five d'une personne (sur 100) :

Ouverture : ${scores.O}/100
Conscienciosité : ${scores.C}/100  
Extraversion : ${scores.E}/100
Agréabilité : ${scores.A}/100
Neuroticisme : ${scores.N}/100

Génère une analyse complète et personnalisée de ce profil Big Five, 
en te concentrant sur les implications professionnelles et les recommandations 
de développement de carrière. L'analyse doit faire environ 800-1000 mots.`
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur OpenAI:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Réponse OpenAI reçue avec succès');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Format de réponse OpenAI invalide');
    }

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans generate-big-five-analysis:', error);
    
    // Retourner une analyse de fallback en cas d'erreur
    const fallbackAnalysis = `# Analyse Big Five - Rapport Personnalisé

## Votre Profil Général

Votre profil Big Five révèle des traits de personnalité uniques qui influencent votre façon d'interagir avec le monde professionnel et personnel.

## Analyse par Dimension

### Ouverture à l'Expérience
Cette dimension reflète votre curiosité intellectuelle et votre appréciation pour la nouveauté et la créativité.

### Conscienciosité  
Elle mesure votre niveau d'organisation, de persévérance et de discipline personnelle.

### Extraversion
Cette dimension évalue votre niveau d'énergie sociale et votre confort dans les interactions interpersonnelles.

### Agréabilité
Elle reflète votre tendance à être coopératif, confiant et empathique dans vos relations.

### Neuroticisme
Cette dimension mesure votre stabilité émotionnelle et votre capacité à gérer le stress.

## Recommandations Professionnelles

Votre profil suggère certains environnements de travail et types de rôles qui pourraient vous convenir particulièrement bien.

## Développement Personnel

Considérez ces domaines pour votre développement professionnel continu.

*Note : Cette analyse est générée automatiquement. Pour une évaluation approfondie, consultez un professionnel qualifié.*`;

    return new Response(JSON.stringify({ analysis: fallbackAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});