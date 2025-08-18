import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FranceTravailOffer {
  id: string;
  intitule: string;
  entreprise?: {
    nom?: string;
  };
  lieuTravail: {
    libelle: string;
  };
  typeContrat?: string;
  salaire?: {
    libelle?: string;
  };
  description?: string;
  origineOffre: {
    urlOrigine?: string;
  };
  dateCreation: string;
}

// Mapping of common city names to INSEE codes
const cityToInseeCode: Record<string, string> = {
  'Paris': '75056',
  'Marseille': '13055',
  'Lyon': '69123',
  'Toulouse': '31555',
  'Nice': '06088',
  'Nantes': '44109',
  'Montpellier': '34172',
  'Strasbourg': '67482',
  'Bordeaux': '33063',
  'Lille': '59350',
  'Rennes': '35238',
  'Reims': '51454',
  'Saint-Étienne': '42218',
  'Le Havre': '76351',
  'Toulon': '83137',
  'Grenoble': '38185',
  'Dijon': '21231',
  'Angers': '49007',
  'Nîmes': '30189',
  'Villeurbanne': '69266'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { motsCles, commune, rayon, typeContrat } = await req.json();
    
    const clientId = Deno.env.get('FRANCE_TRAVAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('FRANCE_TRAVAIL_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('Missing France Travail credentials');
      return new Response(
        JSON.stringify({ error: 'Configuration manquante pour France Travail' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching access token for France Travail API...');
    
    // Step 1: Get access token
    const tokenResponse = await fetch('https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}&scope=api_offresdemploiv2 o2dsoffre`
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Échec de l\'authentification France Travail' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('Access token obtained, searching for offers...');

    // Step 2: Search for job offers
    const searchParams = new URLSearchParams();
    if (motsCles) searchParams.append('motsCles', motsCles);
    
    // Convert city name to INSEE code if needed
    if (commune) {
      const inseeCode = cityToInseeCode[commune] || commune;
      console.log(`Using commune: ${commune} -> INSEE code: ${inseeCode}`);
      searchParams.append('commune', inseeCode);
    }
    
    if (rayon) searchParams.append('distance', rayon.toString());
    if (typeContrat) searchParams.append('typeContrat', typeContrat);
    searchParams.append('range', '0-149'); // Max 150 results per request

    const offersResponse = await fetch(`https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!offersResponse.ok) {
      const errorText = await offersResponse.text();
      console.error('Offers search failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la recherche d\'offres' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const offersData = await offersResponse.json();
    console.log(`Found ${offersData.resultats?.length || 0} offers from France Travail`);

    // Step 3: Transform the data to match our format
    const transformedOffers = (offersData.resultats || []).map((offer: FranceTravailOffer) => ({
      id: offer.id,
      title: offer.intitule,
      company: offer.entreprise?.nom || 'Non spécifié',
      location: offer.lieuTravail?.libelle || '',
      contractType: offer.typeContrat || '',
      salary: offer.salaire?.libelle || '',
      description: offer.description || '',
      url: offer.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${offer.id}`,
      source: 'francetravail.fr',
      dateCreated: offer.dateCreation,
    }));

    return new Response(
      JSON.stringify({ offers: transformedOffers }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('France Travail API error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});