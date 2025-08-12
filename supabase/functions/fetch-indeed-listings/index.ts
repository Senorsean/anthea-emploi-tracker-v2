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

    let locations: string[] = [];
    if (useAllowedCities && allowedCities.length) {
      locations = allowedCities.slice(0, 5);
    } else if (baseAddress) {
      locations = [baseAddress];
    }

    if (!locations.length) {
      return new Response(
        JSON.stringify({ results: [], note: 'No locations provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];

    for (const loc of locations) {
      const url = `https://api.hasdata.com/scrape/indeed/listing?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(loc)}&domain=${encodeURIComponent(domain)}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('HasData error for', loc, txt);
        continue;
      }

      const json = await res.json();
      const items = Array.isArray(json?.data || json?.items || json?.results)
        ? (json.data || json.items || json.results)
        : [];
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
