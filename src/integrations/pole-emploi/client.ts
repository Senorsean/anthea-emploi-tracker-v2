// Utilities for accessing the P\u00f4le Emploi (France Travail) API
// The API requires an OAuth access token which can be obtained using
// your client ID and client secret. Optionally you can provide an
// already created token via `VITE_POLE_EMPLOI_API_KEY`.

const CLIENT_ID = import.meta.env.VITE_POLE_EMPLOI_CLIENT_ID as string | undefined;
const CLIENT_SECRET = import.meta.env.VITE_POLE_EMPLOI_CLIENT_SECRET as string | undefined;
let accessToken: string | undefined = import.meta.env.VITE_POLE_EMPLOI_API_KEY as string | undefined;
let tokenExpiration: number | undefined;

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

async function getAccessToken(): Promise<string> {
  // Reuse the token if it exists and has not expired
  if (accessToken && tokenExpiration && tokenExpiration > Date.now()) {
    return accessToken;
  }

  // If an access token was provided directly, use it
  if (accessToken && !tokenExpiration) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing P\u00f4le Emploi credentials');
  }

  const params = new URLSearchParams();
  params.set('grant_type', 'client_credentials');
  params.set('client_id', CLIENT_ID);
  params.set('client_secret', CLIENT_SECRET);
  // Scope required for the job offers API
  params.set('scope', 'api_offresd_emploi');

  const res = await fetch(
    'https://entreprise.pole-emploi.fr/connexion/oauth2/access_token?realm=/partenaire',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to obtain token: ${res.status}`);
  }

  const data = await res.json();
  accessToken = data.access_token as string | undefined;
  if (data.expires_in) {
    tokenExpiration = Date.now() + data.expires_in * 1000 - 60 * 1000; // refresh 1 min before expiry
  }

  if (!accessToken) {
    throw new Error('No access token received');
  }

  return accessToken;
}

export async function searchOffers(params: SearchParams): Promise<PoleEmploiOffer[]> {
  const token = await getAccessToken();
  const searchParams = new URLSearchParams();
  if (params.keywords) searchParams.set('motsCles', params.keywords);
  if (params.city) searchParams.set('commune', params.city);
  if (params.region) searchParams.set('region', params.region);
  if (params.contractType) searchParams.set('typeContrat', params.contractType);
  searchParams.set('range', '0-20');

  const url = `https://api.pole-emploi.io/partenaire/offresdemploi/v2/offres/search?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.resultats as PoleEmploiOffer[];
}
