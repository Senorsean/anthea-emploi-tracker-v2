import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('HASDATA_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'HASDATA_API_KEY not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const keyword: string = body.keyword || 'software engineer';
    const domain: string = body.domain || 'www.indeed.com';
    const mobility: any = body.mobility || {};
    const useAllowedCities: boolean = body.useAllowedCities !== false; // default true

    const allowedCities: string[] = Array.isArray(mobility?.allowed_cities) ? mobility.allowed_cities : [];
    const baseAddress: string = (mobility?.base_address || '').toString();

    console.log('HasData API request params:', { keyword, domain, mobility, useAllowedCities, allowedCities, baseAddress });

    let locations: string[] = [];
    if (useAllowedCities && allowedCities.length) {
      locations = allowedCities.slice(0, 5);
    } else if (baseAddress) {
      locations = [baseAddress];
    }

    // Normalize locations to include country context for better matching (e.g., "Paris, France")
    const expandLocation = (loc: string): string[] => {
      const l = String(loc || '').trim();
      if (!l) return [];
      if (/,/.test(l) || /france/i.test(l) || /\bFR\b/i.test(l)) return [l];
      return [`${l}, France`, l];
    };
    const seen = new Set<string>();
    locations = locations.flatMap(expandLocation).filter((l) => {
      const key = l.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);

    console.log('Final locations to search:', locations);

    if (!locations.length) {
      console.log('No locations provided, returning empty results');
      return new Response(
        JSON.stringify({ results: [], note: 'No locations provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];

    for (const loc of locations) {
      const domainsToTry = domain.includes('indeed') ? [domain, 'fr.indeed.com'] : [domain];

      let foundForLoc = false;
      for (const d of domainsToTry) {
        const url = `https://api.hasdata.com/scrape/indeed/listing?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(loc)}&domain=${encodeURIComponent(d)}`;
        console.log('Making request to HasData API:', url);
        
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
        });

        console.log(`HasData API response for ${loc} on ${d}: status ${res.status}`);

        if (!res.ok) {
          const txt = await res.text();
          console.error('HasData error for', loc, 'domain', d, 'status:', res.status, 'response:', txt);
          continue;
        }

        const json = await res.json();
        console.log(`HasData API response JSON for ${loc}:`, json);
        
        const items = Array.isArray(json?.data || json?.items || json?.results)
          ? (json.data || json.items || json.results)
          : [];

        console.log(`Found ${items.length} items for location ${loc} on domain ${d}`);

        if (items.length) {
          for (const it of items) {
            const normalized = {
              title: it.title || it.jobTitle || it.position || '',
              company: it.company || it.companyName || '',
              location: it.location || it.city || loc,
              url: it.url || it.jobUrl || it.link || it.jobLink || '',
              description: it.snippet || it.description || '',
              sourceLocation: loc,
            };
            results.push(normalized);
          }
          foundForLoc = true;
          break; // stop trying other domains for this location
        }
      }

      if (results.length > 60) break; // avoid huge payloads
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('fetch-indeed-listings error', err);
    return new Response(
      JSON.stringify({ error: 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
