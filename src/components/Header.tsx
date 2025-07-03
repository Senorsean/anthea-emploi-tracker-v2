
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Settings, LogOut } from 'lucide-react';

interface UserMetadata {
  first_name?: string;
  firstName?: string;
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

export const Header = () => {
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (user) {
          setFirstName(getFirstName(user.user_metadata as UserMetadata, user.email));
        }
      })
      .catch(() => {
        setFirstName('');
      });
  }, []);

  const currentDate = new Date().toLocaleDateString('fr-FR');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a4007c] to-[#e3007b] flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ANTHEA RH</h1>
                <p className="text-xs text-gray-500">Suivi de Recherche d'Emploi</p>
              </div>
            </div>
            <div className="hidden sm:block text-sm">
              {firstName && (
                <p className="font-medium text-gray-800">Bienvenue {firstName}</p>
              )}
              <p className="text-xs text-gray-500">{currentDate}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#e3007b] rounded-full text-xs"></span>
            </Button>
            <Button variant="ghost" size="sm">
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
