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
    const { dimensions } = await req.json();

    const totalScore = dimensions.reduce((sum: number, d: any) => sum + d.value, 0);
    const averageScore = (totalScore / dimensions.length).toFixed(1);
    
    const lowScores = dimensions.filter((d: any) => d.value <= 4).sort((a: any, b: any) => a.value - b.value);
    const highScores = dimensions.filter((d: any) => d.value >= 8).sort((a: any, b: any) => b.value - a.value);

    const prompt = `Tu es un expert en coaching professionnel et développement de carrière.

L'utilisateur a évalué sa vie professionnelle sur 8 dimensions avec les résultats suivants :

${dimensions.map((d: any) => `- **${d.name}** : ${d.value}/10 - ${d.description}`).join('\n')}

**Score moyen : ${averageScore}/10**

${lowScores.length > 0 ? `**Dimensions les plus faibles :** ${lowScores.map((d: any) => `${d.name} (${d.value}/10)`).join(', ')}` : ''}
${highScores.length > 0 ? `**Dimensions les plus fortes :** ${highScores.map((d: any) => `${d.name} (${d.value}/10)`).join(', ')}` : ''}

Ta mission :

1. **ANALYSE DE LA ROUE** :
   - Observation générale de l'équilibre professionnel
   - Identification des déséquilibres majeurs
   - Points forts à capitaliser

2. **ZONES À RÉÉQUILIBRER** (focus sur les 2-3 dimensions les plus faibles) :
   - Pourquoi ces dimensions sont-elles importantes ?
   - Impact sur le bien-être et la performance
   - Causes possibles des scores faibles

3. **PLAN D'ACTION CONCRET** :
   - Pour chaque dimension faible : 3-5 actions concrètes et réalisables
   - Priorisation des actions (court, moyen, long terme)
   - Quick wins : quelles actions donneront des résultats rapides ?

4. **VALORISATION DES POINTS FORTS** :
   - Comment utiliser vos points forts pour compenser les faiblesses ?
   - Opportunités à saisir grâce à ces forces

5. **OBJECTIF D'ÉQUILIBRE** :
   - Vers quel score moyen tendre dans 6 mois ?
   - Quelles dimensions prioriser ?
   - Indicateurs de progrès à suivre

Adopte un ton encourageant, bienveillant et actionnable. Structure ta réponse de manière claire avec des titres et sous-titres. Sois spécifique et concret dans tes recommandations.`;

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
            content: 'Tu es un expert en coaching professionnel spécialisé dans l\'équilibre de vie et le développement de carrière. Tu aides les personnes à identifier les déséquilibres dans leur vie professionnelle et à établir un plan d\'action pour les rééquilibrer.' 
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
    console.error('Error in generate-life-wheel-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
