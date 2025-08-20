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
    const { responses } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Tu es un expert en bilan de compétences certifié et spécialisé dans l'accompagnement professionnel en France et en Europe. Analyse les réponses suivantes et génère un bilan de compétences complet et personnalisé selon les standards européens.

RÉPONSES DU CANDIDAT :

COMPÉTENCES TECHNIQUES :
- Compétences techniques principales : ${responses.competencesTechniques}
- Domaines d'expertise : ${responses.domaines_expertise}
- Outils et logiciels : ${responses.outils_logiciels}
- Certifications : ${responses.certifications}

COMPÉTENCES TRANSVERSALES :
- Compétences relationnelles : ${responses.competencesRelationnelles}
- Compétences organisationnelles : ${responses.competencesOrganisationnelles}
- Compétences de leadership : ${responses.competencesLeadership}
- Compétences créatives : ${responses.competencesCreatives}

MOTIVATIONS ET VALEURS :
- Valeurs principales : ${responses.valeursPrincipales}
- Sources de satisfaction : ${responses.sourcesSatisfaction}
- Environnement de travail idéal : ${responses.environnementTravail}
- Équilibre vie pro/perso : ${responses.equilibreViePerso}

APTITUDES ET CENTRES D'INTÉRÊT :
- Activités stimulantes : ${responses.activitesStimulantes}
- Styles d'apprentissage : ${responses.stylesApprentissage}
- Défis motivants : ${responses.defisMotivants}
- Secteurs préférés : ${responses.secteursPreferes}

PROJET PROFESSIONNEL :
- Objectifs de carrière : ${responses.objectifsCarriere}
- Contraintes personnelles : ${responses.contraintesPersonnelles}
- Formations envisagées : ${responses.formationsEnvisagees}
- Horizon temporel : ${responses.horizonTemporel}

CONSIGNE :
Génère un bilan de compétences structuré selon les standards professionnels français/européens avec :

1. SYNTHÈSE DES COMPÉTENCES : Cartographie complète des compétences techniques et transversales, forces principales et axes de développement
2. PROFIL MOTIVATIONNEL : Analyse des valeurs, motivations profondes et facteurs de satisfaction professionnelle
3. RECOMMANDATIONS DE CARRIÈRE : Métiers et secteurs en adéquation avec le profil, opportunités d'évolution, postes cibles
4. PLAN DE FORMATION : Formations recommandées, certifications utiles, modalités de financement (CPF, etc.)
5. PROJET PROFESSIONNEL : Projet réaliste et réalisable, étapes de transition, accompagnement nécessaire
6. ÉTAPES DE MISE EN ŒUVRE : Plan d'action concret avec échéances, ressources mobilisables, indicateurs de suivi

Utilise un ton professionnel, structuré et bienveillant. Intègre les spécificités du marché du travail français/européen et les dispositifs de formation disponibles.

FORMAT DE RÉPONSE JSON :
{
  "syntheseCompetences": "Analyse détaillée des compétences...",
  "profilMotivationnel": "Profil des motivations et valeurs...",
  "recommandationsCarriere": "Recommandations de carrière...",
  "planFormation": "Plan de formation structuré...",
  "projetProfessionnel": "Projet professionnel détaillé...",
  "etapesMiseEnOeuvre": "Étapes concrètes de mise en œuvre..."
}`;

    console.log('Sending request to OpenAI...');

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
            content: 'Tu es un expert certifié en bilan de compétences avec une expertise approfondie du marché du travail français et européen. Tu produis des bilans structurés, réalistes et actionnables.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const analysisText = data.choices[0].message.content;
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', analysisText);
      throw new Error('Invalid JSON response from OpenAI');
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-skills-assessment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});