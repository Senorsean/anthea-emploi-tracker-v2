import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MFASetup } from './MFASetup';
import { ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';

/**
 * Section "Sécurité" des Réglages : état du 2FA, activation, désactivation.
 */
export const MFAManage = () => {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      setEnabled((data?.totp ?? []).some((f) => f.status === 'verified'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const disable = async () => {
    setBusy(true);
    setMessage('');
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      for (const f of data?.totp ?? []) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      setMessage('Double authentification désactivée.');
      setSetupOpen(false);
      await refresh();
    } catch (e: any) {
      setMessage(e?.message || 'Erreur lors de la désactivation');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enabled ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <ShieldOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <h2 className="font-semibold">Double authentification (2FA)</h2>
            <p className="text-sm text-gray-500">
              {loading
                ? 'Chargement…'
                : enabled
                ? 'Activée — un code est demandé à chaque connexion.'
                : 'Désactivée — protégez votre compte avec une app d’authentification.'}
            </p>
          </div>
        </div>
        {!loading && (
          <Loader2
            className={`h-4 w-4 animate-spin text-gray-300 ${busy ? '' : 'invisible'}`}
          />
        )}
      </div>

      {!loading && !enabled && !setupOpen && (
        <Button onClick={() => setSetupOpen(true)}>Activer le 2FA</Button>
      )}

      {!loading && !enabled && setupOpen && (
        <div className="pt-2 border-t border-gray-100">
          <MFASetup
            onEnrolled={async () => {
              setSetupOpen(false);
              setMessage('Double authentification activée.');
              await refresh();
            }}
            onCancel={() => setSetupOpen(false)}
          />
        </div>
      )}

      {!loading && enabled && (
        <Button variant="outline" onClick={disable} disabled={busy}>
          Désactiver le 2FA
        </Button>
      )}

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default MFAManage;
