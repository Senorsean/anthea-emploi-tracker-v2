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
    const { currentRole, experience, teamSize, challenges, leadershipStyle, goals } = await req.json();

    console.log('Generating leadership analysis for:', { currentRole, leadershipStyle });

    const prompt = `En tant qu'expert en leadership et développement managérial, analysez le profil suivant et fournissez une analyse détaillée et personnalisée en français.

PROFIL DU CANDIDAT:
- Rôle actuel: ${currentRole}
- Expérience professionnelle et managériale: ${experience}
${teamSize ? `- Taille d'équipe: ${teamSize}` : ''}
${challenges ? `- Défis managériaux: ${challenges}` : ''}
${leadershipStyle ? `- Style de leadership: ${leadershipStyle}` : ''}
- Objectifs de développement: ${goals}

Fournissez une analyse complète structurée en 5 sections:

1. ÉVALUATION DU STYLE DE LEADERSHIP
   - Identifiez et analysez le style de leadership actuel ou potentiel
   - Points forts naturels en tant que leader
   - Traits de personnalité favorables au leadership
   - Axes d'amélioration pour le style identifié

2. COMPÉTENCES MANAGÉRIALES ACTUELLES
   - Compétences démontrées ou développées
   - Compétences transférables du parcours actuel
   - Niveau de maturité managériale
   - Expériences significatives à valoriser

3. COMPÉTENCES À DÉVELOPPER
   - Top 5 des compétences managériales prioritaires
   - Pour chaque compétence:
     * Pourquoi elle est importante
     * Comment la développer concrètement
     * Ressources et formations recommandées
   - Compétences techniques spécifiques au domaine

4. PLAN DE TRANSITION VERS LE MANAGEMENT
   - Étapes clés de la progression
   - Jalons et objectifs intermédiaires
   - Actions concrètes à court terme (0-6 mois)
   - Actions à moyen terme (6-18 mois)
   - Opportunités à saisir
   - Pièges à éviter

5. RECOMMANDATIONS PERSONNALISÉES
   - Formations et certifications pertinentes
   - Lectures et ressources recommandées
   - Réseautage et mentorat
   - Expériences à acquérir
   - Prochaines étapes concrètes

Soyez précis, pratique et constructif. Adaptez vos recommandations au niveau d'expérience et aux objectifs spécifiques du candidat.`;

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
            content: 'Vous êtes un expert en leadership et développement managérial. Vous fournissez des analyses détaillées, pratiques et personnalisées pour aider les professionnels à développer leurs compétences en leadership et management.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
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
    console.error('Error in generate-leadership-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
