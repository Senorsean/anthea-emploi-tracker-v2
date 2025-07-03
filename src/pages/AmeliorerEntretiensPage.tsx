import { Link } from "react-router-dom";
import { Header } from "@/components/Header";

export default function AmeliorerEntretiensPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🎯 Améliorer mes entretiens</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">1. Comment bien se préparer</h2>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Analysez l'offre d'emploi pour identifier les attentes du poste.</li>
            <li>Renseignez-vous sur l’entreprise (valeurs, secteur, culture).</li>
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
            <li>Pourquoi vous êtes ici aujourd’hui.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">3. Quelles questions poser au recruteur</h2>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Quels sont les défis du poste dans les 6 prochains mois ?</li>
            <li>Comment l’équipe est-elle structurée ?</li>
            <li>Quelles sont les perspectives d’évolution ?</li>
            <li>Comment mesurez-vous le succès sur ce poste ?</li>
            <li>Quelle est la prochaine étape du processus de recrutement ?</li>
          </ul>
        </section>

        <div className="mt-8">
          <Link to="/" className="text-sm text-gray-600 hover:underline">
            ← Retour à l’accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
