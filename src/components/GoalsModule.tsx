
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Calendar, CheckCircle, AlertCircle, Pencil, Plus, Trash, Upload } from 'lucide-react';
import type { WeeklyAction } from '@/data/weeklyActions';
import { initialWeeklyActions, actionTemplates } from '@/data/weeklyActions';
import { uploadJson } from '@/integrations/supabase/storage';
import AddWeeklyActionModal from './AddWeeklyActionModal';

export const GoalsModule = () => {
  const [currentGoal, setCurrentGoal] = useState('interviews');

  const goals = {
    interviews: {
      title: 'Décrocher plus d\'entretiens',
      description: 'Augmenter le nombre d\'entretiens obtenus par semaine',
      targetPerWeek: 2,
      currentWeek: 1,
      progress: 50,
      recommendations: [
        "Postulez à au moins 5 postes par jour pour multiplier vos chances",
        "Contactez chaque jour un recruteur ou RH via LinkedIn",
        "Préparez un pitch de présentation clair de 30 secondes",
        "Relancez systématiquement vos candidatures après une semaine"
      ]
    },
    offers: {
      title: 'Décrocher une offre',
      description: 'Obtenir au moins une offre d\'emploi ce mois-ci',
      targetPerWeek: 0.25,
      currentWeek: 0,
      progress: 0,
      recommendations: [
        "Entraînez-vous à des simulations d'entretiens chaque semaine",
        "Ciblez trois entreprises clés et adaptez votre candidature",
        "Demandez à deux contacts de vous recommander",
        "Suivez vos démarches dans un tableau pour relancer efficacement"
      ]
    },
    responses: {
      title: 'Augmenter mes réponses',
      description: 'Améliorer le taux de réponse aux candidatures',
      targetPerWeek: 3,
      currentWeek: 2,
      progress: 67,
      recommendations: [
        "Personnalisez chaque email ou lettre de motivation",
        "Postulez dans les 24h suivant la publication de l'offre",
        "Mettez à jour votre profil sur les job boards et LinkedIn",
        "Demandez un retour en cas de silence après dix jours"
      ]
    }
  };

  const selectedGoal = goals[currentGoal];

  const [weeklyActions, setWeeklyActions] = useState<WeeklyAction[]>(initialWeeklyActions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAction, setEditAction] = useState<WeeklyAction | null>(null);

  const addAction = (data: Omit<WeeklyAction, 'id'>) => {
    const newAction: WeeklyAction = {
      ...data,
      id: Date.now().toString()
    };
    setWeeklyActions(prev => [...prev, newAction]);
  };

  const updateAction = (data: WeeklyAction) => {
    setWeeklyActions(prev => prev.map(a => a.id === data.id ? data : a));
  };

  const deleteAction = (id: string) => {
    setWeeklyActions(prev => prev.filter(a => a.id !== id));
  };

  const exportWeeklyActions = async () => {
    await uploadJson('data-emploi-tracker', 'weekly-actions.json', weeklyActions);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-[#a4007c]" />
          <h2 className="text-2xl font-bold text-gray-900">Objectifs Personnalisés</h2>
        </div>
        
        <Select value={currentGoal} onValueChange={setCurrentGoal}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interviews">Décrocher plus d'entretiens</SelectItem>
            <SelectItem value="offers">Décrocher une offre</SelectItem>
            <SelectItem value="responses">Augmenter mes réponses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Goal Overview */}
      <Card className="bg-gradient-to-r from-[#a4007c]/5 to-[#e3007b]/5 border-[#a4007c]/20">
        <CardHeader>
          <CardTitle className="text-xl text-[#a4007c]">{selectedGoal.title}</CardTitle>
          <p className="text-gray-600">{selectedGoal.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#a4007c] mb-2">
                {selectedGoal.currentWeek}
              </div>
              <div className="text-sm text-gray-600">Cette semaine</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#e3007b] mb-2">
                {selectedGoal.targetPerWeek}
              </div>
              <div className="text-sm text-gray-600">Objectif/semaine</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#b3d800] mb-2">
                {selectedGoal.progress}%
              </div>
              <div className="text-sm text-gray-600">Progression</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression hebdomadaire</span>
              <span className="text-sm text-gray-500">{selectedGoal.progress}%</span>
            </div>
            <Progress
              value={selectedGoal.progress}
              indicatorClassName="bg-[#a4007c]"
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Actions */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#b3d800]" />
              Actions de la Semaine
            </CardTitle>
            <Button size="icon" variant="outline" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyActions.map(action => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(action.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{action.action}</p>
                      <p className="text-xs text-gray-500">
                        {action.completed}/{action.target} complété
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(action.status)}>
                      {action.status === 'completed' ? 'Terminé' :
                       action.status === 'in-progress' ? 'En cours' : 'À faire'}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => setEditAction(action)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteAction(action.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#e3007b]" />
              Recommandations IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedGoal.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-[#a4007c] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button className="flex-1 bg-[#a4007c] hover:bg-[#a4007c]/90">
                Mettre à jour mon plan d'action
              </Button>
              <Button variant="outline" onClick={exportWeeklyActions} className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddWeeklyActionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(data) => addAction({ ...data })}
        templates={actionTemplates}
      />

      {editAction && (
        <AddWeeklyActionModal
          isOpen={!!editAction}
          onClose={() => setEditAction(null)}
          onSubmit={(data) => {
            updateAction({ ...editAction, ...data });
            setEditAction(null);
          }}
          initialData={editAction}
          templates={actionTemplates}
        />
      )}
    </div>
  );
};
