'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  type: 'single' | 'group';
  ticketId: string;
  ticketIds: string[];
  transactionId: string;
  transactionIds: string[];
  expiresAt: string; // ISO
  price: number;     // total TTC (avec frais plateforme)
  eventId: string;
  eventTitle: string;
  eventDate: string;
  section: string | null;
  seatNumber: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; ticketId: string }
  | { type: 'CLEAR_EXPIRED' }
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'CLEAR_BY_TRANSACTION_IDS'; transactionIds: string[] };

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (ticketId: string) => Promise<void>;
  /** Retire silencieusement les items achetés sans appeler le DELETE API */
  clearPurchased: (transactionIds: string[]) => void;
  isInCart: (ticketId: string) => boolean;
  totalItems: number;
  earliestExpiry: string | null;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ava_cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items };

    case 'ADD_ITEM': {
      // Déduplique par ticketId
      const exists = state.items.some((i) => i.ticketId === action.item.ticketId);
      if (exists) return state;
      // Garantir que price est toujours un number (Prisma Decimal peut passer en string)
      const normalizedItem = { ...action.item, price: Number(action.item.price) };
      return { items: [...state.items, normalizedItem] };
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.ticketId !== action.ticketId) };

    case 'CLEAR_EXPIRED': {
      const now = Date.now();
      return { items: state.items.filter((i) => new Date(i.expiresAt).getTime() > now) };
    }

    case 'CLEAR_BY_TRANSACTION_IDS':
      return {
        items: state.items.filter(
          (i) => !i.transactionIds.some((tid) => action.transactionIds.includes(tid))
        ),
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/** Item minimal retourné par GET /api/cart/pending */
interface PendingApiItem {
  transactionId: string;
  ticketId: string;
  groupId: string | null;
  expiresAt: string;
  amount: number;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  section: string | null;
  seatNumber: string | null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);

  // Hydratation : BDD en source de vérité, localStorage pour la structure groupe
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // 1. Lire localStorage (pour préserver la structure des groupes)
      let stored: CartItem[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: CartItem[] = JSON.parse(raw);
          const now = Date.now();
          stored = parsed
            .filter((i) => new Date(i.expiresAt).getTime() > now)
            .map((i) => ({ ...i, price: Number(i.price) }))
            .filter((i) => !isNaN(i.price) && i.price > 0);
        }
      } catch {
        // localStorage corrompu
      }

      // 2. Interroger la BDD pour les transactions PENDING réelles
      let dbItems: PendingApiItem[] = [];
      try {
        const res = await fetch('/api/cart/pending');
        if (res.ok) {
          const json = await res.json();
          dbItems = json.items ?? [];
        }
      } catch {
        // Pas de réseau — on se rabat sur localStorage
      }

      if (cancelled) return;

      // Si la BDD ne renvoie rien (non authentifié ou 0 PENDING), utiliser localStorage
      if (dbItems.length === 0) {
        dispatch({ type: 'HYDRATE', items: stored });
        setHydrated(true);
        return;
      }

      // 3. Construire un index des transactionIds valides (BDD fait autorité)
      const validTxIds = new Set(dbItems.map((d) => d.transactionId));

      // 4. Valider les items localStorage : garder ceux dont TOUS les transactionIds
      //    sont encore PENDING en BDD (garantit la cohérence)
      const validStored = stored.filter((item) =>
        item.transactionIds.every((tid) => validTxIds.has(tid)),
      );

      // 5. Collecter les transactionIds déjà couverts par les items localStorage valides
      const coveredTxIds = new Set(
        validStored.flatMap((item) => item.transactionIds),
      );

      // 6. Pour les transactions BDD non couvertes → ajouter comme item individuel
      //    Grouper par groupId s'ils partagent le même TicketGroup
      const uncovered = dbItems.filter((d) => !coveredTxIds.has(d.transactionId));

      const groupedByGroupId = new Map<string, PendingApiItem[]>();
      const singles: PendingApiItem[] = [];

      for (const d of uncovered) {
        if (d.groupId) {
          const g = groupedByGroupId.get(d.groupId) ?? [];
          g.push(d);
          groupedByGroupId.set(d.groupId, g);
        } else {
          singles.push(d);
        }
      }

      const fromDb: CartItem[] = [
        // Billets individuels
        ...singles.map((d) => ({
          type: 'single' as const,
          ticketId: d.ticketId,
          ticketIds: [d.ticketId],
          transactionId: d.transactionId,
          transactionIds: [d.transactionId],
          expiresAt: d.expiresAt,
          price: d.amount,
          eventId: d.eventId,
          eventTitle: d.eventTitle,
          eventDate: d.eventDate,
          section: d.section,
          seatNumber: d.seatNumber,
          quantity: 1,
        })),
        // Groupes (même TicketGroup)
        ...[...groupedByGroupId.values()].map((group) => ({
          type: 'group' as const,
          ticketId: group[0].ticketId,
          ticketIds: group.map((d) => d.ticketId),
          transactionId: group[0].transactionId,
          transactionIds: group.map((d) => d.transactionId),
          expiresAt: group[0].expiresAt,
          price: group.reduce((s, d) => s + d.amount, 0),
          eventId: group[0].eventId,
          eventTitle: group[0].eventTitle,
          eventDate: group[0].eventDate,
          section: group[0].section,
          seatNumber: group[0].seatNumber,
          quantity: group.length,
        })),
      ];

      dispatch({ type: 'HYDRATE', items: [...validStored, ...fromDb] });
      setHydrated(true);
    }

    hydrate();
    return () => { cancelled = true; };
  }, []);

  // Persistance à chaque changement — uniquement après hydratation
  // pour ne pas écraser localStorage avec [] au premier rendu
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // quota dépassé — ignorer
    }
  }, [state.items, hydrated]);

  // Purge automatique des items expirés (toutes les 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CLEAR_EXPIRED' });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', item });
  }, []);

  const removeItem = useCallback(async (ticketId: string) => {
    const item = state.items.find((i) => i.ticketId === ticketId);
    if (!item) return;

    // Annuler la réservation côté serveur
    try {
      if (item.type === 'group') {
        await fetch(
          `/api/tickets/reserve-group?transactionIds=${item.transactionIds.join(',')}`,
          { method: 'DELETE' }
        );
      } else {
        await fetch(`/api/tickets/reserve?transactionId=${item.transactionId}`, {
          method: 'DELETE',
        });
      }
    } catch {
      // On retire quand même du panier côté client
    }

    dispatch({ type: 'REMOVE_ITEM', ticketId });
  }, [state.items]);

  const clearPurchased = useCallback((transactionIds: string[]) => {
    dispatch({ type: 'CLEAR_BY_TRANSACTION_IDS', transactionIds });
  }, []);

  const isInCart = useCallback(
    (ticketId: string) => state.items.some((i) => i.ticketIds.includes(ticketId)),
    [state.items]
  );

  const earliestExpiry = state.items.length > 0
    ? state.items.reduce((min, i) =>
        new Date(i.expiresAt) < new Date(min) ? i.expiresAt : min,
        state.items[0].expiresAt
      )
    : null;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        clearPurchased,
        isInCart,
        totalItems: state.items.reduce((s, i) => s + i.quantity, 0),
        earliestExpiry,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
