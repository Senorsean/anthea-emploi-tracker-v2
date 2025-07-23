export interface WeeklyAction {
  id: string;
  action: string;
  completed: number;
  target: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export const initialWeeklyActions: WeeklyAction[] = [
  {
    id: '1',
    action: 'Postuler à 6 nouveaux postes',
    completed: 3,
    target: 6,
    status: 'in-progress'
  },
  {
    id: '2',
    action: 'Contacter 3 personnes de mon réseau',
    completed: 1,
    target: 3,
    status: 'in-progress'
  },
  {
    id: '3',
    action: 'Mettre à jour mon profil LinkedIn',
    completed: 1,
    target: 1,
    status: 'completed'
  },
  {
    id: '4',
    action: 'Préparer les entretiens de la semaine',
    completed: 0,
    target: 2,
    status: 'pending'
  }
];

export const actionTemplates: string[] = [
  'Postuler à 10 nouveaux postes',
  'Contacter 5 personnes de mon réseau',
  'Mettre à jour mon CV',
  'Envoyer un email de suivi',
  'Préparer mes entretiens de la semaine'
];
