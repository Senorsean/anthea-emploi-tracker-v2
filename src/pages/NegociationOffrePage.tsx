import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NegociationOffrePage() {
  const [notes, setNotes] = useState<{
    preparation: string;
    arguments: string;
    alternatives: string;
    suivi: string;
  }>({
    preparation: '',
    arguments: '',
    alternatives: '',
    suivi: ''
  });

  // Gérer le scroll vers l'ancre
  useEffect(() => {
    if (window.location.hash === '#notes') {
      setTimeout(() => {
        const element = document.getElementById('notes');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">💰 Négociation d'offre</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">1. Quand négocier ?</h2>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Après réception d'une offre écrite</strong> - Attendez d'avoir tous les détails</li>
            <li><strong>Quand vous avez plusieurs offres</strong> - Utilisez la concurrence à votre avantage</li>
            <li><strong>Si l'offre est en dessous de vos attentes</strong> - Basez-vous sur vos recherches de marché</li>
            <li><strong>Évitez de négocier lors du premier entretien</strong> - Concentrez-vous sur votre valeur ajoutée</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">2. Préparer sa négociation</h2>
          <div className="mt-2 space-y-3">
            <div>
              <h3 className="font-medium">📊 Recherchez les salaires du marché</h3>
              <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                <li>Consultez des sites comme Glassdoor, PayScale, ou Indeed Salaries</li>
                <li>Parlez à des professionnels de votre réseau</li>
                <li>Contactez des recruteurs spécialisés dans votre secteur</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">💼 Évaluez votre valeur</h3>
              <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                <li>Listez vos compétences rares et demandées</li>
                <li>Quantifiez vos réalisations passées</li>
                <li>Identifiez ce que vous apportez de unique</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">3. Au-delà du salaire : négocier le package complet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">💵 Rémunération directe</h3>
              <ul className="text-sm space-y-1">
                <li>• Salaire de base</li>
                <li>• Primes variables</li>
                <li>• 13ème mois</li>
                <li>• Stock-options/Actions</li>
                <li>• Intéressement/Participation</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">🎁 Avantages en nature</h3>
              <ul className="text-sm space-y-1">
                <li>• Jours de congés supplémentaires</li>
                <li>• Télétravail/Flexibilité</li>
                <li>• Mutuelle/Prévoyance</li>
                <li>• Voiture de fonction</li>
                <li>• Formation/Certification</li>
                <li>• Tickets restaurant</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">4. Techniques de négociation</h2>
          <div className="space-y-3 mt-2">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">🎯 L'approche gagnant-gagnant</h3>
              <p className="text-sm">Montrez comment votre demande bénéficie aussi à l'entreprise : "Avec cette rémunération, je pourrai me concentrer pleinement sur..."</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium">📈 Utilisez des fourchettes</h3>
              <p className="text-sm">Proposez une fourchette plutôt qu'un montant fixe : "Je vise une rémunération entre X et Y euros"</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium">⏰ Demandez du temps de réflexion</h3>
              <p className="text-sm">"Je vous remercie pour cette offre. Puis-je avoir 48h pour l'étudier et revenir vers vous ?"</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">5. Phrases clés pour négocier</h2>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <ul className="space-y-2 text-sm">
              <li><strong>Pour ouvrir :</strong> "Je suis très intéressé(e) par ce poste. Pouvons-nous discuter du package de rémunération ?"</li>
              <li><strong>Pour justifier :</strong> "D'après mes recherches, la fourchette pour ce type de poste est de..."</li>
              <li><strong>Pour proposer :</strong> "Serait-il possible d'envisager [montant/avantage] compte tenu de mon expérience en..."</li>
              <li><strong>Pour alternatives :</strong> "Si le salaire n'est pas négociable, pourriez-vous considérer..."</li>
              <li><strong>Pour conclure :</strong> "Je pense que nous pouvons trouver un arrangement qui convient aux deux parties."</li>
            </ul>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">6. Erreurs à éviter</h2>
          <div className="bg-red-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Ne mentez jamais</strong> sur votre salaire actuel ou vos autres offres</li>
              <li><strong>N'évoquez pas vos problèmes financiers personnels</strong> comme argument</li>
              <li><strong>Ne négociez pas par email</strong> les points importants (préférez l'oral)</li>
              <li><strong>Ne donnez pas d'ultimatum</strong> sauf si vous êtes prêt(e) à partir</li>
              <li><strong>Ne négociez pas tout en même temps</strong> - priorisez vos demandes</li>
            </ul>
          </div>
        </section>

        <Card className="mb-6" id="notes">
          <CardHeader>
            <CardTitle>📝 Mes notes de négociation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preparation" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preparation">🔍 Préparation</TabsTrigger>
                <TabsTrigger value="arguments">💪 Arguments</TabsTrigger>
                <TabsTrigger value="alternatives">🔄 Alternatives</TabsTrigger>
                <TabsTrigger value="suivi">📞 Suivi</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preparation" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Recherche de marché et préparation</h4>
                  <Textarea
                    placeholder="Notez vos recherches salariales, la fourchette du marché, vos sources d'information, votre salaire cible..."
                    value={notes.preparation}
                    onChange={(e) => setNotes(prev => ({...prev, preparation: e.target.value}))}
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="arguments" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Mes arguments de négociation</h4>
                  <Textarea
                    placeholder="Listez vos réalisations, compétences rares, valeur ajoutée, certifications, expériences uniques..."
                    value={notes.arguments}
                    onChange={(e) => setNotes(prev => ({...prev, arguments: e.target.value}))}
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="alternatives" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Solutions alternatives</h4>
                  <Textarea
                    placeholder="Si le salaire n'est pas négociable : télétravail, jours de congés, formation, primes, évolution rapide..."
                    value={notes.alternatives}
                    onChange={(e) => setNotes(prev => ({...prev, alternatives: e.target.value}))}
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="suivi" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Suivi des négociations</h4>
                  <Textarea
                    placeholder="Historique des échanges, accords obtenus, points en attente, prochaines étapes..."
                    value={notes.suivi}
                    onChange={(e) => setNotes(prev => ({...prev, suivi: e.target.value}))}
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Link to="/" className="text-sm text-gray-600 hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}