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
    const { profession, difficultyLevel = 3 } = await req.json();

    if (!profession) {
      return new Response(
        JSON.stringify({ error: 'Le métier est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const difficultyLabels = {
      1: "Connaisseur",
      2: "Confirmé", 
      3: "Expérimenté",
      4: "Avancé",
      5: "Expert"
    };

    console.log(`Génération de quiz pour le métier: ${profession} - Niveau: ${difficultyLabels[difficultyLevel as keyof typeof difficultyLabels]}`);

    const prompt = `Tu es un expert en recrutement et formation professionnelle. Génère exactement 20 questions à choix multiples pour tester les connaissances d'une personne sur le métier de "${profession}" au niveau ${difficultyLabels[difficultyLevel as keyof typeof difficultyLabels]} (${difficultyLevel}/5).

Adapte la complexité des questions selon le niveau demandé :
- Niveau 1 (Connaisseur) : Questions de base, concepts fondamentaux
- Niveau 2 (Confirmé) : Questions intermédiaires, applications pratiques courantes
- Niveau 3 (Expérimenté) : Questions approfondies, cas d'usage variés
- Niveau 4 (Avancé) : Questions complexes, expertise technique poussée
- Niveau 5 (Expert) : Questions très spécialisées, situations critiques et innovations

Les questions doivent être organisées de la plus généraliste à la plus spécifique :
- Questions 1-5: Connaissances générales sur le secteur d'activité (adaptées au niveau)
- Questions 6-10: Compétences de base du métier (adaptées au niveau)
- Questions 11-15: Compétences techniques spécifiques (adaptées au niveau)
- Questions 16-20: Situations complexes et expertise (adaptées au niveau)

Inclus environ 4-5 questions à choix multiples (plusieurs bonnes réponses possibles) réparties dans les différentes catégories.

Pour chaque question, fournis :
- La question
- 4 options de réponse (A, B, C, D)
- Pour une question simple : L'index de la bonne réponse (0, 1, 2, ou 3)
- Pour une question à choix multiples : Un tableau des indexes des bonnes réponses (ex: [0, 2])
- Un booléen "isMultipleChoice" (true pour choix multiples, false pour choix simple)
- Une explication détaillée des bonnes réponses
- Une catégorie (ex: "Connaissances générales", "Compétences techniques", etc.)

Réponds UNIQUEMENT avec un JSON valide dans ce format exact :
{
  "questions": [
    {
      "question": "Texte de la question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "correctAnswers": [0],
      "isMultipleChoice": false,
      "explanation": "Explication détaillée",
      "category": "Nom de la catégorie"
    },
    {
      "question": "Question à choix multiples",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": null,
      "correctAnswers": [0, 2],
      "isMultipleChoice": true,
      "explanation": "Explication des bonnes réponses",
      "category": "Nom de la catégorie"
    }
  ]
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
            content: 'Tu es un expert en évaluation professionnelle. Tu génères uniquement du JSON valide.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('Erreur OpenAI:', response.status, response.statusText);
      throw new Error(`Erreur OpenAI: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse OpenAI reçue');

    let generatedContent = data.choices[0].message.content;
    console.log('Contenu généré:', generatedContent.substring(0, 200) + '...');

    // Nettoyer le contenu si nécessaire
    generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let quizData;
    try {
      quizData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      console.error('Contenu à parser:', generatedContent);
      throw new Error('Format de réponse invalide de l\'IA');
    }

    // Valider la structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Structure de quiz invalide');
    }

    // Ajouter des IDs aux questions
    const questionsWithIds = quizData.questions.map((q: any, index: number) => ({
      id: index + 1,
      ...q
    }));

    console.log(`Quiz généré avec ${questionsWithIds.length} questions`);

    return new Response(
      JSON.stringify({ 
        questions: questionsWithIds,
        profession: profession 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur dans generate-profession-quiz:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de la génération du quiz' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});