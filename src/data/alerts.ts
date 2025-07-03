export interface Alert {
  id: string;
  type: 'application' | 'phone' | 'video' | 'onsite';
  company: string;
  message: string;
  date: string;
  read?: boolean;
}

export const initialAlerts: Alert[] = [
  {
    id: '1',
    type: 'application',
    company: 'Google',
    message: "Relance candidature chez Google",
    date: '2025-01-03',
    read: false,
  },
  {
    id: '2',
    type: 'phone',
    company: 'Microsoft',
    message: "Relancer Microsoft après entretien téléphonique",
    date: '2025-01-05',
    read: false,
  },
  {
    id: '3',
    type: 'video',
    company: 'Amazon',
    message: "Relancer Amazon après entretien visio",
    date: '2025-01-07',
    read: false,
  },
  {
    id: '4',
    type: 'onsite',
    company: 'Salesforce',
    message: "Relancer Salesforce après entretien en présentiel",
    date: '2025-01-09',
    read: false,
  },
];
