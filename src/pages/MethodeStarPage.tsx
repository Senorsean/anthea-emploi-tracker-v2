import { Link } from "react-router-dom";
import { Header } from "@/components/Header";

export default function MethodeStarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">⭐ Méthode STAR</h1>
        <p className="mb-4">
          La méthode STAR (Situation, Tâche, Action, Résultat) permet de structurer
          vos réponses pour illustrer clairement vos expériences professionnelles.
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>
            <strong>Situation</strong> – décrivez le contexte ou le défi rencontré.
          </li>
          <li>
            <strong>Tâche</strong> – expliquez votre rôle et vos responsabilités.
          </li>
          <li>
            <strong>Action</strong> – détaillez ce que vous avez entrepris pour
            atteindre l'objectif.
          </li>
          <li>
            <strong>Résultat</strong> – terminez par les effets concrets de vos
            actions.
          </li>
        </ol>
        <p className="mb-6">
          Utilisez cette méthode pour préparer des exemples précis avant vos
          entretiens.
        </p>
        <div className="mt-8">
          <Link
            to="/ameliorer-entretiens"
            className="text-sm text-gray-600 hover:underline"
          >
            ← Retour à la page Améliorer mes entretiens
          </Link>
        </div>
      </main>
    </div>
  );
}
