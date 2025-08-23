import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { AdminPanel } from '@/components/AdminPanel';
import { ConsultantPanel } from '@/components/ConsultantPanel';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Lock } from 'lucide-react';

const RoleManagement = () => {
  const { userRole, loading, candidateModules } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'recherche_emploi': return 'Recherche Emploi';
      case 'definition_projet_pro': return 'Définition Projet Pro';
      case 'progression_carriere': return 'Progression Carrière';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recherche_emploi': return 'bg-blue-100 text-blue-800';
      case 'definition_projet_pro': return 'bg-purple-100 text-purple-800';
      case 'progression_carriere': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Gestion des Rôles et Modules</h1>
        <p className="text-xl text-muted-foreground">
          Interface de gestion selon votre rôle dans Anthea
        </p>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Votre rôle : {userRole}
        </Badge>
      </div>

      {userRole === 'admin' && (
        <div className="space-y-6">
          <AdminPanel />
        </div>
      )}

      {userRole === 'consultant' && (
        <div className="space-y-6">
          <ConsultantPanel />
        </div>
      )}

      {userRole === 'candidat' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Mes Modules Assignés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidateModules.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Voici les modules auxquels vous avez accès :
                  </p>
                  <div className="grid gap-4">
                    {candidateModules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{module.name}</h3>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(module.category)}>
                            {getCategoryLabel(module.category)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun module assigné</h3>
                  <p className="text-muted-foreground">
                    Contactez votre consultant pour obtenir l'accès aux modules.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!userRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Accès en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Votre compte n'a pas encore été configuré par un administrateur. 
              Veuillez contacter votre consultant pour obtenir l'accès aux modules.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoleManagement;