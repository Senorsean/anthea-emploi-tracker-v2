import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

interface MFAChallengeProps {
  onVerified: () => void;
}

/**
 * Demande le code TOTP à la connexion lorsque la session est en aal1
 * alors qu'un facteur vérifié existe (élève la session en aal2).
 */
export const MFAChallenge = ({ onVerified }: MFAChallengeProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: factors, error: fErr } = await supabase.auth.mfa.listFactors();
      if (fErr) throw fErr;
      const totp = (factors?.totp ?? []).find((f) => f.status === 'verified');
      if (!totp) throw new Error('Aucun facteur TOTP vérifié sur ce compte');

      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      });
      if (cErr) throw cErr;

      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (vErr) throw vErr;
      onVerified();
    } catch (e: any) {
      setError(e?.message || 'Code invalide, réessayez');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    window.location.href = '/login';
  };

  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="flex items-center gap-2 text-purple-700">
        <ShieldCheck className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Vérification en deux étapes</h2>
      </div>
      <p className="text-sm text-gray-600">
        Saisissez le code à 6 chiffres affiché dans votre application
        d'authentification.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="mfa-code">Code</Label>
          <Input
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="tracking-[0.4em] text-center text-lg"
            autoFocus
            required
          />
        </div>

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" disabled={loading || code.length < 6} className="w-full">
          {loading ? 'Vérification…' : 'Valider'}
        </Button>
      </form>

      <button
        type="button"
        onClick={signOut}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        Se déconnecter
      </button>
    </div>
  );
};

export default MFAChallenge;
