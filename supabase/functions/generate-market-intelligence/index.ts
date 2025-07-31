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
    const { jobTitle, experience, teamSize, scope, industry, country, city, workMode, language } = await req.json();

    console.log('Generating market intelligence for:', { jobTitle, experience, industry, city, country });

    const prompt = `Generate a comprehensive market intelligence report in ${language} for the following position:

Job Title: ${jobTitle}
Years of Experience: ${experience}
Team Management: ${teamSize}
Scope: ${scope}
Industry: ${industry}
Location: ${city}, ${country}
Work Mode: ${workMode}

Please provide a detailed and complete market intelligence report covering:

1. Market Overview: Current state of the job market for this position in the specified location and industry. Include salary ranges, demand levels, and key market characteristics.

2. Market Trends: Key trends affecting this role and industry, including technological changes, regulatory impacts, and future outlook.

3. Opportunities and Recommendations: Strategic opportunities and actionable recommendations for career advancement and positioning.

4. Competitive Analysis: Analysis of the competitive landscape, key employers, and what differentiates successful candidates.

5. Skills in Demand: Most sought-after skills and competencies for this role, including technical and soft skills.

Make the report practical, data-driven, and actionable with specific insights relevant to ${city}, ${country} and the ${industry} industry. Each section should be comprehensive with at least 150-200 words.

IMPORTANT: Return ONLY a valid JSON object without any markdown formatting or code blocks. The response should start with { and end with }.

{
  "marketOverview": "detailed market overview text",
  "trends": "market trends analysis text", 
  "opportunities": "opportunities and recommendations text",
  "competitiveAnalysis": "competitive analysis text",
  "skillsInDemand": "skills in demand analysis text"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert market intelligence analyst specializing in job markets and career insights. You provide detailed, accurate, and actionable market intelligence reports. You always respond with valid JSON format without any markdown formatting.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    let content = data.choices[0].message.content.trim();
    
    // Clean up the response - remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to parse the JSON response
    let marketIntelligence;
    try {
      marketIntelligence = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw content:', content);
      // Fallback: create a structured response from the raw content
      marketIntelligence = {
        marketOverview: `Analyse du marché pour le poste de ${jobTitle} avec ${experience} d'expérience dans le secteur ${industry} à ${city}, ${country}. ${content.substring(0, Math.min(400, content.length))}`,
        trends: "Les tendances du marché montrent une évolution constante des compétences requises et des opportunités disponibles dans ce secteur.",
        opportunities: "Des opportunités significatives existent pour les professionnels expérimentés dans ce domaine, particulièrement ceux qui développent leurs compétences stratégiques.",
        competitiveAnalysis: "Le marché est compétitif avec une demande pour des profils expérimentés capables de gérer des projets complexes et des équipes.",
        skillsInDemand: "Les compétences les plus recherchées incluent la gestion d'équipe, l'expertise technique, et la capacité d'adaptation aux nouvelles technologies."
      };
    }

    console.log('Market intelligence report generated successfully');

    return new Response(JSON.stringify(marketIntelligence), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-market-intelligence function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate market intelligence report',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});