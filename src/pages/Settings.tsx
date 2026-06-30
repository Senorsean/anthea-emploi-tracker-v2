import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/Header';
import { MFAManage } from '@/components/auth/MFAManage';

const Settings = () => {
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [initials, setInitials] = useState('A');
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const metadata: any = user.user_metadata || {};
        setFirstName(
          metadata.first_name || metadata.firstName || ''
        );
        setAvatarUrl(metadata.avatar_url || null);
        const name =
          metadata.full_name ||
          metadata.fullName ||
          metadata.name ||
          [metadata.first_name || metadata.firstName, metadata.last_name]
            .filter(Boolean)
            .join(' ');
        if (name) {
          setInitials(
            name
              .trim()
              .split(' ')
              .slice(0, 2)
              .map((p: string) => p[0])
              .join('')
              .toUpperCase()
          );
        } else if (user.email) {
          setInitials(user.email[0].toUpperCase());
        }
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const updates: any = { data: { first_name: firstName } };
    if (password) {
      updates.password = password;
    }
    const { error: updateError } = await supabase.auth.updateUser(updates);
    if (updateError) {
      setMessage(updateError.message);
      return;
    }

    if (avatarFile) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const filePath = `${user.id}/${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('avatars').getPublicUrl(filePath);
          await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
          setAvatarUrl(publicUrl);
        }
      }
    }

    setPassword('');
    setMessage('Modifications enregistrées');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="avatar" />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar">Photo</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit">Enregistrer</Button>
        </form>

        <div className="pt-2">
          <h2 className="text-lg font-semibold mb-3">Sécurité</h2>
          <MFAManage />
        </div>
      </main>
    </div>
  );
};

export default Settings;
