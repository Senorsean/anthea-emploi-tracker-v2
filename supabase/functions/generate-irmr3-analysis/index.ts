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

    const prompt = `Tu es un expert en orientation professionnelle spécialisé dans l'IRMR3 (Inventaire des Intérêts Professionnels). 

Analyse les réponses suivantes d'un candidat qui a évalué ses intérêts sur 7 domaines (échelle 1-5) :

ÉVALUATIONS DES DOMAINES :
- Artistique (créativité, expression, innovation) : ${responses.artistique}/5
- Contact (relations interpersonnelles, communication) : ${responses.contact}/5  
- Entreprise (leadership, développement d'affaires) : ${responses.entreprise}/5
- Gestion (organisation, planification, administration) : ${responses.gestion}/5
- Manuel (travail concret, manipulation d'outils) : ${responses.manuel}/5
- Sciences (recherche, analyse, investigation) : ${responses.sciences}/5
- Social (aide aux autres, éducation, service communauté) : ${responses.social}/5

INFORMATIONS COMPLÉMENTAIRES :
Expérience : ${responses.experience}
Motivations : ${responses.motivations}
Objectifs : ${responses.objectifs}

Fournis une analyse complète structurée ainsi :

## VOS DOMAINES D'INTÉRÊT DOMINANTS
[Identifie les 2-3 domaines avec les scores les plus élevés et explique ce que cela révèle]

## PROFIL DÉTAILLÉ IRMR3
[Pour chaque domaine, commente le score et ce qu'il indique sur les préférences professionnelles]

## MÉTIERS ET SECTEURS RECOMMANDÉS
[Propose des familles de métiers alignées avec les domaines dominants, en tenant compte de l'expérience]

## PLAN D'ACTION PERSONNALISÉ
[Suggestions concrètes : formations à explorer, secteurs à investiguer, compétences à développer]

## COHÉRENCE AVEC VOS ASPIRATIONS
[Analyse la cohérence entre les scores IRMR3, les motivations exprimées et les objectifs professionnels]

Utilise un ton professionnel mais accessible, sois précis et actionnable dans tes recommandations.
N'utilise AUCUN émoji dans ta réponse, uniquement du texte.

    console.log('Envoi de la requête à OpenAI...');
    
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
            content: 'Tu es un expert en orientation professionnelle spécialisé dans les tests psychométriques et l\'analyse des intérêts professionnels. Tu maîtrises parfaitement l\'IRMR3 et ses applications pratiques.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Erreur OpenAI:', response.status, response.statusText);
      throw new Error(`Erreur OpenAI: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse OpenAI reçue avec succès');
    
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur dans generate-irmr3-analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});