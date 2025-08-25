import { Link } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Mail, Phone, CheckCircle, AlertCircle, XCircle } from "lucide-react";

export default function RelancerEmployeurPage() {
  const [exemples, setExemples] = useState<{
    relanceDelai: string;
    relanceApresEntretien: string;
    relanceApresTest: string;
    relanceApresRefus: string;
  }>({
    relanceDelai: '',
    relanceApresEntretien: '',
    relanceApresTest: '',
    relanceApresRefus: ''
  });

  const timingCards = [
    {
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      title: "Premier message",
      timing: "3-5 jours après l'échéance annoncée",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <Mail className="h-5 w-5 text-orange-500" />,
      title: "Deuxième passage",
      timing: "Une semaine plus tard, ton factuel",
      color: "bg-orange-50 border-orange-200"
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: "Troisième et dernier",
      timing: "Deux semaines après, clôture polie",
      color: "bg-red-50 border-red-200"
    }
  ];

  const exempleMessages = [
    {
      type: "Remerciement immédiat",
      objet: "Remerciements - Poste [Titre] - [Votre nom]",
      message: "Bonjour [Prénom],\n\nJe vous remercie pour l'échange de ce matin concernant le poste de [titre]. Nos discussions sur [élément précis abordé] ont confirmé mon intérêt pour ce défi.\n\nComme évoqué, je reste disponible pour tout complément d'information.\n\nCordialement,\n[Votre nom]"
    },
    {
      type: "Relance après délai",
      objet: "Point sur le poste [Titre] - [Votre nom]",
      message: "Bonjour [Prénom],\n\nSuite à notre entretien du [date] pour le poste de [titre], vous m'aviez indiqué un retour sous [délai]. Je me permets de reprendre contact pour connaître l'avancement du processus.\n\nJe reste à votre disposition pour tout échange complémentaire.\n\nCordialement,\n[Votre nom]"
    },
    {
      type: "Après test technique",
      objet: "Retour test technique - Poste [Titre]",
      message: "Bonjour [Prénom],\n\nJ'ai transmis l'exercice technique pour le poste de [titre] le [date]. J'ai privilégié [méthode/approche] en tenant compte de [contrainte évoquée].\n\nJe serais ravi d'échanger avec l'équipe technique sur les choix réalisés.\n\nCordialement,\n[Votre nom]"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">📧 Relancer un employeur après un entretien</h1>
          <p className="text-gray-600 text-lg">
            Quand, comment et avec quels mots pour obtenir une réponse professionnelle
          </p>
        </div>

        <div className="grid gap-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                L'art de la relance professionnelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Après l'entretien, l'incertitude s'installe, et le doute grignote la motivation, même quand les échanges se sont bien passés. 
                Le silence peut signifier une file de priorités, pas un désintérêt.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="font-medium text-blue-800">
                  Votre message doit porter loin sans faire de bruit. Choisissez un ton professionnel, 
                  cadrez votre relance avec une demande précise et une date repère, puis laissez la place au verdict.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timing de relance */}
          <Card>
            <CardHeader>
              <CardTitle>⏰ Quand relancer après l'entretien ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p>
                  Vous avez terminé l'échange, pris vos notes et envoyé un remerciement. Accordez un court délai avant de reprendre contact, 
                  en suivant ce qui a été indiqué pendant l'entretien.
                </p>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Règles d'or :</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Envoyer un remerciement le jour même, puis patienter quelques jours</li>
                    <li>• Relire les notes pour ajuster le message à la discussion réelle</li>
                    <li>• Rester bref et factuel pour faciliter la lecture</li>
                    <li>• Conserver un ton courtois, sans pression ni sous-entendus</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {timingCards.map((card, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${card.color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {card.icon}
                        <h4 className="font-semibold">{card.title}</h4>
                      </div>
                      <p className="text-sm">{card.timing}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canal de relance */}
          <Card>
            <CardHeader>
              <CardTitle>📱 Canal de relance : email, LinkedIn ou téléphone ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Le choix du canal suit la manière dont la relation s'est construite avec le recruteur. 
                Après un échange initial, privilégiez la trace écrite.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Email</h4>
                  </div>
                  <p className="text-sm text-green-700">Structuré, formel, traçable. Idéal pour le suivi principal.</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <h4 className="font-semibold text-blue-800">LinkedIn</h4>
                  </div>
                  <p className="text-sm text-blue-700">Bref, moins formel. Complément si la conversation a démarré sur le réseau.</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-800">Téléphone</h4>
                  </div>
                  <p className="text-sm text-orange-700">Cas précis uniquement : clarification urgente ou confirmation de disponibilité.</p>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">💡 Astuce téléphone :</h4>
                <p className="text-sm">
                  Créneaux optimaux : 9h30–11h30 ou 14h30–17h. Message vocal de 15-20 secondes maximum si pas de réponse.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Exemples de messages */}
          <Card>
            <CardHeader>
              <CardTitle>✍️ Exemples de relances selon la situation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {exempleMessages.map((exemple, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{exemple.type}</Badge>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-sm">Objet : {exemple.objet}</p>
                    <Separator />
                    <pre className="text-sm whitespace-pre-wrap font-sans">{exemple.message}</pre>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Erreurs à éviter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Erreurs qui font perdre des points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-600">❌ À éviter</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Envois à des adresses génériques</li>
                    <li>• Ton agressif ou impatient</li>
                    <li>• Relances trop fréquentes</li>
                    <li>• Messages bâclés sans personnalisation</li>
                    <li>• "Des nouvelles ?" sans contexte</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">✅ À privilégier</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Formules positives : "Je reste disponible pour..."</li>
                    <li>• Personnalisation avec date d'entretien</li>
                    <li>• Question claire sur la prochaine étape</li>
                    <li>• Éléments utiles : certification, portfolio...</li>
                    <li>• Signature complète avec coordonnées</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Règle des 3 relances */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Rythme et nombre de relances : la règle des 3</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800 mb-2">Calendrier structuré :</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Premier message :</strong> 3-5 jours après l'échéance annoncée</li>
                  <li><strong>Deuxième passage :</strong> Une semaine plus tard, ton factuel</li>
                  <li><strong>Troisième et dernier :</strong> Deux semaines après, clôture polie</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="font-medium text-yellow-800">
                  ⚠️ Chaque contact doit apporter une information ou une question précise, jamais un simple "des nouvelles ?".
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                Au-delà de 3 relances, le risque d'agacer augmente. Fixez votre seuil avant de commencer, 
                puis respectez une période d'attente entre chaque tentative.
              </p>
            </CardContent>
          </Card>

          {/* Silence prolongé ou refus */}
          <Card>
            <CardHeader>
              <CardTitle>🤝 Relancer après un silence prolongé ou un refus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-600">Silence prolongé</h4>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm">
                    <p className="mb-2">Passé le délai annoncé, accordez quelques jours supplémentaires.</p>
                    <p>Pour un silence de plus de 2 semaines : message concis avec objet explicite, titre du poste et date d'échange.</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">Réponse négative</h4>
                  <div className="bg-green-50 p-4 rounded-lg text-sm">
                    <p className="mb-2">Remerciez pour le temps consacré.</p>
                    <p>Demandez un retour ciblé sur un point précis. Proposez un maintien du contact pour futures opportunités.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section pratique */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Vos modèles de relance personnalisés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Relance après délai annoncé</h4>
                  <Textarea
                    placeholder="Rédigez votre modèle de relance pour un délai dépassé..."
                    value={exemples.relanceDelai}
                    onChange={(e) => setExemples(prev => ({...prev, relanceDelai: e.target.value}))}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Remerciement post-entretien</h4>
                  <Textarea
                    placeholder="Votre modèle de remerciement à envoyer le jour même..."
                    value={exemples.relanceApresEntretien}
                    onChange={(e) => setExemples(prev => ({...prev, relanceApresEntretien: e.target.value}))}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Relance après test technique</h4>
                  <Textarea
                    placeholder="Votre relance après avoir envoyé un exercice technique..."
                    value={exemples.relanceApresTest}
                    onChange={(e) => setExemples(prev => ({...prev, relanceApresTest: e.target.value}))}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Message après refus</h4>
                  <Textarea
                    placeholder="Votre réponse professionnelle en cas de refus pour maintenir le lien..."
                    value={exemples.relanceApresRefus}
                    onChange={(e) => setExemples(prev => ({...prev, relanceApresRefus: e.target.value}))}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-between">
          <Link 
            to="/ameliorer-entretiens" 
            className="text-sm text-gray-600 hover:underline"
          >
            ← Retour à Améliorer mes entretiens
          </Link>
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:underline"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}