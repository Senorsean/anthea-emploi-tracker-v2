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
    const { responses, sections } = await req.json();

    // Analyser les réponses par section
    const sectionAnalysis = sections.map((section: any, sectionIndex: number) => {
      const sectionResponses = section.questions.map((_: any, questionIndex: number) => {
        const responseKey = `${sectionIndex}-${questionIndex}`;
        return responses[responseKey] || 0;
      });
      
      const average = sectionResponses.reduce((sum: number, score: number) => sum + score, 0) / sectionResponses.length;
      
      return {
        title: section.title,
        average: average.toFixed(1),
        responses: sectionResponses,
        questions: section.questions
      };
    });

    const analysisPrompt = `
En tant qu'expert en bilans de compétences utilisant la méthode CAP (Cartographie des Atouts Professionnels), analysez ce profil professionnel.

DONNÉES D'ÉVALUATION :
${sectionAnalysis.map(section => `
${section.title} (Score moyen: ${section.average}/5):
${section.questions.map((q: string, i: number) => `- ${q}: ${section.responses[i]}/5`).join('\n')}
`).join('\n')}

CONSIGNES D'ANALYSE :
1. **Profil des centres d'intérêt** : Identifiez les domaines d'activité les plus attractifs
2. **Système de valeurs** : Déterminez ce qui motive profondément cette personne
3. **Compétences transversales** : Évaluez les forces et axes d'amélioration
4. **Environnement optimal** : Définissez le cadre de travail idéal
5. **Cohérence du profil** : Analysez les alignements et contradictions
6. **Plan d'action concret** : Proposez 3-5 actions prioritaires avec des métiers/secteurs correspondants

FORMAT DE RÉPONSE :
Utilisez un style professionnel de bilan de compétences avec :
- Des titres clairs et structurés
- Des analyses détaillées mais accessibles
- Des recommandations concrètes et réalisables
- Une approche positive et constructive
- Des exemples de métiers/secteurs correspondants

Limitez votre réponse à 2000 mots maximum.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'Vous êtes un conseiller en évolution professionnelle expert en bilans de compétences CAP.' },
          { role: 'user', content: analysisPrompt }
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

    return new Response(JSON.stringify({ analysis, sectionAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-cap-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la génération de l\'analyse',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});