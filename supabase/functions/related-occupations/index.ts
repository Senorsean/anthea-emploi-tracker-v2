import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tryParseJSON(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch (_) {
    // Try to extract JSON block from markdown/code fences
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (_) { /* ignore */ }
    }
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY manquant' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { occupation_id, query_label, tiers } = await req.json();
    const hasId = Boolean(occupation_id);
    const hasLabel = typeof query_label === 'string' && query_label.trim().length > 0;
    if (!hasId && !hasLabel) {
      return new Response(JSON.stringify({ related: [], message: 'No occupation_id or query_label provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Resolve target occupation (from DB when id provided) or use label fallback
    let target: { id: string | null; label: string; aliases?: string[] | null } | null = null;
    if (hasId) {
      const { data: t, error: targetErr } = await supabase
        .from('occupations')
        .select('id,label,aliases')
        .eq('id', occupation_id)
        .single();
      if (targetErr || !t) {
        console.error('target occupation not found', targetErr);
        return new Response(JSON.stringify({ related: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      target = { id: t.id, label: t.label, aliases: t.aliases || [] };
    } else if (hasLabel) {
      target = { id: null, label: String(query_label).trim(), aliases: [] };
    }

    // Load catalog (limit to keep prompt small)
    const { data: catalog, error: catErr } = await supabase
      .from('occupations')
      .select('id,label,aliases')
      .order('label', { ascending: true })
      .limit(1000);
    if (catErr) {
      console.error('catalog error', catErr);
    }

    const catalogForAI = (catalog || []).map((o) => ({ id: o.id, label: o.label, aliases: o.aliases || [] })).slice(0, 600);

    const systemPrompt = `Tu es un assistant RH français. Donne des métiers "proches", "voisins" et "élargis" par rapport à un métier cible (en France). 
- "Proches": intitulé quasi identique / même famille métier
- "Voisins": compétences très similaires, passerelle évidente
- "Élargis": périmètre élargi mais encore pertinent
Réponds uniquement en JSON compact avec les clés proches, voisins, elargi (tableaux de libellés). Maximum 10 éléments par niveau. N'inclus pas le métier cible.`;

    const userPrompt = {
      target: { id: target?.id, label: target?.label, aliases: target?.aliases || [] },
      tiers: Array.isArray(tiers) ? tiers : ['PROCHE','VOISIN','ELARGI'],
      catalog_sample: catalogForAI.map((c) => ({ label: c.label, aliases: c.aliases })).slice(0, 200),
      format: {
        proches: ["intitulé 1", "intitulé 2"],
        voisins: ["intitulé 3"],
        elargi: ["intitulé 4"]
      }
    };

    const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Cible: ${target?.label}. Aliases: ${(target?.aliases || []).join(', ')}\nCatalogue (extrait): ${JSON.stringify(userPrompt.catalog_sample)}\nTiers demandés: ${JSON.stringify(userPrompt.tiers)}\nFormat strict JSON: ${JSON.stringify(userPrompt.format)}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error('OpenAI error:', errText);
      return new Response(JSON.stringify({ error: 'Erreur OpenAI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const content: string = aiJson?.choices?.[0]?.message?.content || '';
    let parsed = tryParseJSON(content);
    if (!parsed) {
      // Attempt to coerce simple list formats
      parsed = { proches: [], voisins: [], elargi: [] };
    }

    const tierMap: Record<string, string> = {
      PROCHE: 'proches',
      VOISIN: 'voisins',
      ELARGI: 'elargi',
    };

    // Build lookup maps for occupation matching
    const occs = (catalog || []).map((o) => ({
      id: o.id,
      label: o.label,
      aliases: (o.aliases || []) as string[],
      normLabel: normalize(o.label),
      normAliases: (o.aliases || []).map((a: string) => normalize(a)),
    }));

    function matchToId(name: string): string | null {
      const q = normalize(name);
      // Exact label match
      let found = occs.find(o => o.normLabel === q);
      if (found) return found.id;
      // Alias exact match
      found = occs.find(o => o.normAliases.includes(q));
      if (found) return found.id;
      // Includes
      found = occs.find(o => o.normLabel.includes(q) || q.includes(o.normLabel));
      if (found) return found.id;
      for (const o of occs) {
        if (o.normAliases.some(a => a.includes(q) || q.includes(a))) return o.id;
      }
      return null;
    }

    const requestedTiers: string[] = Array.isArray(tiers) && tiers.length ? tiers : ['PROCHE','VOISIN','ELARGI'];
    const scores: Record<string, number> = { PROCHE: 0.9, VOISIN: 0.7, ELARGI: 0.5 };
    const relatedSet = new Set<string>();
    const related: Array<{ target_id: string; score: number; tier: string }> = [];

    for (const t of requestedTiers) {
      const key = tierMap[t] || '';
      const list: string[] = Array.isArray(parsed?.[key]) ? parsed[key] : [];
      for (const name of list) {
        const id = matchToId(name);
        const idToUse = id || name; // fallback to label when no mapping found
        const isSameAsTarget = hasId ? (idToUse === occupation_id) : (normalize(name) === normalize(target?.label || ''));
        if (!isSameAsTarget && !relatedSet.has(idToUse)) {
          relatedSet.add(idToUse);
          related.push({ target_id: idToUse, score: scores[t] ?? 0.6, tier: t });
        }
      }
    }

    return new Response(JSON.stringify({ related }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('related-occupations error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
