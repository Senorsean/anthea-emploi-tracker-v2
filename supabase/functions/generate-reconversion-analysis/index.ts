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
    const { currentJob, experience, skills, interests, constraints, targetSector } = await req.json();

    console.log('Generating reconversion analysis for:', { currentJob, experience });

    const systemPrompt = `Tu es un expert en reconversion professionnelle et en orientation de carrière. Tu vas analyser le profil d'une personne qui envisage une reconversion et lui fournir une analyse détaillée incluant:

1. ÉVALUATION DE LA FAISABILITÉ
   - Points forts pour la reconversion (compétences transférables, expérience pertinente)
   - Défis potentiels à anticiper
   - Niveau de faisabilité (facile, modéré, difficile) avec justification

2. MÉTIERS ACCESSIBLES
   - Liste de 5-8 métiers concrets accessibles selon le profil
   - Pour chaque métier: description, compétences requises, formations/certifications nécessaires
   - Niveau de correspondance avec le profil (excellent, bon, moyen)

3. PLAN DE TRANSITION
   - Étapes concrètes pour réussir la reconversion (chronologie sur 6-18 mois)
   - Formations recommandées (MOOCs, certifications, formations diplômantes)
   - Actions immédiates à entreprendre (networking, bénévolat, projets personnels)
   - Budget estimé et aides financières disponibles (CPF, Pôle Emploi, etc.)

4. RECOMMANDATIONS PERSONNALISÉES
   - Conseils spécifiques selon le profil
   - Ressources utiles (sites, associations, réseaux professionnels)
   - Points de vigilance

Ton analyse doit être:
- Pragmatique et réaliste
- Encourageante sans être irréaliste
- Concrète avec des actions précises
- Structurée en sections claires avec des titres en MAJUSCULES
- Personnalisée selon le profil fourni

Format: Texte structuré en français avec des paragraphes et des listes à puces.`;

    const userPrompt = `Profil de reconversion:

POSTE/MÉTIER ACTUEL:
${currentJob}

EXPÉRIENCE ET PARCOURS:
${experience}

COMPÉTENCES TRANSFÉRABLES:
${skills}

${interests ? `CENTRES D'INTÉRÊT ET ASPIRATIONS:\n${interests}\n\n` : ''}
${constraints ? `CONTRAINTES ET CRITÈRES:\n${constraints}\n\n` : ''}
${targetSector ? `SECTEUR(S) ENVISAGÉ(S):\n${targetSector}\n\n` : ''}

Merci de fournir une analyse complète de reconversion professionnelle pour ce profil.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Reconversion analysis generated successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-reconversion-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
