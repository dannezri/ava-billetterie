/**
 * TicketSelectionModal
 * Modal de sélection du nombre de billets + option côte à côte
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Users, Ticket } from 'lucide-react';

interface ITicketSelectionModalProps {
  eventId: string;
  eventName: string;
  open: boolean;
  onClose: () => void;
  /** Valeurs pré-remplies depuis l'URL */
  initialQuantity?: number;
  initialTogether?: boolean;
}

const PRESET_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

export function TicketSelectionModal({
  eventId,
  eventName,
  open,
  onClose,
  initialQuantity = 1,
  initialTogether = false,
}: ITicketSelectionModalProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [together, setTogether] = useState<boolean>(initialTogether);
  const [customMode, setCustomMode] = useState(initialQuantity > 5);
  const [customValue, setCustomValue] = useState(
    initialQuantity > 5 ? String(initialQuantity) : '6'
  );

  const effectiveQuantity = customMode ? parseInt(customValue) || 6 : quantity;

  const handlePreset = (val: number) => {
    setCustomMode(false);
    setQuantity(val);
  };

  const handleCustomMode = () => {
    setCustomMode(true);
    setQuantity(0);
  };

  const handleSubmit = () => {
    const q = effectiveQuantity;
    const params = new URLSearchParams();
    params.set('quantity', String(q));
    if (together && q > 1) {
      params.set('together', 'true');
    }
    router.push(`/events/${eventId}?${params.toString()}`);
    onClose();
  };

  const handleReset = () => {
    router.push(`/events/${eventId}`);
    setQuantity(1);
    setTogether(false);
    setCustomMode(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ticket className="h-5 w-5 text-blue-600" />
            Combien de billets souhaitez-vous ?
          </DialogTitle>
          <DialogDescription className="truncate font-medium text-slate-700">
            {eventName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Sélection quantité */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-900">
              Nombre de billets
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn(
                    'h-14 text-2xl font-bold transition-all',
                    !customMode && quantity === option.value
                      ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white ring-2 ring-blue-300'
                      : 'hover:border-blue-300'
                  )}
                  onClick={() => handlePreset(option.value)}
                >
                  {option.label}
                </Button>
              ))}

              {/* Bouton 6+ */}
              <Button
                variant="outline"
                className={cn(
                  'h-14 text-lg font-bold transition-all',
                  customMode
                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white ring-2 ring-blue-300'
                    : 'hover:border-blue-300'
                )}
                onClick={handleCustomMode}
              >
                6+
              </Button>
            </div>

            {/* Input custom si 6+ sélectionné */}
            {customMode && (
              <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Label className="text-sm font-medium text-blue-800">
                  Quantité exacte :
                </Label>
                <Input
                  type="number"
                  min={6}
                  max={20}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-20 text-center text-lg font-bold"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Option côte à côte (seulement si > 1) */}
          {effectiveQuantity > 1 && (
            <div
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all',
                together
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              )}
              onClick={() => setTogether(!together)}
            >
              <Checkbox
                id="together"
                checked={together}
                onCheckedChange={(checked) => setTogether(!!checked)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="together"
                  className="cursor-pointer text-base font-semibold text-slate-900"
                >
                  <Users className="mr-1.5 inline h-4 w-4 text-blue-600" />
                  Places côte à côte
                </Label>
                <p className="text-sm text-slate-500">
                  {together
                    ? `Afficher uniquement les groupes de ${effectiveQuantity} billets garantis côte à côte`
                    : `Je peux acheter ${effectiveQuantity} billets séparément (places non garanties côte à côte)`}
                </p>
              </div>
            </div>
          )}

          {/* Info 1 billet */}
          {effectiveQuantity === 1 && (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
              Tous les billets individuels disponibles seront affichés.
            </p>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:flex-row">
          <Button variant="ghost" onClick={handleReset} className="flex-1">
            Réinitialiser
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Voir les billets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
