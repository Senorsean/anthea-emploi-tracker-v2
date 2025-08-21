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
    const { mbtiType, scores, answers } = await req.json();

    console.log('Génération de l\'analyse MBTI pour le type:', mbtiType);
    console.log('Scores:', scores);

    const prompt = `Tu es un expert en psychologie du travail spécialisé dans le MBTI (Myers-Briggs Type Indicator). 

Analyse le profil suivant :
- Type MBTI : ${mbtiType}
- Scores détaillés : ${JSON.stringify(scores)}
- Réponses aux questions : ${JSON.stringify(answers)}

Génère une analyse complète et personnalisée en français qui inclut :

1. VOTRE TYPE MBTI
- Nom du type avec sa signification
- Les 4 préférences identifiées (E/I, S/N, T/F, J/P)

2. CARACTÉRISTIQUES PRINCIPALES
- Description détaillée du type de personnalité
- Traits comportementaux typiques
- Style de communication préféré

3. FORCES ET TALENTS
- Points forts naturels de ce type
- Compétences facilement développées
- Valeurs et motivations profondes

4. AXES DE DÉVELOPPEMENT
- Aspects à développer pour un équilibre
- Situations potentiellement challengeantes
- Conseils pour le développement personnel

5. MÉTIERS RECOMMANDÉS
- Professions qui correspondent au type
- Environnements de travail favorables
- Rôles et responsabilités adaptés

6. CONSEILS POUR VOTRE CARRIÈRE
- Stratégies pour valoriser ses forces
- Comment gérer ses points de vigilance
- Conseils pour l'évolution professionnelle

L'analyse doit être :
- Personnalisée et bienveillante
- Pratique avec des exemples concrets
- Encourageante et constructive
- Adaptée au contexte professionnel français

Utilise un ton professionnel mais accessible, avec des conseils actionables.`;

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
            content: 'Tu es un expert en MBTI et psychologie du travail. Génère des analyses personnalisées et professionnelles.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse OpenAI reçue avec succès');

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans generate-mbti-analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        analysis: `# Analyse MBTI - ${new Date().toLocaleDateString('fr-FR')}

## VOTRE TYPE MBTI
Votre profil indique des préférences uniques qui définissent votre style de personnalité.

## CARACTÉRISTIQUES PRINCIPALES
Chaque type MBTI possède des caractéristiques distinctives qui influencent la façon de percevoir le monde et de prendre des décisions.

## FORCES ET TALENTS
- Capacités naturelles développées
- Compétences facilement acquises
- Motivations profondes

## AXES DE DÉVELOPPEMENT
- Aspects à renforcer
- Situations de croissance
- Équilibre des préférences

## MÉTIERS RECOMMANDÉS
- Environnements professionnels adaptés
- Rôles qui valorisent vos forces
- Secteurs d'activité pertinents

## CONSEILS POUR VOTRE CARRIÈRE
- Stratégies de développement
- Valorisation de vos atouts
- Évolution professionnelle

*Note : Cette analyse est basée sur vos réponses au questionnaire MBTI et vous donne des indications sur vos préférences comportementales.*`
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});