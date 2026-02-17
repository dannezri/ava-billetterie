'use client';

import { useRouter } from 'next/navigation';
import { CreateTicketForm } from './CreateTicketForm';

interface EventOption {
  id: string;
  title: string;
  eventDate: string;
  venue: string;
  city: string;
}

interface CreateTicketFormWrapperProps {
  events: EventOption[];
}

/**
 * Wrapper Client Component pour gérer les callbacks
 */
export function CreateTicketFormWrapper({ events }: CreateTicketFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = (ticketId: string) => {
    // Redirection vers la page du ticket créé
    router.push(`/tickets/${ticketId}`);
  };

  const handleError = (error: string) => {
    console.error('Erreur création billet:', error);
    // L'erreur est déjà affichée dans le formulaire
  };

  return (
    <CreateTicketForm
      events={events}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
