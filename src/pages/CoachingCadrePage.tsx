import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Target, FileText, BarChart3, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import CoachingDashboard from '@/components/coaching/CoachingDashboard';
import SessionsList from '@/components/coaching/SessionsList';
import ObjectivesList from '@/components/coaching/ObjectivesList';
import NotesSection from '@/components/coaching/NotesSection';
import ConsultantMonitoring from '@/components/coaching/ConsultantMonitoring';

const CoachingCadrePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { userRole, loading } = useUserRole();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/progression-carriere"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à Progression de Carrière
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Coaching Cadre
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {userRole === 'consultant' 
              ? 'Accompagnez vos candidats dans leur développement professionnel'
              : 'Suivez votre parcours de développement professionnel'
            }
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${userRole === 'consultant' || userRole === 'admin' ? 'grid-cols-5' : 'grid-cols-4'} lg:w-auto lg:inline-grid`}>
            {(userRole === 'consultant' || userRole === 'admin') && (
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Monitoring</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="objectives" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Objectifs</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
          </TabsList>

          {(userRole === 'consultant' || userRole === 'admin') && (
            <TabsContent value="monitoring" className="space-y-6">
              <ConsultantMonitoring />
            </TabsContent>
          )}

          <TabsContent value="overview" className="space-y-6">
            <CoachingDashboard userRole={userRole} />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionsList userRole={userRole} />
          </TabsContent>

          <TabsContent value="objectives" className="space-y-6">
            <ObjectivesList userRole={userRole} />
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <NotesSection userRole={userRole} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoachingCadrePage;