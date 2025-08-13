import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, RefreshCw, Save, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MapboxCircle from '@/components/MapboxCircle';
import { useJobs } from '@/hooks/useJobs';

// Simple department list (can be moved to data file later)
const DEPARTEMENTS = [
  '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','2A','2B','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95'
];

interface Occupation { id: string; label: string; aliases?: string[] | null }

const AireMobilitePage: React.FC = () => {
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [mobilityArea, setMobilityArea] = useState({
    id: null as string | null,
    is_active: true,
    base_address: '',
    base_lat: null as number | null,
    base_lng: null as number | null,
    radius_km: 25,
    allowed_departments: [] as string[],
    allowed_cities: [] as string[],
    remote_ok: true,
    hybrid_ok: true,
    relocation_ok: false,
    max_commute_time_min: 60,
    travel_modes: ['car','public','bike','walk'] as string[],
  });

  // Raw input strings for better UX
  const [citiesInput, setCitiesInput] = useState('');
  const [departmentsInput, setDepartmentsInput] = useState('');

  const [searchProfile, setSearchProfile] = useState({
    occupation_id: null as string | null,
    tiers: ['PROCHE','VOISIN'] as Array<'PROCHE'|'VOISIN'|'ELARGI'>,
    thresholds: { PROCHE: 0.75, VOISIN: 0.60, ELARGI: 0.45 },
    include_remote: true,
  });

  const [derived, setDerived] = useState({
    related_occupations: [] as Array<{ target_id: string; score?: number }>,
    queries: [] as string[],
    offers_preview: [] as any[],
    stats: { IN_AREA: 0, LIMIT: 0, OUT_AREA: 0, TARGET: 0, PROCHE: 0, VOISIN: 0, ELARGI: 0 },
  });

  const { jobs, setJobs } = useJobs();

  const [indeedKeyword, setIndeedKeyword] = useState('Responsable informatique');
  const [indeedDomain, setIndeedDomain] = useState('fr.indeed.com');
  const [indeedUseAllowedCities, setIndeedUseAllowedCities] = useState(true);
  const [indeedResults, setIndeedResults] = useState<any[]>([]);
  const [indeedLoading, setIndeedLoading] = useState(false);

  const fetchIndeed = async () => {
    setIndeedLoading(true);
    try {
      const { data, error } = await (supabase as any).functions.invoke('fetch-indeed-listings', {
        body: {
          keyword: indeedKeyword,
          domain: indeedDomain,
          mobility: mobilityArea,
          useAllowedCities: indeedUseAllowedCities,
        }
      });
      if (error) throw error;
      const items = Array.isArray(data?.results) ? data.results : [];
      setIndeedResults(items);
      toast.success(`${items.length} offres Indeed trouvées`);
    } catch (e: any) {
      console.error(e);
      toast.error('Échec de la récupération des offres Indeed');
    } finally {
      setIndeedLoading(false);
    }
  };

  const addToKanban = (item: any) => {
    try {
      const newJob = {
        id: crypto.randomUUID(),
        title: item.title || item.jobTitle || 'Offre Indeed',
        company: item.company || item.companyName || '',
        location: item.location || item.city || '',
        priority: 'medium',
        label: 'Indeed',
        url: item.url || item.jobUrl || item.link || '',
        dateAdded: new Date().toISOString().split('T')[0],
        interviewDate: undefined,
        followUpDate: undefined,
        offerStatus: undefined,
        offerType: undefined,
      } as any;
      setJobs((prev: any) => {
        const next = { ...prev };
        next.offer = [newJob, ...(prev.offer || [])];
        return next;
      });
      toast.success('Ajouté au Kanban');
    } catch (e) {
      console.error(e);
      toast.error("Impossible d'ajouter au Kanban");
    }
  };

  // Load occupations (first 50, alphabetic)
  useEffect(() => {
    const load = async () => {
      const { data, error } = await (supabase as any)
        .from('occupations')
        .select('id,label,aliases')
        .order('label', { ascending: true })
        .limit(50);
      if (error) {
        console.error(error);
      } else {
        setOccupations(data || []);
      }
    };
    load();
  }, []);

  useEffect(() => {
    document.title = 'Aire de mobilité — Offres emplois et Indeed';
    const desc = 'Définissez votre zone de mobilité et trouvez des offres d’emploi pertinentes.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel','canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/aire-mobilite');
  }, []);

  // Search filter
  const filteredOccupations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return occupations;
    return occupations.filter(o =>
      o.label.toLowerCase().includes(q) ||
      (o.aliases || []).some(a => a.toLowerCase().includes(q))
    );
  }, [occupations, search]);

  // Geocode via Mapbox public token in localStorage
  const geocode = async (query: string) => {
    const token = localStorage.getItem('MAPBOX_PUBLIC_TOKEN');
    if (!token) {
      toast.warning('Ajoutez votre MAPBOX_PUBLIC_TOKEN dans le localStorage.');
      return;
    }
    try {
      const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}`);
      const json = await resp.json();
      const feat = json.features?.[0];
      if (feat) {
        const [lng, lat] = feat.center;
        setMobilityArea(prev => ({ ...prev, base_address: feat.place_name, base_lat: lat, base_lng: lng }));
        toast.success('Adresse définie');
      } else {
        toast.error('Adresse introuvable');
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur de géocodage");
    }
  };

  // Related occupations (Edge Function)
  const fetchRelated = async () => {
    // Fallback: if no explicit selection, use first filtered result
    const occId = searchProfile.occupation_id || filteredOccupations[0]?.id || null;
    const typed = search.trim();
    if (!occId && !typed) {
      toast.error('Sélectionnez un métier cible (ou tapez puis choisissez dans la liste)');
      return;
    }

    // If we auto-picked the first match, persist it in state for clarity
    if (!searchProfile.occupation_id && occId) {
      setSearchProfile((p) => ({ ...p, occupation_id: occId }));
    }

    setLoading(true);
    try {
      const body: any = { tiers: searchProfile.tiers };
      if (occId) body.occupation_id = occId;
      else body.query_label = typed;

      const { data, error } = await (supabase as any).functions.invoke('related-occupations', {
        body
      });
      if (error) throw error;
      const related = Array.isArray(data?.related) ? data.related : [];
      const target = occId ? [occId] : (typed ? [typed] : []);
      const queries = Array.from(new Set([ ...target, ...related.map((r: any) => r.target_id) ]));
      setDerived(prev => ({ ...prev, related_occupations: related, queries }));
      await refreshOffers(queries);
    } catch (e: any) {
      console.error(e);
      toast.error('Erreur lors de la récupération des métiers liés');
    } finally {
      setLoading(false);
    }
  };

  const refreshOffers = async (queries?: string[]) => {
    setLoading(true);
    try {
      const session = await (supabase as any).auth.getSession();
      const userId = session.data.session?.user?.id;
      const { data, error } = await (supabase as any).functions.invoke('filter-offers-by-mobility', {
        body: {
          user_id: userId,
          occupation_id: searchProfile.occupation_id,
          related_occupation_ids: (queries || derived.queries).filter(Boolean),
          tiers: searchProfile.tiers,
          mobility: mobilityArea,
        }
      });
      if (error) throw error;
      const offers = Array.isArray(data?.offers) ? data.offers : [];
      const stats: any = { IN_AREA:0, LIMIT:0, OUT_AREA:0, TARGET:0, PROCHE:0, VOISIN:0, ELARGI:0 };
      for (const o of offers) {
        if (o.mobility_status) stats[o.mobility_status] = (stats[o.mobility_status] || 0) + 1;
        if (o.occupation_match) stats[o.occupation_match] = (stats[o.occupation_match] || 0) + 1;
      }
      setDerived(prev => ({ ...prev, offers_preview: offers, stats }));
    } catch (e: any) {
      console.error(e);
      toast.error('Erreur lors de la mise à jour des offres');
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    try {
      const { data: sess } = await (supabase as any).auth.getUser();
      const userId = sess.user?.id;
      if (!userId) {
        toast.error('Utilisateur non authentifié');
        return;
      }

      // Check if user already has a mobility area
      const { data: existing } = await (supabase as any)
        .from('mobility_area')
        .select('id')
        .eq('user_id', userId)
        .single();

      const payload: any = { ...mobilityArea, user_id: userId };
      
      let result;
      if (existing) {
        // Update existing record
        result = await (supabase as any)
          .from('mobility_area')
          .update(payload)
          .eq('id', existing.id)
          .select('id')
          .single();
      } else {
        // Insert new record
        delete payload.id;
        result = await (supabase as any)
          .from('mobility_area')
          .insert(payload)
          .select('id')
          .single();
      }

      if (result.error) throw result.error;
      setMobilityArea(prev => ({ ...prev, id: result.data.id }));
      toast.success('Profil de mobilité sauvegardé');
      await fetchRelated();
    } catch (e: any) {
      console.error(e);
      toast.error('Échec de la sauvegarde');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Aire de mobilité</h1>
          <p className="text-gray-600 text-lg">Déterminez où concentrer vos candidatures et vos efforts réseau.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Métier cible & extension</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-m">Métier cible</Label>
                <div className="flex gap-2">
                  <Input id="search-m" placeholder="Rechercher un métier..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="max-h-48 overflow-auto border rounded">
                  {filteredOccupations.map((o) => (
                    <button
                      key={o.id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${searchProfile.occupation_id===o.id ? 'bg-gray-50' : ''}`}
                      onClick={() => setSearchProfile(p => ({ ...p, occupation_id: o.id }))}
                    >
                      {o.label}
                    </button>
                  ))}
                  {!filteredOccupations.length && (
                    <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Étendue métiers</Label>
                <ToggleGroup type="multiple" value={searchProfile.tiers} onValueChange={(v: any) => setSearchProfile(p => ({ ...p, tiers: v }))}>
                  <ToggleGroupItem value="PROCHE">Proches</ToggleGroupItem>
                  <ToggleGroupItem value="VOISIN">Voisins</ToggleGroupItem>
                  <ToggleGroupItem value="ELARGI">Élargis</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Button className="w-full" variant="secondary" onClick={fetchRelated} disabled={loading}>
                <Search className="h-4 w-4 mr-2" /> Calculer les métiers inclus
              </Button>

              <div className="space-y-2">
                <Label>Métiers inclus</Label>
                <div className="flex flex-wrap gap-2">
                  {derived.queries.map((q) => (
                    <Badge key={q} variant="secondary">{q}</Badge>
                  ))}
                  {!derived.queries.length && (
                    <span className="text-xs text-gray-500">Sélectionnez un métier pour voir les correspondances</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Zone & contraintes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adresse de base</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Saisir une adresse"
                      value={mobilityArea.base_address}
                      onChange={(e) => setMobilityArea(a => ({ ...a, base_address: e.target.value }))}
                    />
                    <Button type="button" variant="secondary" onClick={() => geocode(mobilityArea.base_address)}>
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rayon (km)</Label>
                  <Slider
                    min={0}
                    max={150}
                    step={1}
                    value={[mobilityArea.radius_km]}
                    onValueChange={(v) => setMobilityArea(a => ({ ...a, radius_km: v[0] }))}
                    onValueCommit={() => refreshOffers()}
                  />
                  <p className="text-xs text-gray-500">Rayon actuel: {mobilityArea.radius_km} km</p>
                </div>
              </div>

              <MapboxCircle lat={mobilityArea.base_lat} lng={mobilityArea.base_lng} radiusKm={mobilityArea.radius_km} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Départements autorisés</Label>
                  <Input
                    placeholder="Ex: 33, 75, 92"
                    value={departmentsInput}
                    onChange={(e) => {
                      setDepartmentsInput(e.target.value);
                      setMobilityArea(a => ({ ...a, allowed_departments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }));
                    }}
                  />
                  <p className="text-xs text-gray-500">Séparez par des virgules</p>
                </div>
                <div className="space-y-2">
                  <Label>Villes autorisées</Label>
                  <Textarea
                    placeholder="Ex: Bordeaux, Paris 15e"
                    value={citiesInput}
                    onChange={(e) => {
                      setCitiesInput(e.target.value);
                      setMobilityArea(a => ({ ...a, allowed_cities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }));
                    }}
                  />
                  <p className="text-xs text-gray-500">Séparez par des virgules</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between border rounded p-3">
                  <div className="space-y-1">
                    <Label>Télétravail</Label>
                    <p className="text-xs text-gray-500">Inclure les offres remote</p>
                  </div>
                  <Switch checked={mobilityArea.remote_ok} onCheckedChange={(v) => setMobilityArea(a => ({ ...a, remote_ok: v }))} />
                </div>
                <div className="flex items-center justify-between border rounded p-3">
                  <div className="space-y-1">
                    <Label>Hybride</Label>
                    <p className="text-xs text-gray-500">Jours sur site acceptés</p>
                  </div>
                  <Switch checked={mobilityArea.hybrid_ok} onCheckedChange={(v) => setMobilityArea(a => ({ ...a, hybrid_ok: v }))} />
                </div>
                <div className="flex items-center justify-between border rounded p-3">
                  <div className="space-y-1">
                    <Label>Temps trajet max (min)</Label>
                    <Input type="number" value={mobilityArea.max_commute_time_min}
                      onChange={(e) => setMobilityArea(a => ({ ...a, max_commute_time_min: Number(e.target.value) || 0 }))}
                      onBlur={() => refreshOffers()}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => refreshOffers()} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Rafraîchir les offres
                </Button>
                <Button onClick={saveAll} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" /> Sauvegarder le profil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(derived.stats).map(([k,v]) => (
            <Card key={k}>
              <CardContent className="py-3">
                <div className="text-xs text-gray-500">{k}</div>
                <div className="text-xl font-semibold">{v as any}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {derived.offers_preview.map((item: any, idx: number) => (
            <Card key={idx} className="h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="truncate mr-2">{item.title || item.intitule || 'Offre'}</span>
                  <span className="text-xs text-gray-500">{item.city || ''}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-gray-600 flex items-center gap-2"><Building2 className="h-4 w-4" /> {item.company || item.entreprise || 'Entreprise'}</div>
                <div className="text-xs text-gray-500">{item.description?.slice(0, 220)}{item.description?.length > 220 ? '…' : ''}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Mobilité: {item.mobility_status || '-'}</Badge>
                  <Badge variant="outline">Métier: {item.occupation_match || '-'}</Badge>
                  {item.distance_km != null && (
                    <Badge variant="secondary">{Number(item.distance_km).toFixed(1)} km</Badge>
                  )}
                </div>
                {item.url && (
                  <div className="text-right">
                    <a className="text-[#a4007c] hover:underline text-sm" href={item.url} target="_blank" rel="noreferrer">Voir l’offre</a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!derived.offers_preview.length && (
            <div className="text-sm text-gray-500">Aucune offre pour l’instant. Ajustez la zone ou les métiers inclus.</div>
          )}
        </section>

        <Separator className="my-8" />

        <section className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Offres Indeed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Mot-clé</Label>
                  <Input value={indeedKeyword} onChange={(e) => setIndeedKeyword(e.target.value)} placeholder="software engineer" />
                </div>
                <div className="space-y-2">
                  <Label>Domaine</Label>
                  <Input value={indeedDomain} onChange={(e) => setIndeedDomain(e.target.value)} placeholder="www.indeed.com" />
                </div>
                <div className="flex items-center justify-between border rounded p-3">
                  <div className="space-y-1">
                    <Label>Villes autorisées</Label>
                    <p className="text-xs text-gray-500">Utiliser la liste plutôt que l’adresse de base</p>
                  </div>
                  <Switch checked={indeedUseAllowedCities} onCheckedChange={setIndeedUseAllowedCities} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={fetchIndeed} disabled={indeedLoading}>
                  <Search className="h-4 w-4 mr-2" /> Chercher sur Indeed
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indeedResults.map((r: any, idx: number) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-base truncate">{r.title || r.jobTitle || 'Offre Indeed'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-gray-600 flex items-center gap-2"><Building2 className="h-4 w-4" /> {r.company || r.companyName || ''}</div>
                      <div className="text-xs text-gray-500">{r.location || r.city || ''}</div>
                      <div className="flex items-center justify-between">
                        {(r.url || r.jobUrl) ? (
                          <a className="text-[#a4007c] hover:underline text-sm" href={(r.url || r.jobUrl)} target="_blank" rel="noreferrer">Voir</a>
                        ) : <span />}
                        <Button size="sm" variant="secondary" onClick={() => addToKanban(r)}>Ajouter au Kanban</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!indeedResults.length && (
                  <div className="text-sm text-gray-500">Lancez une recherche pour voir les offres Indeed.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default AireMobilitePage;
