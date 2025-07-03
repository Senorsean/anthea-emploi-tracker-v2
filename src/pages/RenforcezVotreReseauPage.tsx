import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function RenforcezVotreReseauPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">🤝 Renforcez votre réseau</h1>

      <section className="mb-6">
        <p className="text-gray-700">
          Développez un réseau professionnel actif et qualifié pour multiplier vos opportunités d'emploi.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Optimisez votre profil LinkedIn</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Utilisez une photo professionnelle et souriante.</li>
          <li>Choisissez un titre accrocheur (ex : “Chef de projet IT | Ouvert aux opportunités”).</li>
          <li>Rédigez un résumé clair : ce que vous faites, ce que vous apportez, ce que vous recherchez.</li>
          <li>Détaillez vos expériences avec missions et résultats.</li>
          <li>Ajoutez des compétences et demandez des recommandations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Étendez votre réseau de manière stratégique</h2>
        <p className="text-gray-700 mb-2">
          Connectez-vous à des personnes pertinentes :
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Anciens collègues ou managers</li>
          <li>Recruteurs, RH de votre secteur</li>
          <li>Alumni de votre école ou formation</li>
        </ul>
        <p className="italic text-sm mt-2 text-gray-600">
          Astuce : personnalisez vos invitations avec un message court et bienveillant.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Soyez visible : publiez et commentez</h2>
        <p className="text-gray-700 mb-2">L’algorithme LinkedIn favorise les profils actifs :</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Partagez ce que vous apprenez en formation</li>
          <li>Commentez des posts de recruteurs ou experts</li>
          <li>Publiez un retour d'expérience ou une actualité de votre secteur</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Rejoignez et animez des groupes LinkedIn</h2>
        <p className="text-gray-700 mb-2">Exemples de groupes utiles :</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>“Reconversion professionnelle”</li>
          <li>“RH & emploi en France”</li>
          <li>Groupes de votre secteur ou école</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Utilisez LinkedIn comme un CRM</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Notez à qui vous avez écrit et quand</li>
          <li>Relancez après 7 à 10 jours si pas de réponse</li>
          <li>Entretenez les contacts utiles même sans besoin immédiat</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">🔗 Liens utiles</h2>
        <ul className="list-inside space-y-2 text-blue-700">
          <li>
            <a href="https://www.linkedin.com/mynetwork/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <ExternalLink size={16} />
              Développer mon réseau sur LinkedIn
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/learning" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <ExternalLink size={16} />
              Formations LinkedIn Learning (emploi, communication…)
            </a>
          </li>
        </ul>
      </section>

      <div className="mt-6">
        <Link to="/" className="text-sm text-gray-600 hover:underline">
          ← Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}

