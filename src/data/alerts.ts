export interface Alert {
  id: string;
  type: 'application' | 'phone' | 'video' | 'onsite';
  company: string;
  message: string;
  date: string;
  read?: boolean;
}

// No default manual alerts are provided.
export const initialAlerts: Alert[] = [];
