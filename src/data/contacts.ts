export interface Contact {
  id: string;
  name: string;
  company: string;
  position: string;
  email: string;
  linkedin?: string;
  status: 'pending' | 'contacted' | 'replied' | 'referred';
  dateAdded: string; // YYYY-MM-DD
  notes?: string;
}

export const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'Olivia Bennett',
    company: 'Cultivated Culture',
    position: 'Product Manager',
    email: 'olivia@cultivatedculture.com',
    linkedin: 'in/obennett',
    status: 'replied',
    dateAdded: '2025-01-02',
    notes: 'Très intéressée par mon profil'
  },
  {
    id: '2',
    name: 'James Whitaker',
    company: 'Cultivated Culture',
    position: 'Senior Product Manager',
    email: 'james@cultivatedculture.com',
    linkedin: 'in/james-whitaker',
    status: 'contacted',
    dateAdded: '2025-01-01'
  },
  {
    id: '3',
    name: 'Sofia Ramirez',
    company: 'Cultivated Culture',
    position: 'Product Marketing Manager',
    email: 'sofia@cultivatedculture.com',
    linkedin: 'in/sofia-r',
    status: 'replied',
    dateAdded: '2024-12-30'
  },
  {
    id: '4',
    name: 'Marcus Chen',
    company: 'Amazon',
    position: 'Product Manager',
    email: 'mchen@amazon.com',
    linkedin: 'in/mchen',
    status: 'pending',
    dateAdded: '2024-12-28'
  }
];
