import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

interface AlertSettings {
  no_application_days: number;
  objective_overdue_days: number;
  no_session_days: number;
  session_to_plan_days: number;
  low_progress_threshold: number;
}

interface AlertSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsSaved: () => void;
}

const DEFAULT_SETTINGS: AlertSettings = {
  no_application_days: 14,
  objective_overdue_days: 7,
  no_session_days: 30,
  session_to_plan_days: 21,
  low_progress_threshold: 25,
};

const AlertSettingsModal = ({ open, onOpenChange, onSettingsSaved }: AlertSettingsModalProps) => {
  const [settings, setSettings] = useState<AlertSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('consultant_alert_settings' as any)
        .select('*')
        .eq('consultant_id', user.id)
        .single() as any;

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          no_application_days: (data as any).no_application_days,
          objective_overdue_days: (data as any).objective_overdue_days,
          no_session_days: (data as any).no_session_days,
          session_to_plan_days: (data as any).session_to_plan_days,
          low_progress_threshold: (data as any).low_progress_threshold,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Valider les valeurs
      if (
        settings.no_application_days < 1 ||
        settings.objective_overdue_days < 1 ||
        settings.no_session_days < 1 ||
        settings.session_to_plan_days < 1 ||
        settings.low_progress_threshold < 1 ||
        settings.low_progress_threshold > 100
      ) {
        toast({
          title: 'Valeurs invalides',
          description: 'Veuillez entrer des valeurs positives valides',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('consultant_alert_settings' as any)
        .upsert({
          consultant_id: user.id,
          ...settings,
        });

      if (error) throw error;

      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos préférences d\'alerte ont été mises à jour',
      });

      onSettingsSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration des alertes
          </DialogTitle>
          <DialogDescription>
            Personnalisez les seuils d'alerte selon vos préférences de suivi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Candidatures */}
          <div className="space-y-2">
            <Label htmlFor="no_application_days" className="text-base font-semibold">
              Inactivité de candidatures
            </Label>
            <p className="text-sm text-muted-foreground">
              Déclencher une alerte si aucune candidature depuis :
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="no_application_days"
                type="number"
                min="1"
                value={settings.no_application_days}
                onChange={(e) =>
                  setSettings({ ...settings, no_application_days: parseInt(e.target.value) || 1 })
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">jours</span>
            </div>
          </div>

          {/* Objectifs en retard */}
          <div className="space-y-2">
            <Label htmlFor="objective_overdue_days" className="text-base font-semibold">
              Objectifs en retard
            </Label>
            <p className="text-sm text-muted-foreground">
              Déclencher une alerte si un objectif dépasse sa date cible de :
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="objective_overdue_days"
                type="number"
                min="1"
                value={settings.objective_overdue_days}
                onChange={(e) =>
                  setSettings({ ...settings, objective_overdue_days: parseInt(e.target.value) || 1 })
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">jours</span>
            </div>
          </div>

          {/* Progression faible */}
          <div className="space-y-2">
            <Label htmlFor="low_progress_threshold" className="text-base font-semibold">
              Progression lente
            </Label>
            <p className="text-sm text-muted-foreground">
              Signaler les objectifs avec une progression inférieure à :
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="low_progress_threshold"
                type="number"
                min="1"
                max="100"
                value={settings.low_progress_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, low_progress_threshold: parseInt(e.target.value) || 1 })
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {/* Sessions - Absence prolongée */}
          <div className="space-y-2">
            <Label htmlFor="no_session_days" className="text-base font-semibold">
              Absence de session prolongée
            </Label>
            <p className="text-sm text-muted-foreground">
              Alerte critique si aucune session depuis :
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="no_session_days"
                type="number"
                min="1"
                value={settings.no_session_days}
                onChange={(e) =>
                  setSettings({ ...settings, no_session_days: parseInt(e.target.value) || 1 })
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">jours</span>
            </div>
          </div>

          {/* Sessions - À planifier */}
          <div className="space-y-2">
            <Label htmlFor="session_to_plan_days" className="text-base font-semibold">
              Session à planifier
            </Label>
            <p className="text-sm text-muted-foreground">
              Rappel pour planifier une session après :
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="session_to_plan_days"
                type="number"
                min="1"
                value={settings.session_to_plan_days}
                onChange={(e) =>
                  setSettings({ ...settings, session_to_plan_days: parseInt(e.target.value) || 1 })
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">jours</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertSettingsModal;
