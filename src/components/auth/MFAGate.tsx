import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { MFAChallenge } from './MFAChallenge';
import { MFASetup } from './MFASetup';
import { ShieldAlert } from 'lucide-react';

type GateState = 'loading' | 'ok' | 'challenge' | 'enroll';

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      {children}
    </div>
  </div>
);

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
  </div>
);

/**
 * Garde 2FA appliquée à toutes les routes protégées :
 *  - session aal2 -> accès
 *  - facteur vérifié + session aal1 -> challenge obligatoire
 *  - admin/consultant sans facteur -> enrôlement obligatoire
 *  - candidat sans facteur -> accès (2FA optionnel)
 */
export const MFAGate = ({ children }: { children: React.ReactNode }) => {
  const { userRole, loading: roleLoading } = useUserRole();
  const [state, setState] = useState<GateState>('loading');

  const evaluate = useCallback(async () => {
    try {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasVerified = (factors?.totp ?? []).some((f) => f.status === 'verified');

      if (aal?.currentLevel === 'aal2') {
        setState('ok');
        return;
      }
      if (hasVerified && aal?.nextLevel === 'aal2') {
        setState('challenge');
        return;
      }
      if (userRole === 'admin' || userRole === 'consultant') {
        setState('enroll');
        return;
      }
      setState('ok');
    } catch {
      // En cas d'erreur réseau, ne pas bloquer l'utilisateur déjà authentifié
      setState('ok');
    }
  }, [userRole]);

  useEffect(() => {
    if (!roleLoading) evaluate();
  }, [roleLoading, evaluate]);

  if (state === 'loading' || roleLoading) return <Spinner />;

  if (state === 'challenge') {
    return (
      <Centered>
        <MFAChallenge onVerified={evaluate} />
      </Centered>
    );
  }

  if (state === 'enroll') {
    return (
      <Centered>
        <div className="mb-4 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            La double authentification est obligatoire pour votre rôle. Configurez-la
            pour continuer.
          </span>
        </div>
        <MFASetup onEnrolled={evaluate} />
      </Centered>
    );
  }

  return <>{children}</>;
};

export default MFAGate;
