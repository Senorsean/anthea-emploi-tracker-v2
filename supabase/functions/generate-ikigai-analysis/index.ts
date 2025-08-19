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
    const { formData } = await req.json();
    
    if (!formData) {
      return new Response(
        JSON.stringify({ error: 'Données du formulaire manquantes' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = `Tu es un expert en développement personnel et en coaching de carrière, spécialisé dans l'analyse IKIGAÏ. 

Analyse les réponses suivantes et génère un rapport IKIGAÏ personnalisé :

RÉPONSES DU CANDIDAT :
- Ce que j'aime (Passions) : ${formData.passions}
- Ce pour quoi je suis doué (Talents) : ${formData.talents}  
- Ce dont le monde a besoin : ${formData.needsWorld}
- Ce pour quoi je peux être payé : ${formData.values}
- Poste actuel : ${formData.currentRole || 'Non spécifié'}
- Expérience : ${formData.experience || 'Non spécifiée'}

INSTRUCTIONS POUR L'ANALYSE :
1. Calcule un score IKIGAÏ global (0-100) basé sur l'alignement entre les 4 cercles
2. Analyse l'alignement passion-mission-profession-vocation
3. Identifie les recommandations de carrière concrètes
4. Propose un plan de développement personnalisé
5. Suggère des prochaines étapes actionables
6. Formule des questions de réflexion approfondies

STRUCTURE DE RÉPONSE OBLIGATOIRE (JSON) :
{
  "ikigai_score": [score numérique entre 0 et 100],
  "passion_alignment": "[analyse de l'alignement entre passions et opportunités]",
  "mission_clarity": "[évaluation de la clarté de la mission de vie]",
  "profession_recommendations": ["métier 1", "métier 2", "métier 3", "métier 4", "métier 5"],
  "development_plan": "[plan de développement personnalisé et concret]",
  "next_steps": ["étape 1", "étape 2", "étape 3", "étape 4"],
  "reflection_questions": ["question 1", "question 2", "question 3", "question 4"]
}

CRITÈRES D'ÉVALUATION DU SCORE :
- 90-100 : Alignement exceptionnel entre les 4 cercles
- 80-89 : Très bon alignement avec quelques ajustements mineurs
- 70-79 : Bon alignement général avec des améliorations identifiées
- 60-69 : Alignement modéré nécessitant des changements
- 50-59 : Faible alignement avec besoin de réorientation
- 0-49 : Désalignement important nécessitant une réflexion profonde

EXIGENCES QUALITÉ :
- Sois précis et personnalisé dans tes recommandations
- Base-toi sur les réponses réelles du candidat
- Propose des métiers concrets et réalistes
- Donne des étapes actionables et mesurables
- Formule des questions introspectives puissantes
- Maintiens un ton bienveillant et motivant

Réponds UNIQUEMENT en JSON valide, sans texte additionnel.`;

    console.log('Appel à l\'API OpenAI pour l\'analyse IKIGAÏ...');
    
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
            content: 'Tu es un expert en coaching de carrière et en analyse IKIGAÏ. Tu dois répondre uniquement en JSON valide selon le format demandé.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur API OpenAI:', response.status, errorData);
      throw new Error(`Erreur API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse OpenAI reçue');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Réponse invalide de l\'API OpenAI');
    }

    let analysisResult;
    try {
      // Nettoyer la réponse et extraire le JSON
      let content = data.choices[0].message.content.trim();
      
      // Supprimer les backticks et "json" si présents
      content = content.replace(/^```json\n?/, '').replace(/```$/, '');
      content = content.replace(/^```\n?/, '').replace(/```$/, '');
      
      analysisResult = JSON.parse(content);
      
      // Validation des champs obligatoires
      const requiredFields = ['ikigai_score', 'passion_alignment', 'mission_clarity', 'profession_recommendations', 'development_plan', 'next_steps', 'reflection_questions'];
      for (const field of requiredFields) {
        if (!(field in analysisResult)) {
          throw new Error(`Champ manquant: ${field}`);
        }
      }
      
      // Validation des types
      if (typeof analysisResult.ikigai_score !== 'number' || 
          analysisResult.ikigai_score < 0 || 
          analysisResult.ikigai_score > 100) {
        throw new Error('Score IKIGAÏ invalide');
      }
      
      if (!Array.isArray(analysisResult.profession_recommendations) || 
          !Array.isArray(analysisResult.next_steps) || 
          !Array.isArray(analysisResult.reflection_questions)) {
        throw new Error('Format de tableau invalide');
      }
      
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      console.error('Contenu reçu:', data.choices[0].message.content);
      
      // Fallback avec une réponse par défaut
      analysisResult = {
        ikigai_score: 50,
        passion_alignment: "Une analyse plus approfondie est nécessaire pour évaluer pleinement l'alignement entre vos passions et vos opportunités professionnelles.",
        mission_clarity: "Votre mission semble en cours de définition. Il serait bénéfique d'explorer davantage vos valeurs et objectifs.",
        profession_recommendations: ["Consultant", "Coach", "Formateur", "Entrepreneur", "Gestionnaire de projet"],
        development_plan: "Concentrez-vous sur l'identification de vos forces uniques et explorez comment les aligner avec les besoins du marché.",
        next_steps: [
          "Effectuer une auto-évaluation approfondie de vos compétences",
          "Rechercher des opportunités de networking dans vos domaines d'intérêt",
          "Considérer une formation complémentaire",
          "Expérimenter avec des projets parallèles"
        ],
        reflection_questions: [
          "Qu'est-ce qui vous fait vous sentir le plus accompli dans votre travail ?",
          "Comment pourriez-vous mieux aligner vos valeurs avec votre carrière ?",
          "Quels obstacles vous empêchent d'atteindre votre plein potentiel ?",
          "Comment votre travail idéal contribuerait-il au bien-être des autres ?"
        ]
      };
    }

    console.log('Analyse IKIGAÏ générée avec succès');
    
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans generate-ikigai-analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de la génération de l\'analyse IKIGAÏ',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});