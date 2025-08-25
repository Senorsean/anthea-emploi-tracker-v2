import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AmeliorerEntretiensPage() {
  const [notes, setNotes] = useState<{
    dailyActions: string;
    postInterview: string;
    cvStrategy: string;
    jobIdeas: string;
  }>({
    dailyActions: '',
    postInterview: '',
    cvStrategy: '',
    jobIdeas: ''
  });

  // Gérer le scroll vers l'ancre
  useEffect(() => {
    if (window.location.hash === '#notes') {
      setTimeout(() => {
        const element = document.getElementById('notes');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Petit délai pour s'assurer que la page est chargée
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🎯 Améliorer mes entretiens</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">1. Comment bien se préparer</h2>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Analysez l'offre d'emploi pour identifier les attentes du poste.</li>
            <li>Renseignez-vous sur l'entreprise (valeurs, secteur, culture).</li>
            <li>
              Préparez des exemples concrets de vos expériences passées (
              <Link to="/methode-star" className="text-blue-600 hover:underline">
                méthode STAR
              </Link>
              ).
            </li>
            <li>Entraînez-vous à répondre aux questions classiques (forces, faiblesses, motivations…).</li>
            <li>Préparez votre tenue, votre itinéraire ou le lien de visio.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">2. Comment se présenter efficacement</h2>
          <p className="mt-2">
            Utilisez la technique du <strong>pitch de 2 minutes</strong> :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Votre parcours en résumé.</li>
            <li>Ce que vous avez accompli et ce qui vous motive.</li>
            <li>Pourquoi vous êtes ici aujourd'hui.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">3. Quelles questions poser au recruteur</h2>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Quels sont les défis du poste dans les 6 prochains mois ?</li>
            <li>Comment l'équipe est-elle structurée ?</li>
            <li>Quelles sont les perspectives d'évolution ?</li>
            <li>Comment mesurez-vous le succès sur ce poste ?</li>
            <li>Quelle est la prochaine étape du processus de recrutement ?</li>
          </ul>
        </section>

        <section className="mb-6 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🎯 Entraînez-vous maintenant !</h2>
          <p className="mb-4">
            Préparez-vous concrètement avec notre simulateur d'entretien interactif.
            Répondez aux questions les plus courantes et évaluez votre niveau de préparation.
          </p>
          <Link 
            to="/preparation-entretien" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Commencer l'entraînement →
          </Link>
        </section>

        <section className="mb-6 bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📧 Et après l'entretien ?</h2>
          <p className="mb-4">
            Découvrez comment relancer professionnellement un recruteur après un entretien : 
            timing optimal, messages types, erreurs à éviter et stratégies pour rester visible sans être intrusif.
          </p>
          <Link 
            to="/relancer-employeur" 
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Apprendre à relancer →
          </Link>
        </section>

        <Card className="mb-6" id="notes">
          <CardHeader>
            <CardTitle>📝 Mes notes personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dailyActions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dailyActions">📅 Actions</TabsTrigger>
                <TabsTrigger value="postInterview">💭 Post-entretien</TabsTrigger>
                <TabsTrigger value="cvStrategy">📄 CV/Stratégie</TabsTrigger>
                <TabsTrigger value="jobIdeas">💡 Idées postes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dailyActions" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Suivi quotidien des actions</h4>
                  <Textarea
                    placeholder="Notez vos actions quotidiennes : candidatures envoyées, contacts pris, relances effectuées, formations suivies..."
                    value={notes.dailyActions}
                    onChange={(e) => setNotes(prev => ({...prev, dailyActions: e.target.value}))}
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="postInterview" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Réflexions post-entretien</h4>
                  <Textarea
                    placeholder="Analysez vos entretiens : points forts, axes d'amélioration, questions posées, ressentis, feedbacks reçus..."
                    value={notes.postInterview}
                    onChange={(e) => setNotes(prev => ({...prev, postInterview: e.target.value}))}
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="cvStrategy" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Évolutions du CV ou de la stratégie</h4>
                  <Textarea
                    placeholder="Notez les améliorations à apporter à votre CV, votre présentation, votre stratégie de recherche d'emploi..."
                    value={notes.cvStrategy}
                    onChange={(e) => setNotes(prev => ({...prev, cvStrategy: e.target.value}))}
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="jobIdeas" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Idées de postes à creuser</h4>
                  <Textarea
                    placeholder="Listez les entreprises intéressantes, postes à explorer, secteurs d'activité prometteurs, contacts à développer..."
                    value={notes.jobIdeas}
                    onChange={(e) => setNotes(prev => ({...prev, jobIdeas: e.target.value}))}
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