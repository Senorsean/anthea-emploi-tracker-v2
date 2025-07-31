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

    const { formData } = await req.json();

    const prompt = `En tant qu'expert en développement de carrière et en formation professionnelle, analysez les informations suivantes et générez un rapport détaillé de montée en compétences :

Profil actuel:
- Titre de poste actuel: ${formData.currentJobTitle}
- Années d'expérience: ${formData.experience}
- Gestion d'équipe: ${formData.teamSize}
- Portée du rôle: ${formData.scope}
- Industrie actuelle: ${formData.currentIndustry}
- Localisation: ${formData.city}, ${formData.country}

Objectif de carrière:
- Titre de poste cible: ${formData.targetJobTitle}
- Secteur/industrie cible: ${formData.targetIndustry}

Générez un rapport structuré en français contenant:

1. **Analyse de l'écart de compétences** : Identifiez les compétences manquantes entre le poste actuel et le poste cible, en tenant compte de l'industrie et du niveau de responsabilité.

2. **Plan de formation recommandé** : Proposez un plan de formation personnalisé avec :
   - Compétences techniques prioritaires à développer
   - Compétences transversales (soft skills) importantes
   - Certifications professionnelles recommandées
   - Formations courtes (quelques jours à quelques semaines)
   - Formations longues (plusieurs mois)

3. **Ressources d'apprentissage** : Suggérez des plateformes, cours en ligne, livres, et autres ressources pertinentes.

4. **Timeline suggérée** : Proposez un calendrier réaliste pour acquérir ces compétences (court, moyen, long terme).

5. **Recommandations pratiques** : Conseils pour mettre en pratique les nouvelles compétences (projets, bénévolat, stages, etc.).

Répondez uniquement avec un objet JSON valide contenant ces sections:
{
  "skillsGap": ["compétence1", "compétence2", ...],
  "technicalSkills": ["compétence technique 1", "compétence technique 2", ...],
  "softSkills": ["soft skill 1", "soft skill 2", ...],
  "certifications": ["certification 1", "certification 2", ...],
  "shortTermTraining": ["formation courte 1", "formation courte 2", ...],
  "longTermTraining": ["formation longue 1", "formation longue 2", ...],
  "learningResources": [
    {"type": "Plateforme en ligne", "name": "Nom", "description": "Description"},
    {"type": "Livre", "name": "Titre", "description": "Description"}
  ],
  "timeline": {
    "immediate": ["action immédiate 1", "action immédiate 2"],
    "shortTerm": ["action 3-6 mois"],
    "longTerm": ["action 6-12 mois+"]
  },
  "practicalRecommendations": ["recommandation 1", "recommandation 2", ...],
  "summary": "Résumé exécutif du plan de développement"
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
            content: 'Tu es un expert en développement de carrière et en formation professionnelle. Tu génères des rapports de montée en compétences détaillés et personnalisés en français. Réponds toujours avec un JSON valide.'
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
    const content = data.choices[0].message.content;

    // Parse the JSON response
    let reportData;
    try {
      reportData = JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, return a structured error
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-skills-report function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Une erreur est survenue lors de la génération du rapport'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});