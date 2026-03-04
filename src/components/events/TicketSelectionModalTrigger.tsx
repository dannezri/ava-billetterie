/**
 * TicketSelectionModalTrigger
 * Wrapper client pour gérer l'ouverture automatique ou sur action
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { TicketSelectionModal } from './TicketSelectionModal';

interface ITicketSelectionModalTriggerProps {
  eventId: string;
  eventName: string;
  /** Ouvrir automatiquement au mount (première visite sans filtre) */
  shouldOpenAuto?: boolean;
  /** Valeurs pré-remplies pour le modal (depuis URL) */
  initialQuantity?: number;
  initialTogether?: boolean;
  /** Bouton custom déclencheur */
  trigger?: React.ReactNode;
}

export function TicketSelectionModalTrigger({
  eventId,
  eventName,
  shouldOpenAuto = false,
  initialQuantity = 1,
  initialTogether = false,
  trigger,
}: ITicketSelectionModalTriggerProps) {
  const [open, setOpen] = useState(false);
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (shouldOpenAuto && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      // Petit délai UX pour laisser la page se rendre
      const timer = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(timer);
    }
  }, [shouldOpenAuto]);

  return (
    <>
      {trigger && (
        <div onClick={() => setOpen(true)} className="contents">
          {trigger}
        </div>
      )}
      <TicketSelectionModal
        eventId={eventId}
        eventName={eventName}
        open={open}
        onClose={() => setOpen(false)}
        initialQuantity={initialQuantity}
        initialTogether={initialTogether}
      />
    </>
  );
}
