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

Le questionnaire IRMR3 comprend 98 questions réparties en 12 catégories d'intérêts spécifiques qui affinent l'analyse des intérêts professionnels pour permettre un accompagnement plus personnalisé.

Analyse les réponses suivantes d'un candidat qui a évalué ses intérêts sur 12 domaines (échelle 1-5) :

ÉVALUATIONS DES DOMAINES :
- Plein air (activités extérieures, nature, environnement) : ${responses.pleinAir}/5
- Pratiques (travail manuel, construction, réparation) : ${responses.pratiques}/5
- Techniques (technologie, mécanique, systèmes techniques) : ${responses.techniques}/5
- Scientifiques (recherche, expérimentation, analyse scientifique) : ${responses.scientifiques}/5
- Médicaux (santé, soins, bien-être) : ${responses.medicaux}/5
- Musicaux (musique, rythme, expression sonore) : ${responses.musicaux}/5
- Esthétiques (arts visuels, design, créativité esthétique) : ${responses.esthetiques}/5
- Littéraires (écriture, lecture, expression écrite) : ${responses.litteraires}/5
- Service social (aide sociale, accompagnement, service communauté) : ${responses.serviceSocial}/5
- Contacts personnels (relations interpersonnelles, communication) : ${responses.contactsPersonnels}/5
- Gestion (organisation, planification, administration) : ${responses.gestion}/5
- Bureau (travail administratif, tâches de bureau) : ${responses.bureau}/5

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
`;
    
    console.log('Envoi de la requête à OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + openAIApiKey,
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
      throw new Error('Erreur OpenAI: ' + response.status);
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