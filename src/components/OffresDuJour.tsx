import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useJobPreferences } from "@/hooks/useJobPreferences";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { frenchRegions } from "@/data/regions";
import { searchOffers, FranceTravailOffer } from "@/integrations/france-travail/client";

export const OffresDuJour = () => {
  const { jobs } = useJobs();
  const { preferences, setPreferences } = useJobPreferences();
  const allJobs = Object.values(jobs).flat();
  const todayOffers = allJobs.filter((job) => {
    const diffDays =
      (Date.now() - new Date(job.dateAdded).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 1 && job.offerType === "job_offer";
  });

  const [keywords, setKeywords] = useState(preferences.keywords);
  const [city, setCity] = useState(preferences.city);
  const [region, setRegion] = useState(preferences.region);
  const [contract, setContract] = useState(preferences.contractType || "CDD");
  const [minDate, setMinDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [apiOffers, setApiOffers] = useState<FranceTravailOffer[]>([]);

  useEffect(() => {
    setKeywords(preferences.keywords);
    setCity(preferences.city);
    setRegion(preferences.region);
    setContract(preferences.contractType || "CDD");
  }, [preferences]);

  const fetchAndSetOffers = async (params: Parameters<typeof searchOffers>[0]) => {
    try {
      const results = await searchOffers(params);
      let filtered = results;
      if (minDate) {
        const min = new Date(minDate);
        filtered = filtered.filter(
          (o) => !o.dateCreation || new Date(o.dateCreation) >= min
        );
      }
      filtered.sort((a, b) => {
        const aDate = new Date(a.dateCreation || 0).getTime();
        const bDate = new Date(b.dateCreation || 0).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      });
      setApiOffers(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (
      preferences.keywords ||
      preferences.city ||
      preferences.region
    ) {
      fetchAndSetOffers({
        keywords: preferences.keywords,
        city: preferences.city,
        region: preferences.region,
        contractType: preferences.contractType,
      });
    }
  }, [preferences, minDate, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = {
      keywords,
      city,
      region,
      contractType: contract,
    };
    setPreferences(params);
    fetchAndSetOffers(params);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Briefcase className="h-5 w-5 text-[#a4007c]" />
          Offres du jour
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Input
            placeholder="Poste"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <Input
            placeholder="Ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Région" />
            </SelectTrigger>
            <SelectContent>
              {frenchRegions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={contract} onValueChange={setContract}>
            <SelectTrigger>
              <SelectValue placeholder="Contrat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CDD">CDD</SelectItem>
              <SelectItem value="CDI">CDI</SelectItem>
              <SelectItem value="MIS">Intérim</SelectItem>
              <SelectItem value="SAI">Saisonnier</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={minDate}
            onChange={(e) => setMinDate(e.target.value)}
          />
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Tri" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Récentes</SelectItem>
              <SelectItem value="asc">Anciennes</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="md:col-span-6 bg-[#a4007c] hover:bg-[#a4007c]/90">
            Rechercher
          </Button>
        </form>

        {apiOffers.length > 0 && (
          <ul className="space-y-2">
            {apiOffers.map((offer) => (
              <li key={offer.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{offer.intitule}</p>
                  <p className="text-sm text-gray-600">
                    {offer.entreprise?.nom} - {offer.lieuTravail?.libelle}
                  </p>
                </div>
                {offer.origine?.url && (
                  <a
                    href={offer.origine.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a4007c] text-sm hover:underline"
                  >
                    Voir l'offre
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        {apiOffers.length === 0 && todayOffers.length === 0 && (
          <p className="text-gray-600">Pas de nouvelles offres aujourd'hui.</p>
        )}

        {apiOffers.length === 0 && todayOffers.length > 0 && (
          <ul className="space-y-2">
            {todayOffers.map((job) => (
              <li key={job.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-600">
                    {job.company} - {job.location}
                  </p>
                </div>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a4007c] text-sm hover:underline"
                  >
                    Voir l'offre
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default OffresDuJour;
