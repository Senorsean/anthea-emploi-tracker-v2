import { useState, useEffect } from 'react';
import { Contact, initialContacts } from '@/data/contacts';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setContacts(initialContacts);
        setCurrentUserId(null);
        return;
      }

      if (currentUserId && currentUserId !== user.id) {
        setContacts(initialContacts);
      }
      
      setCurrentUserId(user.id);
      
      const userSpecificKey = `contacts_${user.id}`;
      const saved = localStorage.getItem(userSpecificKey);
      
      if (saved) {
        try {
          const parsedContacts = JSON.parse(saved);
          setContacts(parsedContacts);
          return;
        } catch (err) {
          console.error('Failed to parse saved contacts', err);
        }
      }
      
      try {
        const { data } = await downloadJson<Contact[]>('data-emploi-tracker', `${user.id}/contacts.json`);
        if (data) {
          setContacts(data);
          localStorage.setItem(userSpecificKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to load contacts from Supabase:', error);
      }
    };

    initializeUserData();
  }, [currentUserId]);

  useEffect(() => {
    const saveContacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userSpecificKey = `contacts_${user.id}`;
      localStorage.setItem(userSpecificKey, JSON.stringify(contacts));
      
      try {
        await uploadJson('data-emploi-tracker', `${user.id}/contacts.json`, contacts);
      } catch (error) {
        console.error('Failed to save contacts to Supabase:', error);
      }
    };

    if (currentUserId) {
      saveContacts();
    }
  }, [contacts, currentUserId]);

  return { contacts, setContacts };
}
