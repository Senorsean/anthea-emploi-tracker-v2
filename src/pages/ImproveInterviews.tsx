import React from 'react';
import { Header } from '@/components/Header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ImproveInterviews = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-semibold mb-1">
              🚨 Goulot d'étranglement détecté: Interview Success Rate
            </p>
            <p className="text-sm mb-4">
              Votre taux de succès en entretien est 50% plus bas que recommandé. Concentrez-vous sur l'amélioration pour débloquer votre recherche d'emploi.
            </p>
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              <a href="https://example.com/interview-tips" target="_blank" rel="noopener noreferrer">
                Améliorer mes entretiens
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/">Retour au tableau de bord</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ImproveInterviews;
