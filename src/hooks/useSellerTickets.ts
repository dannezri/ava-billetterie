'use client';

import { useEffect, useState } from 'react';

export interface SellerTicket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  city: string | null;
  category: string | null;
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
}

interface UseSellerTicketsReturn {
  tickets: SellerTicket[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer les billets du vendeur
 */
export function useSellerTickets(): UseSellerTicketsReturn {
  const [tickets, setTickets] = useState<SellerTicket[]>([]);
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
