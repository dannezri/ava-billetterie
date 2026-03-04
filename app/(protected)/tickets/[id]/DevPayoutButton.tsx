'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DevPayoutButtonProps {
  transactionId: string;
  autoPayoutStatus: string;
}

export function DevPayoutButton({ transactionId, autoPayoutStatus }: DevPayoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(autoPayoutStatus === 'COMPLETED');
  const router = useRouter();

  const handleTrigger = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/dev/trigger-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erreur inconnue');
      } else {
        setDone(true);
        router.refresh();
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-dashed border-yellow-400 bg-yellow-50 p-3 space-y-2">
      <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
        Mode développement
      </p>

      {done ? (
        <div className="flex items-center gap-2 rounded bg-green-50 p-2 text-xs text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Virement effectué avec succès.</span>
        </div>
      ) : (
        <>
          <p className="text-xs text-yellow-600">
            Simule le cron auto-payout pour cette transaction ({autoPayoutStatus}).
          </p>

          <Button
            size="sm"
            variant="outline"
            className="border-yellow-500 text-yellow-700 hover:bg-yellow-100 w-full"
            onClick={handleTrigger}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-3.5 w-3.5" />
                ⚡ Déclencher le virement
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-start gap-2 rounded bg-red-50 p-2 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
