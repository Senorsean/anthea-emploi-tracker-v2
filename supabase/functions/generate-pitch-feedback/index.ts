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
    const { pitches } = await req.json();

    const prompt = `Tu es un expert en communication professionnelle et en coaching de présentation. Tu es spécialisé dans l'accompagnement de personnes pour créer des elevator pitchs percutants.

L'utilisateur a rédigé ${pitches.length} version(s) de son pitch de présentation :

${pitches.map((p: any) => `
### Pitch de ${p.duration}
**Nombre de mots :** ${p.wordCount}
**Contenu :**
${p.content}
`).join('\n')}

Ta mission est de fournir un feedback constructif et actionnable :

1. **ANALYSE DE CHAQUE PITCH** :
   - Structure : l'enchaînement est-il logique et fluide ?
   - Clarté : le message est-il clair et compréhensible ?
   - Impact : les points forts sont-ils bien mis en avant ?
   - Longueur : le nombre de mots est-il adapté à la durée ?

2. **STORYTELLING & TECHNIQUES** :
   - Présence d'une accroche captivante
   - Utilisation d'exemples concrets ou de chiffres
   - Authenticité et personnalisation
   - Structure (problème-solution, STAR, etc.)
   - Appel à l'action ou conclusion claire

3. **POINTS FORTS** :
   - Qu'est-ce qui fonctionne bien dans ces pitchs ?
   - Quels éléments sont percutants ?

4. **AXES D'AMÉLIORATION** :
   - Que peut-on renforcer ?
   - Quels éléments manquent ou sont à développer ?
   - Suggestions de formulations alternatives

5. **CONSEILS PRATIQUES** :
   - Comment mémoriser et pratiquer ces pitchs ?
   - Adaptations selon le contexte (networking, entretien, présentation formelle)
   - Langage corporel et intonation à travailler

6. **VERSIONS AMÉLIORÉES** (si pertinent) :
   - Propose 1-2 reformulations améliorées pour les pitchs qui en ont besoin

Adopte un ton encourageant et constructif. Sois spécifique dans tes recommandations. Structure ta réponse de manière claire avec des titres et sous-titres.`;

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
            content: 'Tu es un expert en communication professionnelle et en coaching de présentation. Tu aides les personnes à créer des pitchs de présentation percutants en leur donnant un feedback constructif et actionnable.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-pitch-feedback function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
