'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

export function PriceCalculator() {
  const [ticketPrice, setTicketPrice] = useState<number>(50);

  const platformFee = ticketPrice * 0.05;
  const total = ticketPrice + platformFee;
  const sellerReceives = ticketPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTicketPrice(isNaN(val) || val < 0 ? 0 : val);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="ticket-price" className="text-base font-medium">
          Prix du billet (€)
        </Label>
        <div className="relative mt-2">
          <Input
            id="ticket-price"
            type="number"
            value={ticketPrice}
            onChange={handleChange}
            min={0}
            step={0.5}
            className="pr-10 text-xl font-bold h-14"
            placeholder="0"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
            €
          </span>
        </div>
      </div>

      <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Prix du billet</span>
          <span className="font-semibold">{ticketPrice.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Frais plateforme</span>
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
              5%
            </span>
          </div>
          <span className="font-semibold text-gray-500">+{platformFee.toFixed(2)} €</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center pt-1">
          <span className="font-bold text-lg">Vous payez au total</span>
          <span className="font-bold text-xl text-primary">{total.toFixed(2)} €</span>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-xl">
        <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
          <span className="text-lg">💰</span>
          <span>
            Le vendeur reçoit{' '}
            <span className="font-bold">{sellerReceives.toFixed(2)} €</span>{' '}
            (100% du prix billet, 0 frais pour lui)
          </span>
        </p>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Les frais de 5% incluent la vérification des billets, le séquestre bancaire J+2,
          la Garantie Sérénité (+50€), le KYC vendeurs et le support client 24/7.
        </p>
      </div>
    </div>
  );
}
