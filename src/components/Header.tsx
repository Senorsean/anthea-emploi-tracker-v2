
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlerts } from '@/hooks/useAlerts';

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

export const Header = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [initials, setInitials] = useState<string>('A');
  const { alerts, markAsRead, unreadCount } = useAlerts();
  const navigate = useNavigate();
  
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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a4007c] to-[#e3007b] flex items-center justify-center">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div className="flex flex-col leading-tight">
              {firstName && (
                <p className="font-medium text-gray-800">Bienvenue, {firstName}</p>
              )}
              <p className="hidden sm:block text-xs text-gray-500">{currentDate}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
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
                          <span>{alert.message}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

