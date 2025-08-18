import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JoobleOffer {
  title: string;
  location: string;
  snippet: string;
  salary: string;
  source: string;
  type: string;
  link: string;
  company: string;
  updated: string;
  id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { motsCles, commune, rayon } = await req.json();
    
    const joobleApiKey = Deno.env.get('JOOBLE_API_KEY');
    
    if (!joobleApiKey) {
      console.error('Missing Jooble API key');
      return new Response(
        JSON.stringify({ error: 'Configuration manquante pour Jooble' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching job offers from Jooble API...');
    
    // Prepare search parameters for Jooble
    const searchBody = {
      keywords: motsCles || '',
      location: commune || '',
      radius: rayon || 25,
      resultsOnPage: 50,
      page: 1
    };

    console.log('Jooble search parameters:', JSON.stringify(searchBody));
    console.log('Using API endpoint:', `https://jooble.org/api/${joobleApiKey}`);

    const joobleResponse = await fetch(`https://jooble.org/api/${joobleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody)
    });

    if (!joobleResponse.ok) {
      const errorText = await joobleResponse.text();
      console.error('Jooble API request failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la recherche d\'offres Jooble' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const joobleData = await joobleResponse.json();
    console.log('Jooble response:', JSON.stringify(joobleData));
    console.log(`Found ${joobleData.jobs?.length || 0} offers from Jooble`);
    
    if (joobleData.jobs?.length === 0) {
      console.log('No jobs found - checking if this is due to location constraints');
    }

    // Transform the data to match our format
    const transformedOffers = (joobleData.jobs || []).map((offer: JoobleOffer) => ({
      id: offer.id || `jooble-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: offer.title,
      company: offer.company || 'Non spécifié',
      location: offer.location || '',
      contractType: offer.type || '',
      salary: offer.salary || '',
      description: offer.snippet || '',
      url: offer.link || '',
      source: 'jooble.org',
      dateCreated: offer.updated || new Date().toISOString(),
    }));

    return new Response(
      JSON.stringify({ offers: transformedOffers }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Jooble API error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});