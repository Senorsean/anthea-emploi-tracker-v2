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

    const prompt = `En tant qu'expert en développement professionnel et spécialiste du Golden Circle de Simon Sinek, analysez les réponses suivantes d'un professionnel qui cherche à clarifier sa raison d'être et son projet professionnel selon le modèle Why-How-What.

RÉPONSES DU PROFESSIONNEL :

WHY - RAISON D'ÊTRE :
- Raison d'être professionnelle : ${responses.raisonEtre}
- Valeurs principales : ${responses.valeursPrincipales}
- Impact souhaité : ${responses.impactSouhaite}
- Motivation profonde : ${responses.motivationProfonde}

HOW - FORCES ET MÉTHODES :
- Forces personnelles uniques : ${responses.forcesPersonnelles}
- Méthodes préférées : ${responses.methodesPreferees}
- Styles de travail : ${responses.stylesTravail}
- Compétences uniques : ${responses.competencesUniques}

WHAT - ACTIVITÉS CONCRÈTES :
- Activités passionnantes : ${responses.activitesConcrete}
- Secteurs cibles : ${responses.secteursCibles}
- Postes visés : ${responses.postesVises}
- Projets idéaux : ${responses.projetsIdeaux}

Fournissez une analyse complète structurée en 5 sections :

1. **WHY - RAISON D'ÊTRE CLARIFIÉE** : Synthétisez et clarifiez la raison d'être profonde de cette personne, ses valeurs centrales et l'impact qu'elle souhaite avoir. Formulez un "Why" inspirant et authentique.

2. **HOW - FORCES ET APPROCHE DISTINCTIVE** : Identifiez les forces uniques, le style de travail distinctif et les méthodes qui caractérisent cette personne. Comment se différencie-t-elle dans sa façon de faire ?

3. **WHAT - ACTIVITÉS ET DOMAINES D'EXPRESSION** : Précisez les activités concrètes, secteurs et types de postes qui permettront d'exprimer le Why à travers le How. Soyez spécifique et aligné.

4. **SYNTHÈSE ET COHÉRENCE** : Analysez la cohérence entre Why-How-What. Identifiez les points d'alignement et les éventuelles incohérences à résoudre.

5. **PLAN D'ACTION RECOMMANDÉ** : Proposez des étapes concrètes pour mettre en œuvre ce Golden Circle dans la vie professionnelle. Recommandations pour l'évolution de carrière.

Soyez inspirant mais réaliste, authentique et actionnable. Mettez l'accent sur l'unicité de cette personne et son potentiel d'impact.`;

    console.log('Sending request to OpenAI for Golden Circle analysis');

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
            content: 'Vous êtes un expert en développement professionnel et spécialiste du Golden Circle de Simon Sinek. Vous aidez les professionnels à clarifier leur raison d\'être et à aligner leur carrière avec leurs valeurs profondes.' 
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
      why: sections[1]?.replace(/^\s*WHY - RAISON D'ÊTRE CLARIFIÉE\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible',
      how: sections[2]?.replace(/^\s*HOW - FORCES ET APPROCHE DISTINCTIVE\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible',
      what: sections[3]?.replace(/^\s*WHAT - ACTIVITÉS ET DOMAINES D'EXPRESSION\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible',
      synthese: sections[4]?.replace(/^\s*SYNTHÈSE ET COHÉRENCE\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible',
      planAction: sections[5]?.replace(/^\s*PLAN D'ACTION RECOMMANDÉ\s*\*\*\s*:?\s*/i, '').trim() || 'Analyse non disponible'
    };

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-golden-circle-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la génération de l\'analyse Golden Circle',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});