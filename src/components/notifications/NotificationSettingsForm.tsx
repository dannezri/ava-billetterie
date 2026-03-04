'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreferencesData {
  emailTransactions: boolean;
  emailDisputes: boolean;
  emailPriceAlerts: boolean;
  emailSystem: boolean;
  pushEnabled: boolean;
  pushSound: boolean;
  dailyDigest: boolean;
  digestTime: string;
  priceAlertFrequency: string;
}

interface NotificationSettingsFormProps {
  initialPrefs: PreferencesData;
}

const FREQ_OPTIONS = [
  { value: 'INSTANT', label: 'Immédiat', description: 'Alerte en temps réel' },
  { value: 'DAILY', label: 'Quotidien', description: 'Un résumé par jour' },
  { value: 'WEEKLY', label: 'Hebdomadaire', description: 'Un résumé par semaine' },
];

export function NotificationSettingsForm({ initialPrefs }: NotificationSettingsFormProps) {
  const [prefs, setPrefs] = useState<PreferencesData>(initialPrefs);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const toggle = (key: keyof PreferencesData) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const set = (key: keyof PreferencesData, value: string) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (res.ok) {
        toast({ title: 'Préférences enregistrées' });
      } else {
        toast({ title: 'Erreur lors de la sauvegarde', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Email */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Notifications email</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choisissez les types d'activités pour lesquels vous recevez un email.
        </p>
        <div className="space-y-4">
          <CheckRow
            id="email-transactions"
            label="Achats & Ventes"
            description="Confirmations d'achat, billets vendus, séquestre libéré"
            checked={prefs.emailTransactions}
            onChange={() => toggle('emailTransactions')}
          />
          <CheckRow
            id="email-disputes"
            label="Litiges"
            description="Ouverture, réponses et résolution de litiges"
            checked={prefs.emailDisputes}
            onChange={() => toggle('emailDisputes')}
          />
          <CheckRow
            id="email-price-alerts"
            label="Alertes prix"
            description="Nouveaux billets et baisses de prix sur vos événements suivis"
            checked={prefs.emailPriceAlerts}
            onChange={() => toggle('emailPriceAlerts')}
          />
          <CheckRow
            id="email-system"
            label="Système (recommandé)"
            description="KYC, documents, sécurité du compte"
            checked={prefs.emailSystem}
            onChange={() => toggle('emailSystem')}
          />
        </div>
      </section>

      <Separator />

      {/* Push */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Notifications push (navigateur)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Recevez des alertes en temps réel dans votre navigateur.
        </p>
        <div className="space-y-4">
          <CheckRow
            id="push-enabled"
            label="Activer les notifications push"
            description="Demande d'autorisation navigateur requise"
            checked={prefs.pushEnabled}
            onChange={() => toggle('pushEnabled')}
          />
          {prefs.pushEnabled && (
            <CheckRow
              id="push-sound"
              label="Son activé"
              description="Jouer un son lors de la réception"
              checked={prefs.pushSound}
              onChange={() => toggle('pushSound')}
            />
          )}
        </div>
      </section>

      <Separator />

      {/* Résumé quotidien */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Résumé quotidien</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Recevez un récapitulatif de vos notifications chaque jour.
        </p>
        <CheckRow
          id="daily-digest"
          label="Recevoir un résumé email quotidien"
          description="Envoyé à 9h00 chaque matin"
          checked={prefs.dailyDigest}
          onChange={() => toggle('dailyDigest')}
        />
      </section>

      <Separator />

      {/* Fréquence alertes prix */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Fréquence des alertes prix</h2>
        <p className="text-sm text-muted-foreground mb-4">
          À quelle fréquence souhaitez-vous être alerté des variations de prix ?
        </p>
        <div className="space-y-3">
          {FREQ_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                prefs.priceAlertFrequency === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40'
              )}
            >
              <input
                type="radio"
                name="priceAlertFrequency"
                value={opt.value}
                checked={prefs.priceAlertFrequency === opt.value}
                onChange={() => set('priceAlertFrequency', opt.value)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} className="min-w-[160px]">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
}

function CheckRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <div className="flex-1">
        <Label htmlFor={id} className="font-medium cursor-pointer leading-tight">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
