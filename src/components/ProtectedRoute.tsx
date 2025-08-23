import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoute?: string;
}

export const ProtectedRoute = ({ children, requiredRoute }: ProtectedRouteProps) => {
  const { userRole, loading, hasModuleAccess } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no role is assigned, redirect to a role assignment page or show message
  if (!userRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
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
      </div>
    );
  }

  // If a specific route is required and user doesn't have access
  if (requiredRoute && !hasModuleAccess(requiredRoute)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Accès non autorisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Vous n'avez pas accès à ce module. Contactez votre consultant pour 
              obtenir les permissions nécessaires.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};