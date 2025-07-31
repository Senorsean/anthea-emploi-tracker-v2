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

Please provide a detailed market intelligence report covering:

1. Market Overview: Current state of the job market for this position in the specified location and industry
2. Market Trends: Key trends affecting this role and industry
3. Opportunities and Recommendations: Strategic opportunities and actionable recommendations
4. Competitive Analysis: Analysis of the competitive landscape and key players
5. Skills in Demand: Most sought-after skills and competencies for this role

Make the report practical, data-driven, and actionable. Focus on insights that would help someone understand the market dynamics and make informed career decisions.

Please format your response as a JSON object with the following structure:
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
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert market intelligence analyst specializing in job markets and career insights. Provide detailed, accurate, and actionable market intelligence reports.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const content = data.choices[0].message.content;
    
    // Try to parse the JSON response
    let marketIntelligence;
    try {
      marketIntelligence = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Fallback: create a structured response from the raw content
      marketIntelligence = {
        marketOverview: content.substring(0, Math.min(500, content.length)),
        trends: "Les tendances du marché seront analysées en détail dans la version complète du rapport.",
        opportunities: "Les opportunités et recommandations seront détaillées dans la version complète du rapport.",
        competitiveAnalysis: "L'analyse concurrentielle sera fournie dans la version complète du rapport.",
        skillsInDemand: "Les compétences recherchées seront listées dans la version complète du rapport."
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