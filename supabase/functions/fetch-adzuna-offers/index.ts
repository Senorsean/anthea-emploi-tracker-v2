import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdzunaOffer {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
  };
  description: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  redirect_url: string;
  created: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { motsCles, commune, rayon } = await req.json();
    
    const adzunaAppId = Deno.env.get('ADZUNA_APP_ID');
    const adzunaApiKey = Deno.env.get('ADZUNA_API_KEY');
    
    console.log('Request received:', { motsCles, commune, rayon });
    console.log('Adzuna credentials check:', { 
      hasAppId: !!adzunaAppId, 
      hasApiKey: !!adzunaApiKey,
      appIdLength: adzunaAppId?.length,
      apiKeyLength: adzunaApiKey?.length 
    });
    
    if (!adzunaAppId || !adzunaApiKey) {
      console.error('Missing Adzuna credentials');
      return new Response(
        JSON.stringify({ error: 'Configuration manquante pour Adzuna' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Simple test URL first
    const testUrl = `https://api.adzuna.com/v1/api/jobs/fr/search/1?app_id=${adzunaAppId}&app_key=${adzunaApiKey}&results_per_page=5`;
    console.log('Testing basic Adzuna API call...');
    
    try {
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Emploi-Tracker/1.0'
        }
      });

      console.log('Test response status:', testResponse.status);
      console.log('Test response headers:', Object.fromEntries(testResponse.headers.entries()));

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('Adzuna API test error:', errorText);
        
        // Try to parse error if it's JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Parsed error:', errorJson);
        } catch (e) {
          console.error('Error text (not JSON):', errorText);
        }
        
        return new Response(
          JSON.stringify({ 
            error: `Adzuna API test failed: ${testResponse.status}`,
            details: errorText
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const testData = await testResponse.json();
      console.log('Test API response received, count:', testData.count);
      console.log('Test results length:', testData.results?.length || 0);

      // If test works, proceed with actual search
      let searchUrl = `https://api.adzuna.com/v1/api/jobs/fr/search/1?app_id=${adzunaAppId}&app_key=${adzunaApiKey}&results_per_page=20`;
      
      if (motsCles) searchUrl += `&what=${encodeURIComponent(motsCles)}`;
      if (commune) searchUrl += `&where=${encodeURIComponent(commune)}`;
      if (rayon) searchUrl += `&distance=${rayon}`;

      console.log('Making search request...');
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Emploi-Tracker/1.0'
        }
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Search API error:', errorText);
        return new Response(
          JSON.stringify({ error: `Search failed: ${searchResponse.status}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const searchData = await searchResponse.json();
      console.log('Search response received, count:', searchData.count);
      console.log('Search results length:', searchData.results?.length || 0);

      // Transform the data to match our format
      const transformedOffers = (searchData.results || []).map((offer: AdzunaOffer) => ({
        id: offer.id || `adzuna-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: offer.title,
        company: offer.company?.display_name || 'Non spécifié',
        location: offer.location?.display_name || '',
        contractType: offer.contract_type || '',
        salary: offer.salary_min && offer.salary_max 
          ? `${offer.salary_min} - ${offer.salary_max} €`
          : offer.salary_min 
          ? `À partir de ${offer.salary_min} €`
          : '',
        description: offer.description || '',
        url: offer.redirect_url || '',
        source: 'adzuna.com',
        dateCreated: offer.created || new Date().toISOString(),
      }));

      console.log('Returning', transformedOffers.length, 'transformed offers');

      return new Response(
        JSON.stringify({ offers: transformedOffers }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (fetchError) {
      console.error('Adzuna fetch error:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: `Erreur de connexion à Adzuna: ${fetchError.message}`,
          details: fetchError.toString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('General Adzuna API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});