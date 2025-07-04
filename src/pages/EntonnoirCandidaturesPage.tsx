import { Link } from "react-router-dom";
import { Header } from "@/components/Header";

export default function EntonnoirCandidaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-4">📊 Pourquoi un Entonnoir de Candidatures ?</h1>
        <p>Utilisez les données pour plus de contrôle et de prévisibilité.</p>
        <p>
          La plupart des chercheurs d'emploi suivent leur recherche d'une manière ou d'une autre.
          Ils n'utilisent pas ces données pour comprendre ce qui fonctionne et ce qui ne fonctionne pas.
        </p>
        <p>
          Emploi Tracker se distingue des autres outils de suivi des candidatures car il utilise les données
          de votre recherche pour identifier les points faibles et les actions à entreprendre pour obtenir les
          résultats escomptés.
        </p>
        <div className="mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:underline">
            ← Retour au tableau de bord
          </Link>
        </div>
      </main>
    </div>
  );
}
