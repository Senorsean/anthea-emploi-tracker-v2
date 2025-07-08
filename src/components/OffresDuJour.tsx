import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchOffers, PoleEmploiOffer } from "@/integrations/pole-emploi/client";

export const OffresDuJour = () => {
  const { jobs } = useJobs();
  const allJobs = Object.values(jobs).flat();
  const todayOffers = allJobs.filter((job) => {
    const diffDays =
      (Date.now() - new Date(job.dateAdded).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 1 && job.offerType === "job_offer";
  });

  const [keywords, setKeywords] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [contract, setContract] = useState("CDD");
  const [apiOffers, setApiOffers] = useState<PoleEmploiOffer[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const offers = await searchOffers({
        keywords,
        city,
        region,
        contractType: contract,
      });
      setApiOffers(offers);
    } catch (err) {
      console.error(err);
    }
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
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Input
            placeholder="Région"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
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
          <Button type="submit" className="md:col-span-4 bg-[#a4007c] hover:bg-[#a4007c]/90">
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
