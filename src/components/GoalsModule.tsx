
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

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
        'Postulez à 6-8 postes par semaine minimum',
        'Optimisez votre CV pour chaque candidature',
        'Utilisez votre réseau pour des recommandations',
        'Suivez vos candidatures après 1 semaine'
      ]
    },
    offers: {
      title: 'Décrocher une offre',
      description: 'Obtenir au moins une offre d\'emploi ce mois-ci',
      targetPerWeek: 0.25,
      currentWeek: 0,
      progress: 0,
      recommendations: [
        'Préparez-vous intensivement aux entretiens',
        'Recherchez l\'entreprise en profondeur',
        'Préparez des questions pertinentes',
        'Négociez professionnellement'
      ]
    },
    responses: {
      title: 'Augmenter mes réponses',
      description: 'Améliorer le taux de réponse aux candidatures',
      targetPerWeek: 3,
      currentWeek: 2,
      progress: 67,
      recommendations: [
        'Personnalisez chaque lettre de motivation',
        'Postulez dans les 48h après publication',
        'Utilisez des mots-clés de l\'offre',
        'Optimisez votre profil LinkedIn'
      ]
    }
  };

  const selectedGoal = goals[currentGoal];
  
  const weeklyActions = [
    {
      action: 'Postuler à 6 nouveaux postes',
      completed: 3,
      target: 6,
      status: 'in-progress'
    },
    {
      action: 'Contacter 3 personnes de mon réseau',
      completed: 1,
      target: 3,
      status: 'in-progress'
    },
    {
      action: 'Mettre à jour mon profil LinkedIn',
      completed: 1,
      target: 1,
      status: 'completed'
    },
    {
      action: 'Préparer les entretiens de la semaine',
      completed: 0,
      target: 2,
      status: 'pending'
    }
  ];

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
            <Progress value={selectedGoal.progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#b3d800]" />
              Actions de la Semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(action.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{action.action}</p>
                      <p className="text-xs text-gray-500">
                        {action.completed}/{action.target} complété
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(action.status)}>
                    {action.status === 'completed' ? 'Terminé' :
                     action.status === 'in-progress' ? 'En cours' : 'À faire'}
                  </Badge>
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
            
            <Button className="w-full mt-4 bg-[#a4007c] hover:bg-[#a4007c]/90">
              Mettre à jour mon plan d'action
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
