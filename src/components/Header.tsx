
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, Settings, LogOut, Pencil, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { useAlerts } from '@/hooks/useAlerts';
import type { Alert } from '@/data/alerts';

const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

interface UserMetadata {
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  name?: string;
  full_name?: string;
  fullName?: string;
}

const getFirstName = (metadata: UserMetadata, email?: string) => {
  const name =
    metadata.first_name ||
    metadata.firstName ||
    metadata.name ||
    metadata.full_name ||
    metadata.fullName;
  if (name) return name.split(' ')[0];
  if (email) return email.split('@')[0];
  return 'Utilisateur';
};

const getInitials = (metadata: UserMetadata, email?: string) => {
  const name =
    metadata.full_name ||
    metadata.fullName ||
    metadata.name ||
    [metadata.first_name || metadata.firstName, metadata.last_name || metadata.lastName]
      .filter(Boolean)
      .join(' ');

  if (name) {
    return name
      .trim()
      .split(' ')
      .filter((part) => part)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  if (email) return email[0]?.toUpperCase() || 'A';

  return 'A';
};

export interface HeaderProps {
  onLogoClick?: () => void;
}

export const Header = ({ onLogoClick }: HeaderProps) => {
  const [firstName, setFirstName] = useState<string>('');
  const [initials, setInitials] = useState<string>('A');
  const { alerts, markAsRead, cancelAlert, updateAlertDate, unreadCount } = useAlerts();

  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const handleLogout = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      window.location.href = '/login';
    } catch (error) {
      // Force redirect even if logout fails
      window.location.href = '/login';
    }
  };
  
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (user) {
          const metadata = user.user_metadata as UserMetadata;
          setFirstName(getFirstName(metadata, user.email));
          setInitials(getInitials(metadata, user.email));
        }
      })
      .catch(() => {
        setFirstName('');
        setInitials('A');
      });
  }, []);

  const currentDate = new Date().toLocaleDateString('fr-FR');

  return (
    <>
      <header className="relative bg-gradient-to-r from-blue-500 to-violet-500 shadow-sm border-b border-gray-200">
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link to="/settings" className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a4007c] to-[#e3007b] flex items-center justify-center">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div className="flex flex-col leading-tight">
              {firstName && (
                <p className="font-medium text-white">Bienvenue, {firstName}</p>
              )}
              <p className="hidden sm:block text-xs text-white">{currentDate}</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#e3007b] text-white rounded-full text-[10px] flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <h4 className="font-medium mb-2">Alertes de Relance</h4>
                {alerts.filter(a => !a.read).length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune alerte</p>
                ) : (
                  <ul className="space-y-2">
                    {alerts.map(alert => (
                      !alert.read && (
                        <li key={alert.id} className="flex justify-between items-start text-sm">
                          <div>
                            <p>{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(alert.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingAlert(alert)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => cancelAlert(alert.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(alert.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 text-white" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
        <div className="mt-6 text-center text-white">
          <Link to="/" onClick={onLogoClick}>
            <img
              src="https://dev.anthea-rh.com/wp-content/uploads/2022/12/logtransp.png"
              alt="Anthea"
              className="mx-auto mb-4 w-32"
            />
          </Link>
          <h1 className="text-2xl font-bold mb-1">emploi Tracker</h1>
          {/* Heading moved below the banner */}
          <p className="text-sm sm:text-base">
            Gérez votre recherche d'emploi de manière professionnelle avec ANTHEA RH
          </p>
        </div>
      </div>
      <Dialog open={!!editingAlert} onOpenChange={() => setEditingAlert(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Modifier la date</DialogTitle>
          </DialogHeader>
          <input
            type="date"
            value={editingAlert?.date || ''}
            onChange={e =>
              setEditingAlert(prev => (prev ? { ...prev, date: e.target.value } : null))
            }
            className="w-full border rounded p-2"
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setEditingAlert(null)} className="flex-1">
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingAlert) {
                  updateAlertDate(editingAlert.id, editingAlert.date);
                  setEditingAlert(null);
                }
              }}
              className="flex-1 bg-[#a4007c] hover:bg-[#a4007c]/90"
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
    <h2 className="mt-4 text-center text-2xl font-bold text-[#a4007c]">
      Tableau de Bord - Recherche d'Emploi
    </h2>
  </>
  );
};

