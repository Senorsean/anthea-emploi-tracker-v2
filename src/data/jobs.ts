
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  label: string;
  url?: string;
  dateAdded: string;
  interviewDate?: string;
  offerStatus?:
    | 'pending'
    | 'follow_up_pending'
    | 'filled'
    | 'suspended'
    | 'first_interview'
    | 'second_interview'
    | 'rejected';
  offerType?: 'job_offer' | 'spontaneous_application' | 'network';
}

export const initialJobs: Record<string, Job[]> = {
  offer: [
    {
      id: '1',
      title: 'Product Manager',
      company: 'Google',
      location: 'Paris, FR',
      priority: 'High',
      label: 'Tech',
      dateAdded: '2025-01-02',
      offerStatus: 'pending',
      offerType: 'job_offer'
    },
    {
      id: '2',
      title: 'Marketing Manager',
      company: 'Microsoft',
      location: 'Lyon, FR',
      priority: 'Medium',
      label: 'Marketing',
      dateAdded: '2025-01-01',
      offerStatus: 'pending',
      offerType: 'job_offer'
    }
  ],
  applied: [
    {
      id: '3',
      title: 'Senior Product Manager',
      company: 'Amazon',
      location: 'Remote',
      priority: 'High',
      label: 'Tech',
      url: 'https://example.com',
      dateAdded: '2024-12-28',
      offerStatus: 'follow_up_pending',
      offerType: 'job_offer'
    }
  ],
  screening: [
    {
      id: '4',
      title: 'Product Marketing Manager',
      company: 'Salesforce',
      location: 'Paris, FR',
      priority: 'High',
      label: 'Marketing',
      dateAdded: '2024-12-25',
      offerStatus: 'first_interview',
      offerType: 'network'
    }
  ],
  interview: [
    {
      id: '5',
      title: 'Agent secret',
      company: 'Agence 007',
      location: 'Londres, UK',
      priority: 'High',
      label: 'Espionnage',
      dateAdded: '2025-01-03',
      interviewDate: '2025-01-10',
      offerStatus: 'second_interview',
      offerType: 'network'
    }
  ],
  final: []
};
