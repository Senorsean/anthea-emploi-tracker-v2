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

    const prompt = `Tu es un expert en rémunération et ressources humaines. Analyse les informations suivantes et génère un rapport salarial détaillé en français :

Informations du candidat :
- Titre de poste : ${formData.jobTitle}
- Années d'expérience : ${formData.experience}
- Gestion d'équipe : ${formData.teamSize}
- Portée : ${formData.scope}
- Industrie : ${formData.industry}
- Pays : ${formData.country}
- Ville : ${formData.city}
- Mode de travail : ${formData.workMode}

Génère un rapport avec les éléments suivants :
1. Fourchette salariale (minimum, médiane, maximum) en euros annuels bruts
2. Croissance salariale projetée sur 2 ans (pourcentage et montant)
3. Position sur le marché (percentile)
4. Comparaisons régionales
5. Facteurs influençant le salaire
6. Recommandations pour négociation

Réponds uniquement avec un objet JSON valide dans ce format exact :
{
  "salaryRange": {
    "min": 45000,
    "median": 55000,
    "max": 65000
  },
  "projectedGrowth": {
    "percentage": 12,
    "amount": 6600,
    "projected": 61600
  },
  "marketPosition": {
    "percentile": 65,
    "description": "Au-dessus de la médiane du marché"
  },
  "regionalComparison": {
    "description": "Votre localisation offre des opportunités compétitives..."
  },
  "factors": [
    "Facteur 1 qui influence le salaire",
    "Facteur 2",
    "etc."
  ],
  "recommendations": [
    "Recommandation 1 pour négociation",
    "Recommandation 2",
    "etc."
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
            content: 'Tu es un expert en rémunération qui génère des rapports salariaux précis basés sur les données du marché français. Réponds toujours avec un JSON valide uniquement.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let salaryReport;
    try {
      salaryReport = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', generatedContent);
      throw new Error('Invalid JSON response from OpenAI');
    }

    return new Response(JSON.stringify(salaryReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-salary-report function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Une erreur est survenue lors de la génération du rapport' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});