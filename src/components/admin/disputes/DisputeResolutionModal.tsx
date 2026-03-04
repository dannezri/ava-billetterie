'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, TrendingDown } from 'lucide-react';

type Outcome = 'REFUND_BUYER' | 'RELEASE_SELLER' | 'PARTIAL_REFUND';

interface DisputeResolutionModalProps {
  dispute: {
    id: string;
    transaction: {
      amount: number;
      platformFee: number;
      buyer: { id: string; name: string | null; email: string; trustScore: number };
      seller: { id: string; name: string | null; email: string; trustScore: number; disputesAsSellerCount: number };
    };
  };
  onClose: () => void;
  onResolved: () => void;
}

const OUTCOME_CONFIG: Record<Outcome, { label: string; description: string; color: string; selectedColor: string }> = {
  REFUND_BUYER: {
    label: 'Rembourser l\'acheteur',
    description: 'Retrait des fonds séquestrés vers l\'acheteur',
    color: 'border-gray-200 hover:border-blue-300',
    selectedColor: 'border-blue-500 bg-blue-50',
  },
  RELEASE_SELLER: {
    label: 'Libérer le vendeur',
    description: 'Virer les fonds au vendeur',
    color: 'border-gray-200 hover:border-green-300',
    selectedColor: 'border-green-500 bg-green-50',
  },
  PARTIAL_REFUND: {
    label: 'Remboursement partiel',
    description: 'Rembourser un montant spécifique à l\'acheteur',
    color: 'border-gray-200 hover:border-orange-300',
    selectedColor: 'border-orange-500 bg-orange-50',
  },
};

const formatEur = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

export function DisputeResolutionModal({ dispute, onClose, onResolved }: DisputeResolutionModalProps) {
  const { toast } = useToast();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [notes, setNotes] = useState('');
  const [partialAmount, setPartialAmount] = useState(String(dispute.transaction.amount));
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = dispute.transaction.amount;
  const sellerScore = dispute.transaction.seller.trustScore;
  const buyerScore = dispute.transaction.buyer.trustScore;
  const isRecidivist = dispute.transaction.seller.disputesAsSellerCount >= 3;

  const handleSubmit = async () => {
    if (!outcome || notes.length < 10) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/disputes/${dispute.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome,
          notes,
          amount: outcome === 'PARTIAL_REFUND' ? Number(partialAmount) : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      onResolved();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Résoudre le litige
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Choix outcome */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Décision <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {(Object.keys(OUTCOME_CONFIG) as Outcome[]).map((key) => {
                const config = OUTCOME_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => setOutcome(key)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border-2 text-sm font-medium transition-all',
                      outcome === key ? config.selectedColor : config.color
                    )}
                  >
                    {config.label}
                    <p className="text-xs text-gray-500 font-normal mt-0.5">{config.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Montant partiel */}
          {outcome === 'PARTIAL_REFUND' && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Montant à rembourser (max {formatEur(totalAmount)})
              </Label>
              <Input
                type="number"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                min={0.01}
                max={totalAmount}
                step={0.01}
              />
            </div>
          )}

          {/* Récapitulatif montant */}
          {outcome && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Montant billet</span>
                <span>{formatEur(totalAmount - dispute.transaction.platformFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Commission plateforme</span>
                <span>{formatEur(dispute.transaction.platformFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-gray-900">
                <span>
                  {outcome === 'REFUND_BUYER' ? 'Remboursement acheteur' :
                   outcome === 'PARTIAL_REFUND' ? 'Remboursement partiel' :
                   'Versement vendeur'}
                </span>
                <span>
                  {outcome === 'PARTIAL_REFUND'
                    ? formatEur(Number(partialAmount))
                    : outcome === 'RELEASE_SELLER'
                    ? formatEur(totalAmount - dispute.transaction.platformFee)
                    : formatEur(totalAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Impact Trust Score */}
          {outcome && outcome !== 'RELEASE_SELLER' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <TrendingDown className="h-4 w-4" />
                Impact sur les scores
              </div>
              <div className="space-y-1 text-xs text-red-800">
                <div className="flex justify-between">
                  <span>Vendeur ({dispute.transaction.seller.name || dispute.transaction.seller.email})</span>
                  <span className="font-semibold">{sellerScore} → {Math.max(0, sellerScore - 20)} (−20)</span>
                </div>
                <div className="flex justify-between">
                  <span>Acheteur ({dispute.transaction.buyer.name || dispute.transaction.buyer.email})</span>
                  <span className="font-semibold text-green-700">{buyerScore} → {Math.min(100, buyerScore + 5)} (+5)</span>
                </div>
              </div>
              {isRecidivist && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-700 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {dispute.transaction.seller.disputesAsSellerCount}e litige pour ce vendeur — envisager suspension
                </div>
              )}
            </div>
          )}

          {/* Notes obligatoires */}
          <div>
            <Label htmlFor="resolve-notes" className="text-sm font-medium text-gray-700 mb-1 block">
              Raison de résolution <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(min. 10 caractères)</span>
            </Label>
            <Textarea
              id="resolve-notes"
              placeholder="Expliquez votre décision et les éléments pris en compte..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={cn(notes.length > 0 && notes.length < 10 ? 'border-red-300' : '')}
            />
            <p className="text-xs text-gray-400 mt-1">{notes.length}/10 minimum</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !outcome || notes.length < 10}
            className={cn(
              outcome === 'REFUND_BUYER' || outcome === 'PARTIAL_REFUND'
                ? 'bg-blue-600 hover:bg-blue-700'
                : outcome === 'RELEASE_SELLER'
                ? 'bg-green-600 hover:bg-green-700'
                : ''
            )}
          >
            {submitting ? 'Traitement en cours...' : 'Confirmer la résolution'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
