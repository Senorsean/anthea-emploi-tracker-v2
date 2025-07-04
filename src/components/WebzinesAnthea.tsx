import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export const WebzinesAnthea = () => {
  const links = [
    { title: 'FRANCE TRAVAIL - Actualités', url: 'https://www.pole-emploi.fr/actualites/a-laffiche.html' },
    { title: 'FRANCE TRAVAIL - Choisir son métier', url: 'https://www.pole-emploi.fr/candidat/vos-services-en-ligne/emploi-store/emploi-store-choisir-un-metier.html' },
    { title: 'FRANCE TRAVAIL - Métierscope', url: 'https://www.emploi-store.fr/portail/services/metierscope' },
    { title: 'JOBIRL- Réseau social orientation', url: 'https://www.jobirl.com/' },
    { title: 'REBONDIR - Emploi', url: 'https://rebondir.fr/emploi/conseils-emploi/' },
    { title: 'REBONDIR - Formation', url: 'https://rebondir.fr/formation/' },
    { title: 'REBONDIR - Reconversion', url: 'https://rebondir.fr/reconversion/' },
    { title: 'REBONDIR - Entreprendre', url: 'https://rebondir.fr/entreprendre/' },
    { title: 'HELLOWORK - Actualités', url: 'https://www.hellowork.com/fr-fr/media.html' },
    { title: 'CADRE EMPLOI', url: 'https://www.cadremploi.fr/editorial/actualites.html' },
    { title: 'METEOJOB - Actualités', url: 'https://www.meteojob.com/blog-emploi' },
    { title: 'EMPLOI NUMÉRIQUES - Actualités', url: 'https://www.emplois-numeriques.com/actualites/' },
    { title: 'MONSTER -Actualités', url: 'https://www.monster.fr/conseil-carriere' },
    { title: "L'USINE DIGITALE - Emploi", url: 'https://www.usine-digitale.fr/recherche=emploi' },
    { title: 'LE MONDE INFORMATIQUE - Emploi', url: 'https://www.lemondeinformatique.fr/recherche/index.html?search=emploi' },
    { title: 'ONISEP', url: 'https://www.onisep.fr/' },
    { title: 'CHALLENGES -Emploi', url: 'https://www.challenges.fr/emploi/' },
    { title: 'STRATÉGIES - Emploi', url: 'https://www.strategies.fr/recherche?query=emploi' },
    { title: "L'EXPRESS - Emploi", url: 'https://www.lexpress.fr/economie/emploi/' },
    { title: 'LES ECHOS - Emploi', url: 'https://www.lesechos.fr/recherche?q=emploi' },
    { title: 'LE POINT - Emploi', url: 'https://www.lepoint.fr/recherche/index.php?query=emploi' },
    { title: 'LA TRIBUNE - Emploi', url: 'https://www.latribune.fr/recherche.html?q=emploi' },
    { title: "L'USINE NOUVELLE - ACTU", url: 'https://www.usinenouvelle.com/eco-social/' },
    { title: 'CAPITAL- Carrières', url: 'https://www.challenges.fr/emploi/' },
    { title: 'LE MONDE - Emploi', url: 'https://www.lemonde.fr/emploi/' },
    { title: 'LIBERATION-Emploi', url: 'https://www.liberation.fr/recherche/?query=EMPLOI' },
    { title: 'FIGARO - Actualités emploi', url: 'https://emploi.lefigaro.fr/actu-emploi' },
    { title: 'LA CROIX - Emploi', url: 'https://www.la-croix.com/Recherche/emploi/1' },
    { title: 'LA VOIX DU NORD - Emploi', url: 'https://www.lavoixdunord.fr/emploi' },
    { title: 'LE COURRIER PICARD - Emploi', url: 'https://www.courrier-picard.fr/394590/sections/emploi' },
    { title: 'LE PROGRES - Économie', url: 'https://www.leprogres.fr/economie' },
    { title: 'MIDI LIBRE - Emploi', url: 'https://www.midilibre.fr/economie/emploi/' },
    { title: 'LE DAUPHINÉ LIBÉRÉ - Emploi', url: 'https://www.ledauphine.com/recherche?q=Emploi&x=0&y=0&x=1&y=1' },
    { title: "L'EST ÉCLAIR - Emploi", url: 'https://www.lest-eclair.fr/emploi' },
    { title: 'LA NOUVELLE RÉPUBLIQUE - Emploi', url: 'https://www.lanouvellerepublique.fr/recherche?query=emploi' },
    { title: 'SUD OUEST - Éco', url: 'https://www.sudouest.fr/economie/' },
    { title: 'LE PARISIEN - Emploi', url: 'https://www.leparisien.fr/recherche/?query=emploi' },
    { title: 'OUEST FRANCE - Emploi', url: 'https://www.ouest-france.fr/economie/emploi/' },
    { title: 'CORSE MATIN - ÉCO', url: 'https://www.corsematin.com/economie' },
    { title: 'ACTU.FR - Emploi', url: 'https://actu.fr/?s=emploi' },
    { title: 'AGEFIPH -Actualités', url: 'https://innovation.agefiph.fr/actualites-et-evenements' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <ExternalLink className="h-5 w-5 text-[#a4007c]" />
          WEBZINES ANTHEA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          {links.map((link, index) => (
            <li key={index}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <ExternalLink size={16} />
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default WebzinesAnthea;
