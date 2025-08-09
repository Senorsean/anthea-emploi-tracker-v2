import React, { useEffect } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AireMobilitePage = () => {
  // Basic SEO: title, description, canonical
  useEffect(() => {
    const title = 'Aire de mobilité | Anthea RH';
    const description =
      "Identifiez vos zones géographiques cibles avec l'aide de l'IA pour accélérer votre recherche d'emploi.";
    document.title = title;

    const metaDescId = 'meta-description-aire-mobilite';
    let meta = document.querySelector(`meta[name="description"]#${metaDescId}`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      meta.id = metaDescId;
      document.head.appendChild(meta);
    }
    meta.content = description;

    const linkRelCanonicalId = 'canonical-aire-mobilite';
    let canonical = document.querySelector(`link[rel="canonical"]#${linkRelCanonicalId}`) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.id = linkRelCanonicalId;
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/aire-mobilite`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Aire de mobilité</h1>
          <p className="text-lg text-gray-600">
            Déterminez où concentrer vos candidatures et vos efforts réseau selon votre profil,
            vos contraintes et vos ambitions.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#a4007c]/10 rounded-md">
                  <MapPin className="h-5 w-5 text-[#a4007c]" />
                </span>
                <CardTitle className="text-lg">Définir vos préférences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Sélectionnez vos villes cibles, votre rayon de mobilité et vos critères (télétravail,
              transports, qualité de vie).
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Analyser les bassins d'emploi</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Visualisez les zones à forte demande pour votre métier et votre niveau d'expérience.
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Identifier les entreprises cibles</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Repérez les entreprises pertinentes par secteur, taille et dynamique de recrutement.
            </CardContent>
          </Card>
        </section>

        <section className="max-w-xl mx-auto mt-10 text-center">
          <Button className="w-full bg-[#a4007c] hover:bg-[#8a0066] text-white" asChild>
            <Link to="/renforcez-votre-reseau">Explorer mon aire de mobilité</Link>
          </Button>
          <p className="text-xs text-gray-500 mt-3">
            Bientôt: intégration IA pour recommandations ultra-personnalisées.
          </p>
        </section>
      </main>
    </div>
  );
};

export default AireMobilitePage;
