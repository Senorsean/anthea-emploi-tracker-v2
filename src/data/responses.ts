export interface Response {
  id: string;
  jobId: string;
  date: string; // YYYY-MM-DD
}

export const initialResponses: Response[] = [
  { id: '1', jobId: '1', date: '2025-01-03' },
  { id: '2', jobId: '3', date: '2024-12-30' },
  { id: '3', jobId: '4', date: '2024-12-26' },
  { id: '4', jobId: '2', date: '2024-10-10' },
  // Refusal response for the "Agent secret" position
  { id: '5', jobId: '5', date: '2025-01-11' },
];
