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
    const { currentSector, currentRole, interests, goals, experience } = await req.json();

    console.log('Generating sector analysis for:', { currentSector, currentRole });

    const prompt = `En tant qu'expert en veille stratégique et prospective métiers, analysez le profil suivant et fournissez une analyse détaillée et prospective en français.

PROFIL DU PROFESSIONNEL:
- Secteur d'activité: ${currentSector}
- Poste/Métier actuel: ${currentRole}
${experience ? `- Expérience: ${experience}` : ''}
${interests ? `- Domaines d'intérêt: ${interests}` : ''}
- Objectifs professionnels: ${goals}

Fournissez une analyse complète et prospective structurée en 5 sections:

1. ÉTAT DES LIEUX DU SECTEUR
   - Situation actuelle du secteur ${currentSector}
   - Principaux acteurs et dynamiques du marché
   - Chiffres clés et tendances récentes
   - Forces et faiblesses du secteur
   - Opportunités et menaces (contexte macro-économique)

2. ÉVOLUTIONS ET DISRUPTIONS EN COURS
   - Transformations majeures en cours (digitale, écologique, etc.)
   - Technologies disruptives impactant le secteur
   - Nouveaux modèles économiques émergents
   - Changements réglementaires et normatifs
   - Impact de l'IA et de l'automation
   - Horizon temporel de ces évolutions (court/moyen/long terme)

3. MÉTIERS ÉMERGENTS ET ÉVOLUTION DES RÔLES
   - Top 5-10 métiers émergents dans le secteur
   - Évolution des métiers traditionnels (dont ${currentRole})
   - Métiers en déclin ou en transformation profonde
   - Nouvelles spécialisations et niches porteuses
   - Passerelles possibles depuis ${currentRole}
   - Niveau de demande et perspectives d'emploi

4. COMPÉTENCES DU FUTUR
   - Top 10 compétences techniques incontournables
   - Compétences transversales (soft skills) essentielles
   - Compétences digitales et technologiques à maîtriser
   - Compétences liées au développement durable/RSE
   - Compétences spécifiques au secteur ${currentSector}
   - Obsolescence de certaines compétences actuelles
   - Priorisation selon l'horizon temporel (immédiat/2-5 ans/5+ ans)

5. PLAN D'ACTION PERSONNALISÉ
   - Recommandations adaptées au profil et aux objectifs
   - Formations et certifications prioritaires
   - Ressources pour la veille (médias, newsletters, événements)
   - Réseaux professionnels et communautés à rejoindre
   - Expériences à acquérir pour rester compétitif
   - Outils et plateformes de veille recommandés
   - Actions immédiates (0-6 mois)
   - Stratégie moyen terme (6-24 mois)

Soyez factuel, précis et prospectif. Citez des sources ou tendances identifiables quand c'est possible. Adaptez vos recommandations au niveau d'expérience et aux objectifs spécifiques du professionnel.`;

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
            content: 'Vous êtes un expert en veille stratégique, prospective métiers et analyse sectorielle. Vous fournissez des analyses détaillées, factuelles et prospectives basées sur les dernières tendances du marché du travail et les évolutions technologiques et sociétales.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response received');

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Failed to generate analysis');
    }

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-sector-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
