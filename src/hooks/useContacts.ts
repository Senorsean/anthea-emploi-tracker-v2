import { useState, useEffect } from 'react';
import { Contact, initialContacts } from '@/data/contacts';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  useEffect(() => {
    const saved = localStorage.getItem('contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
        return;
      } catch (err) {
        console.error('Failed to parse saved contacts', err);
      }
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await downloadJson<Contact[]>('data-emploi-tracker', `${user.id}/contacts.json`);
      if (data) setContacts(data);
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
    const save = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await uploadJson('data-emploi-tracker', `${user.id}/contacts.json`, contacts);
    };
    save();
  }, [contacts]);

  return { contacts, setContacts };
}
