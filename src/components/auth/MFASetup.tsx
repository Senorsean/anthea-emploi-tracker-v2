import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, Copy, Check } from 'lucide-react';

interface MFASetupProps {
  onEnrolled?: () => void;
  onCancel?: () => void;
}

/**
 * TOTP enrollment: génère un facteur, affiche le QR + secret,
 * puis vérifie un code à 6 chiffres pour activer le 2FA.
 */
export const MFASetup = ({ onEnrolled, onCancel }: MFASetupProps) => {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const startEnroll = async () => {
    setError('');
    setLoading(true);
    try {
      // Purge des facteurs non vérifiés (évite les collisions de friendlyName)
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const stale = (factors?.all ?? []).filter((f) => f.status === 'unverified');
      for (const f of stale) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `authenticator-${Date.now()}`,
      });
      if (enrollError) throw enrollError;
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'activation du 2FA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startEnroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setError('');
    setVerifying(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr) throw cErr;
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (vErr) throw vErr;
      onEnrolled?.();
    } catch (e: any) {
      setError(e?.message || 'Code invalide, réessayez');
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard indisponible */
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Préparation du 2FA…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-purple-700">
        <ShieldCheck className="h-5 w-5" />
        <h3 className="font-semibold">Activer la double authentification</h3>
      </div>
      <p className="text-sm text-gray-600">
        Scannez ce QR code avec une application d'authentification (Google
        Authenticator, Authy, 1Password…), puis saisissez le code à 6 chiffres.
      </p>

      {qr && (
        <div className="flex justify-center">
          <img
            src={qr}
            alt="QR code 2FA"
            className="h-44 w-44 rounded-md border border-gray-200 bg-white p-2"
          />
        </div>
      )}

      {secret && (
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">
            Clé manuelle (si vous ne pouvez pas scanner)
          </Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-gray-100 px-2 py-1 text-xs">
              {secret}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={copySecret}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="totp-code">Code de vérification</Label>
          <Input
            id="totp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="tracking-[0.4em] text-center text-lg"
            required
          />
        </div>

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={verifying || code.length < 6} className="flex-1">
            {verifying ? 'Vérification…' : 'Activer le 2FA'}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MFASetup;
