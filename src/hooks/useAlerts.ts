import { useState } from 'react';
import { Alert, initialAlerts } from '@/data/alerts';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)));
  };

  const cancelAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const updateAlertDate = (id: string, newDate: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, date: newDate } : a)));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return { alerts, markAsRead, cancelAlert, updateAlertDate, unreadCount };
}
