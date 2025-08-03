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
    const { profession, score, totalQuestions, incorrectQuestions } = await req.json();

    if (!profession || score === undefined || !totalQuestions) {
      return new Response(
        JSON.stringify({ error: 'Données incomplètes pour l\'analyse' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Génération d'analyse pour ${profession}: ${score}/${totalQuestions}`);

    const percentage = (score / totalQuestions) * 100;
    const incorrectQuestionsText = incorrectQuestions?.length > 0 
      ? incorrectQuestions.map((q: any) => `- ${q.question} (${q.category})`).join('\n')
      : 'Aucune question incorrecte';

    const prompt = `Tu es un expert en recrutement et formation professionnelle. Analyse les résultats de ce test de connaissances professionnel :

**Métier testé :** ${profession}
**Score obtenu :** ${score}/${totalQuestions} (${percentage.toFixed(1)}%)

**Questions incorrectes :**
${incorrectQuestionsText}

Génère un compte-rendu personnalisé pour préparer un entretien de recrutement dans ce métier. Le compte-rendu doit inclure :

1. **Évaluation globale** : Analyse du niveau de préparation actuel
2. **Points forts** : Ce qui est déjà maîtrisé
3. **Axes d'amélioration** : Connaissances spécifiques à revoir (basées sur les erreurs)
4. **Plan d'action** : 5-7 recommandations concrètes pour se préparer
5. **Ressources** : Types de formations/lectures recommandées
6. **Questions types** : 3-4 questions d'entretien probables sur les points faibles détectés

Sois précis, constructif et axé sur la préparation à l'entretien. Le ton doit être encourageant mais réaliste.

Réponds UNIQUEMENT avec un JSON valide dans ce format :
{
  "evaluationGlobale": "Texte d'évaluation",
  "pointsForts": ["Point fort 1", "Point fort 2", "..."],
  "axesAmelioration": ["Axe 1", "Axe 2", "..."],
  "planAction": ["Action 1", "Action 2", "..."],
  "ressources": ["Ressource 1", "Ressource 2", "..."],
  "questionsTypes": ["Question 1", "Question 2", "..."]
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
          { 
            role: 'system', 
            content: 'Tu es un expert en recrutement qui aide les candidats à se préparer aux entretiens. Tu génères uniquement du JSON valide.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('Erreur OpenAI:', response.status, response.statusText);
      throw new Error(`Erreur OpenAI: ${response.status}`);
    }

    const data = await response.json();
    console.log('Analyse généré avec succès');

    let generatedContent = data.choices[0].message.content;
    
    // Nettoyer le contenu si nécessaire
    generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let analysisData;
    try {
      analysisData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      console.error('Contenu à parser:', generatedContent);
      throw new Error('Format de réponse invalide de l\'IA');
    }

    // Valider la structure
    const requiredFields = ['evaluationGlobale', 'pointsForts', 'axesAmelioration', 'planAction', 'ressources', 'questionsTypes'];
    for (const field of requiredFields) {
      if (!analysisData[field]) {
        throw new Error(`Champ manquant dans l'analyse: ${field}`);
      }
    }

    console.log('Compte-rendu généré avec succès');

    return new Response(
      JSON.stringify({ 
        ...analysisData,
        profession: profession,
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage.toFixed(1)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur dans generate-quiz-report:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de la génération du compte-rendu' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});