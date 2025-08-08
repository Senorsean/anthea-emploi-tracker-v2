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
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { jobOffer, companyInfo, cvInfo } = await req.json();

    const prompt = `En tant qu'expert en recrutement, générez 8 questions d'entretien personnalisées et réalistes basées sur les informations suivantes :

OFFRE D'EMPLOI :
${jobOffer || "Non fournie"}

PRÉSENTATION DE L'ENTREPRISE :
${companyInfo || "Non fournie"}

INFORMATIONS DU CV :
${cvInfo || "Non fournies"}

Générez exactement 8 questions d'entretien variées qui correspondent au poste et à l'entreprise. Incluez :
- Des questions sur la motivation pour ce poste spécifique
- Des questions techniques adaptées au poste
- Des questions sur l'entreprise et sa culture
- Des questions comportementales
- Des questions sur l'expérience passée en lien avec le poste

Pour chaque question, fournissez :
- La question elle-même
- Une catégorie (Motivation, Compétences, Entreprise, Technique, Comportementale, Expérience, Leadership, Gestion du stress)
- Des conseils pour bien répondre
- Le niveau de difficulté (Facile, Moyen, Difficile)

Répondez uniquement avec un objet JSON valide contenant un array "questions" :
{
  "questions": [
    {
      "id": 1,
      "category": "Motivation",
      "question": "Pourquoi ce poste vous intéresse-t-il particulièrement ?",
      "tips": "Montrez votre connaissance du poste et de l'entreprise",
      "difficulty": "Moyen"
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
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en recrutement qui génère des questions d\'entretien personnalisées et réalistes. Réponds UNIQUEMENT avec un JSON valide, sans markdown ni formatage supplémentaire.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    let questionsData;
    try {
      questionsData = JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, return a structured error
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify(questionsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-interview-questions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Une erreur est survenue lors de la génération des questions'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});