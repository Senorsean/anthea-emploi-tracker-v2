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
    const { prototypes } = await req.json();

    const prompt = `Tu es un expert en Life Design et Design Thinking appliqué à la carrière, formé à l'approche de Stanford.

L'utilisateur a défini ${prototypes.length} prototype(s) de vie professionnelle possible(s) :

${prototypes.map((p: any, i: number) => `
### Prototype ${i + 1}: ${p.title}
**Description:** ${p.description}
${p.experiments ? `**Expériences envisagées:** ${p.experiments}` : ''}
`).join('\n')}

Ta mission :

1. **ANALYSE de chaque prototype** :
   - Points forts et attrait de cette vie
   - Défis potentiels et zones d'incertitude
   - Alignement avec les valeurs et aspirations exprimées

2. **PLAN D'EXPÉRIMENTATION** pour chaque prototype :
   - 3-5 expériences concrètes, LOW-RISK, à réaliser sur 3-6 mois
   - Pour chaque expérience : objectif, format, durée, critères de réussite
   - Priorisation : par quoi commencer ?

3. **CRITÈRES DE DÉCISION** :
   - Quels signaux observer pendant les expériences ?
   - Questions clés à se poser après chaque test
   - Comment savoir si un prototype mérite d'être approfondi ou abandonné ?

4. **PROCHAINES ÉTAPES** (dans les 30 prochains jours) :
   - Actions immédiates et concrètes
   - Personnes à rencontrer
   - Ressources à explorer

Adopte un ton encourageant, pragmatique et actionnable. L'objectif est de TESTER, pas de choisir immédiatement. Structure ta réponse de manière claire avec des titres et sous-titres.`;

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
            content: 'Tu es un expert en Life Design et Design Thinking appliqué à la carrière. Tu aides les personnes à prototyper différentes vies professionnelles possibles et à les tester par petites expériences.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-life-design-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
