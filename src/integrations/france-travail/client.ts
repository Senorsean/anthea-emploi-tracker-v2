const CLIENT_ID = import.meta.env.VITE_POLE_EMPLOI_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_POLE_EMPLOI_CLIENT_SECRET;

let accessToken: string | undefined;
let tokenExpiration: number | undefined;

export interface FranceTravailOffer {
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
  if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("⚠️ Clés API France Travail manquantes. Vérifiez .env ou les variables Lovable.");
  }

  const res = await fetch("https://api.francetravail.io/connexion/oauth2/access_token?realm=/partenaire", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`❌ Échec de récupération du token France Travail: ${res.status}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min avant l'expiration

  return accessToken;
}

export async function searchOffers(params: SearchParams): Promise<FranceTravailOffer[]> {
  const token = await getAccessToken();

  const query = new URLSearchParams();
  if (params.keywords) query.set("motsCles", params.keywords);
  if (params.city) query.set("commune", params.city);
  if (params.region) query.set("region", params.region);
  if (params.contractType) query.set("typeContrat", params.contractType);
  query.set("range", "0-20");

  const url = `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${query.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("🔴 Erreur API France Travail:", res.status, errorText);
    throw new Error(`API France Travail a échoué: ${res.status}`);
  }

  const data = await res.json();
  console.log("✅ Offres récupérées :", data.resultats.length);
  return data.resultats;
}
