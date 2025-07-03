import { useState } from 'react';
import { Alert, initialAlerts } from '@/data/alerts';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return { alerts, markAsRead, unreadCount };
}
