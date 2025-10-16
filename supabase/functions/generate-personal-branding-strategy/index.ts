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
    const { formData } = await req.json();

    const prompt = `Tu es un expert en personal branding digital et stratégie de contenu professionnel.

PROFIL DE L'UTILISATEUR :
- Rôle actuel : ${formData.currentRole}
- Rôle visé : ${formData.targetRole}
- Expertise / spécialisation : ${formData.expertise}

PRÉSENCE DIGITALE ACTUELLE :
${formData.cvSummary ? `CV actuel :\n${formData.cvSummary}\n` : ''}
${formData.linkedinProfile ? `LinkedIn actuel :\n${formData.linkedinProfile}\n` : ''}
${formData.hasPortfolio ? `Portfolio existant : ${formData.portfolioUrl || 'Oui, mais URL non fournie'}\n` : 'Pas encore de portfolio\n'}

OBJECTIFS :
${formData.contentGoals ? `Objectifs de contenu : ${formData.contentGoals}\n` : ''}
${formData.targetAudience ? `Audience cible : ${formData.targetAudience}\n` : ''}

Ta mission est de créer une stratégie complète de personal branding digital :

1. **ANALYSE DE COHÉRENCE CV / LINKEDIN / PORTFOLIO** :
   - Identifier les incohérences ou divergences entre les supports
   - Points à harmoniser (titre, mots-clés, message, positionnement)
   - Recommandations pour créer une identité digitale cohérente

2. **OPTIMISATION DE CHAQUE SUPPORT** :
   
   **CV :**
   - Titre professionnel percutant aligné avec l'objectif
   - Mots-clés à mettre en avant
   - Structuration recommandée
   
   **LinkedIn :**
   - Titre LinkedIn optimisé (120 caractères max)
   - Section À propos : structure et points clés à inclure
   - Mots-clés pour la visibilité
   - Photo et bannière : recommandations
   
   **Portfolio (à créer ou améliorer) :**
   - Plateforme recommandée (site perso, GitHub, Behance, etc.)
   - Sections essentielles à inclure
   - Projets à mettre en avant
   - Structure et navigation

3. **STRATÉGIE DE CONTENU PROFESSIONNEL** :
   - Thèmes de contenu alignés avec l'expertise
   - Fréquence de publication recommandée
   - Formats de contenu (posts, articles, vidéos, etc.)
   - Calendrier type sur 1 mois
   - Exemples de sujets de posts LinkedIn (5-7 idées concrètes)

4. **PLAN D'ACTION SUR 30 JOURS** :
   - Semaine 1 : Actions prioritaires
   - Semaine 2 : Optimisations
   - Semaine 3 : Création de contenu
   - Semaine 4 : Engagement et networking

5. **BONNES PRATIQUES & PIÈGES À ÉVITER** :
   - Do's and Don'ts du personal branding
   - Comment rester authentique
   - Gestion du temps et de l'énergie

Sois très concret, actionnable et spécifique au profil de l'utilisateur. Structure ta réponse de manière claire avec des titres et sous-titres. Donne des exemples précis et personnalisés.`;

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
            content: 'Tu es un expert en personal branding digital, stratégie de contenu professionnel et optimisation de présence en ligne. Tu aides les professionnels à construire une marque personnelle forte et cohérente sur tous leurs supports digitaux.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();
    const strategy = data.choices[0].message.content;

    return new Response(JSON.stringify({ strategy }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-personal-branding-strategy function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
