'use client';

import { useEffect, useState } from 'react';

export interface MyTicket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  city: string | null;
  category: string | null;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  section: string | null;
  row: string | null;
  seatNumber: string | null;
  status: string;
  verificationStatus: string;
  rejectionReason: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
  soldAt: string | null;
}

interface UseMyTicketsReturn {
  tickets: MyTicket[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer les billets mis en vente par l'utilisateur connecté
 * ✨ RENOMMÉ : useSellerTickets → useMyTickets
 * Accessible à TOUT utilisateur authentifié (plus de prérequis role SELLER)
 */
export function useMyTickets(): UseMyTicketsReturn {
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/seller/tickets');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des billets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('❌ Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return {
    tickets,
    total,
    loading,
    error,
    refetch: fetchTickets,
  };
}

// Rétrocompatibilité : alias pour les imports existants
export { useMyTickets as useSellerTickets };
export type { MyTicket as SellerTicket };
