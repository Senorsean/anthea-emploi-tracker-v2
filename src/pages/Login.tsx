import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a4007c] to-[#e3007b] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-lg"
      >
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-[#a4007c] to-[#e3007b] flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ANTHEA RH</h1>
          <p className="text-sm text-gray-500">Connexion à votre espace</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <Button type="submit" className="w-full bg-[#a4007c] hover:bg-[#a4007c]/90">
          Se connecter
        </Button>
      </form>
    </div>
  );
};

export default Login;
