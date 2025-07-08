// Utilities for accessing the P\u00f4le Emploi API
// The API key is expected to be provided via the VITE_POLE_EMPLOI_API_KEY
// environment variable defined in your .env file.

export const POLE_EMPLOI_API_KEY = import.meta.env.VITE_POLE_EMPLOI_API_KEY as string | undefined;

export interface PoleEmploiOffer {
  id: string;
  intitule: string;
  entreprise?: { nom: string };
  lieuTravail?: { libelle?: string };
  typeContrat?: string;
  origine?: { url?: string };
}

export interface SearchParams {
  keywords?: string;
  city?: string;
  region?: string;
  contractType?: string;
}

export async function searchOffers(params: SearchParams): Promise<PoleEmploiOffer[]> {
  if (!POLE_EMPLOI_API_KEY) throw new Error('Missing P\u00f4le Emploi API key');
  const searchParams = new URLSearchParams();
  if (params.keywords) searchParams.set('motsCles', params.keywords);
  if (params.city) searchParams.set('commune', params.city);
  if (params.region) searchParams.set('region', params.region);
  if (params.contractType) searchParams.set('typeContrat', params.contractType);
  searchParams.set('range', '0-20');

  const url = `https://api.pole-emploi.io/partenaire/offresdemploi/v2/offres/search?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${POLE_EMPLOI_API_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.resultats as PoleEmploiOffer[];
}
