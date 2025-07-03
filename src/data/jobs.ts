export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  label: string;
  url?: string;
  dateAdded: string;
}

export const initialJobs: Record<string, Job[]> = {
  targeted: [
    {
      id: '1',
      title: 'Product Manager',
      company: 'Google',
      location: 'Paris, FR',
      priority: 'High',
      label: 'Tech',
      dateAdded: '2025-01-02'
    },
    {
      id: '2',
      title: 'Marketing Manager',
      company: 'Microsoft',
      location: 'Lyon, FR',
      priority: 'Medium',
      label: 'Marketing',
      dateAdded: '2025-01-01'
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
      dateAdded: '2024-12-28'
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
      dateAdded: '2024-12-25'
    }
  ],
  interview: [],
  final: [],
  offer: []
};
