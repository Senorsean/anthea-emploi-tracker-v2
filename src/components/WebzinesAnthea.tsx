import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const WebzinesAnthea = () => {
  const categories = {
    all: { label: 'Toutes les catégories', color: '' },
    emploi: { label: 'Emploi', color: 'bg-blue-100 text-blue-800' },
    formation: { label: 'Formation', color: 'bg-green-100 text-green-800' },
    economie: { label: 'Économie', color: 'bg-orange-100 text-orange-800' },
    region: { label: 'Journaux régionaux', color: 'bg-purple-100 text-purple-800' },
    handicap: { label: 'Handicap', color: 'bg-pink-100 text-pink-800' }
  } as const;

  const links = [
    { title: 'FRANCE TRAVAIL - Actualités', url: 'https://www.pole-emploi.fr/actualites/a-laffiche.html', category: 'emploi' },
    { title: 'FRANCE TRAVAIL - Choisir son métier', url: 'https://www.pole-emploi.fr/candidat/vos-services-en-ligne/emploi-store/emploi-store-choisir-un-metier.html', category: 'formation' },
    { title: 'FRANCE TRAVAIL - Métierscope', url: 'https://www.emploi-store.fr/portail/services/metierscope', category: 'formation' },
    { title: 'JOBIRL- Réseau social orientation', url: 'https://www.jobirl.com/', category: 'formation' },
    { title: 'REBONDIR - Emploi', url: 'https://rebondir.fr/emploi/conseils-emploi/', category: 'emploi' },
    { title: 'REBONDIR - Formation', url: 'https://rebondir.fr/formation/', category: 'formation' },
    { title: 'REBONDIR - Reconversion', url: 'https://rebondir.fr/reconversion/', category: 'formation' },
    { title: 'REBONDIR - Entreprendre', url: 'https://rebondir.fr/entreprendre/', category: 'emploi' },
    { title: 'HELLOWORK - Actualités', url: 'https://www.hellowork.com/fr-fr/media.html', category: 'emploi' },
    { title: 'CADRE EMPLOI', url: 'https://www.cadremploi.fr/editorial/actualites.html', category: 'emploi' },
    { title: 'METEOJOB - Actualités', url: 'https://www.meteojob.com/blog-emploi', category: 'emploi' },
    { title: 'EMPLOI NUMÉRIQUES - Actualités', url: 'https://www.emplois-numeriques.com/actualites/', category: 'emploi' },
    { title: 'MONSTER -Actualités', url: 'https://www.monster.fr/conseil-carriere', category: 'emploi' },
    { title: "L'USINE DIGITALE - Emploi", url: 'https://www.usine-digitale.fr/recherche=emploi', category: 'emploi' },
    { title: 'LE MONDE INFORMATIQUE - Emploi', url: 'https://www.lemondeinformatique.fr/recherche/index.html?search=emploi', category: 'emploi' },
    { title: 'ONISEP', url: 'https://www.onisep.fr/', category: 'formation' },
    { title: 'CHALLENGES -Emploi', url: 'https://www.challenges.fr/emploi/', category: 'emploi' },
    { title: 'STRATÉGIES - Emploi', url: 'https://www.strategies.fr/recherche?query=emploi', category: 'emploi' },
    { title: "L'EXPRESS - Emploi", url: 'https://www.lexpress.fr/economie/emploi/', category: 'emploi' },
    { title: 'LES ECHOS - Emploi', url: 'https://www.lesechos.fr/recherche?q=emploi', category: 'economie' },
    { title: 'LE POINT - Emploi', url: 'https://www.lepoint.fr/recherche/index.php?query=emploi', category: 'emploi' },
    { title: 'LA TRIBUNE - Emploi', url: 'https://www.latribune.fr/recherche.html?q=emploi', category: 'economie' },
    { title: "L'USINE NOUVELLE - ACTU", url: 'https://www.usinenouvelle.com/eco-social/', category: 'economie' },
    { title: 'CAPITAL- Carrières', url: 'https://www.challenges.fr/emploi/', category: 'economie' },
    { title: 'LE MONDE - Emploi', url: 'https://www.lemonde.fr/emploi/', category: 'emploi' },
    { title: 'LIBERATION-Emploi', url: 'https://www.liberation.fr/recherche/?query=EMPLOI', category: 'emploi' },
    { title: 'FIGARO - Actualités emploi', url: 'https://emploi.lefigaro.fr/actu-emploi', category: 'emploi' },
    { title: 'LA CROIX - Emploi', url: 'https://www.la-croix.com/Recherche/emploi/1', category: 'emploi' },
    { title: 'LA VOIX DU NORD - Emploi', url: 'https://www.lavoixdunord.fr/emploi', category: 'region' },
    { title: 'LE COURRIER PICARD - Emploi', url: 'https://www.courrier-picard.fr/394590/sections/emploi', category: 'region' },
    { title: 'LE PROGRES - Économie', url: 'https://www.leprogres.fr/economie', category: 'region' },
    { title: 'MIDI LIBRE - Emploi', url: 'https://www.midilibre.fr/economie/emploi/', category: 'region' },
    { title: 'LE DAUPHINÉ LIBÉRÉ - Emploi', url: 'https://www.ledauphine.com/recherche?q=Emploi&x=0&y=0&x=1&y=1', category: 'region' },
    { title: "L'EST ÉCLAIR - Emploi", url: 'https://www.lest-eclair.fr/emploi', category: 'region' },
    { title: 'LA NOUVELLE RÉPUBLIQUE - Emploi', url: 'https://www.lanouvellerepublique.fr/recherche?query=emploi', category: 'region' },
    { title: 'SUD OUEST - Éco', url: 'https://www.sudouest.fr/economie/', category: 'region' },
    { title: 'LE PARISIEN - Emploi', url: 'https://www.leparisien.fr/recherche/?query=emploi', category: 'region' },
    { title: 'OUEST FRANCE - Emploi', url: 'https://www.ouest-france.fr/economie/emploi/', category: 'region' },
    { title: 'CORSE MATIN - ÉCO', url: 'https://www.corsematin.com/economie', category: 'region' },
    { title: 'ACTU.FR - Emploi', url: 'https://actu.fr/?s=emploi', category: 'region' },
    { title: 'AGEFIPH -Actualités', url: 'https://innovation.agefiph.fr/actualites-et-evenements', category: 'handicap' }
  ] as const;

  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categories>('all');

  const filteredLinks = selectedCategory === 'all'
    ? links
    : links.filter(link => link.category === selectedCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <ExternalLink className="h-5 w-5 text-[#a4007c]" />
          WEBZINES ANTHEA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as keyof typeof categories)}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categories).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2">
          {filteredLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium hover:underline ${categories[link.category].color}`}
            >
              {link.title}
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebzinesAnthea;
