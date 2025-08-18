import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      offers = [],
      user_id,
      keywords = ''
    } = body || {};

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    console.log(`Filtering ${offers.length} offers for user ${user_id}`);

    // Get user's mobility area
    const { data: mobilityArea, error: mobilityError } = await supabase
      .from('mobility_area')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .single();

    if (mobilityError || !mobilityArea) {
      console.log('No active mobility area found, returning all offers');
      return new Response(JSON.stringify({ offers }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Mobility area: departments=${mobilityArea.allowed_departments}, cities=${mobilityArea.allowed_cities}, radius=${mobilityArea.radius_km}km`);
    
    // Function to check keyword relevance
    const isKeywordRelevant = (offer: any, keywords: string) => {
      if (!keywords) return true;
      
      const searchText = `${offer.title || ''} ${offer.description || ''} ${offer.company || ''}`.toLowerCase();
      const keywordsList = keywords.toLowerCase().split(' ').filter(k => k.length > 2);
      
      // At least half of the keywords should be present
      const matchingKeywords = keywordsList.filter(keyword => searchText.includes(keyword));
      const relevanceScore = matchingKeywords.length / keywordsList.length;
      
      return relevanceScore >= 0.5; // At least 50% keyword match
    };

    // Filter offers based on mobility area and keyword relevance
    const filteredOffers = offers.filter((offer: any) => {
      const location = offer.location || '';
      
      // First check keyword relevance
      if (!isKeywordRelevant(offer, keywords)) {
        console.log(`✗ Offer "${offer.title}" - not relevant to keywords "${keywords}"`);
        return false;
      }
      
      // Extract department number from location
      const departmentMatch = location.match(/(\d{2,3})/);
      const department = departmentMatch ? departmentMatch[1] : null;
      
      // Check if department is allowed
      if (department && mobilityArea.allowed_departments?.includes(department)) {
        console.log(`✓ Offer "${offer.title}" in ${location} - department ${department} is allowed`);
        return true;
      }
      
      // Check if city is mentioned in allowed cities
      const allowedCities = mobilityArea.allowed_cities || [];
      for (const city of allowedCities) {
        if (location.toLowerCase().includes(city.toLowerCase())) {
          console.log(`✓ Offer "${offer.title}" in ${location} - city ${city} is allowed`);
          return true;
        }
      }
      
      // Check for remote work
      if (mobilityArea.remote_ok && (
        location.toLowerCase().includes('remote') ||
        location.toLowerCase().includes('télétravail') ||
        location.toLowerCase().includes('distanciel')
      )) {
        console.log(`✓ Offer "${offer.title}" in ${location} - remote work allowed`);
        return true;
      }
      
      console.log(`✗ Offer "${offer.title}" in ${location} - filtered out (dept: ${department})`);
      return false;
    });

    console.log(`Filtered ${offers.length} offers down to ${filteredOffers.length} offers`);

    return new Response(JSON.stringify({ offers: filteredOffers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('filter-offers-by-mobility error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
