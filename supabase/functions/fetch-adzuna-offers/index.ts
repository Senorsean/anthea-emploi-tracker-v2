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

    console.log('Fetching job offers from Adzuna API...');
    console.log('Adzuna credentials:', { 
      app_id: !!adzunaAppId, 
      api_key: !!adzunaApiKey,
      app_id_length: adzunaAppId?.length,
      api_key_length: adzunaApiKey?.length 
    });
    
    // Build Adzuna search URL
    const baseUrl = 'https://api.adzuna.com/v1/api/jobs/fr/search/1';
    const searchParams = new URLSearchParams({
      app_id: adzunaAppId,
      app_key: adzunaApiKey,
      results_per_page: '20', // Reduce for testing
      content_type: 'application/json'
    });

    // Add search parameters only if they exist
    if (motsCles) searchParams.append('what', motsCles);
    if (commune) searchParams.append('where', commune);
    if (rayon) searchParams.append('distance', rayon.toString());

    const finalUrl = `${baseUrl}?${searchParams.toString()}`;
    console.log('Adzuna request URL:', finalUrl.replace(adzunaApiKey, '[HIDDEN]').replace(adzunaAppId, '[HIDDEN]'));

    try {
      const adzunaResponse = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Emploi-Tracker/1.0'
        }
      });

      console.log('Adzuna response status:', adzunaResponse.status);
      console.log('Adzuna response headers:', Object.fromEntries(adzunaResponse.headers.entries()));

      if (!adzunaResponse.ok) {
        const errorText = await adzunaResponse.text();
        console.error('Adzuna API error response:', errorText);
        return new Response(
          JSON.stringify({ error: `Adzuna API error: ${adzunaResponse.status} - ${errorText}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const adzunaData = await adzunaResponse.json();
      console.log('Adzuna response:', JSON.stringify(adzunaData));
      console.log(`Found ${adzunaData.results?.length || 0} offers from Adzuna`);

      // Transform the data to match our format
      const transformedOffers = (adzunaData.results || []).map((offer: AdzunaOffer) => ({
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

      return new Response(
        JSON.stringify({ offers: transformedOffers }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (fetchError) {
      console.error('Adzuna fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: `Erreur de connexion à Adzuna: ${fetchError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Adzuna API error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});