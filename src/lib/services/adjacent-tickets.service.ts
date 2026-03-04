/**
 * Adjacent Tickets Service
 *
 * Détecte automatiquement les billets individuels adjacents (sièges consécutifs)
 * depuis l'ensemble des billets ACTIVE d'un événement.
 *
 * Formats seat_number supportés (basés sur données réelles) :
 *   "147"             → nombre pur         (le plus courant)
 *   "Siège 8"         → préfixe "Siège N"
 *   "Rang 5 Siège 23" → rang + siège
 *   "R5 S23"          → raccourci rang+siège
 *   "A12" / "B23"     → lettre-rangée + numéro siège
 *   "12A" / "12B"     → numéro + lettre-variante (consécutifs: 12A→12B)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ITicketForDetection {
  id: string;
  sellerId: string;
  section: string | null;
  seatNumber: string | null;
  price: number;
  seller: {
    id: string;
    name: string | null;
    trustScore: number;
    totalSales: number;
  };
}

interface IParsedSeat {
  /** Rang (optionnel) — peut être nombre ou lettre */
  row?: number | string;
  /** Numéro de siège — nombre ou lettre+num */
  seat: number | string;
  /** Texte original (pour affichage) */
  original: string;
}

export interface IAdjacentGroup {
  /** ID virtuel unique : "virtual-{id1}-{id2}-..." */
  id: string;
  ticketIds: string[];
  section: string;
  seats: string[];
  totalPrice: number;
  pricePerTicket: number;
  quantity: number;
  seller: ITicketForDetection['seller'];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class AdjacentTicketsService {
  /**
   * Point d'entrée principal.
   * Retourne tous les groupes virtuels de `quantity` billets adjacents
   * depuis la liste de billets fournie.
   */
  static findAdjacentGroups(
    tickets: ITicketForDetection[],
    quantity: number
  ): IAdjacentGroup[] {
    if (quantity < 2) return [];

    const groups: IAdjacentGroup[] = [];

    // 1. Garder uniquement les billets avec section + seatNumber valides
    const valid = tickets.filter((t) => t.section && t.seatNumber);

    // 2. Grouper par section + sellerId (même vendeur, même zone)
    const buckets = this.groupBy(valid, (t) => `${t.section}||${t.sellerId}`);

    // 3. Pour chaque bucket, détecter les séquences consécutives
    for (const key of Object.keys(buckets)) {
      const bucket = buckets[key];

      // Parser + trier
      const parsed = bucket
        .map((ticket) => ({
          ticket,
          parsed: this.parseSeatNumber(ticket.seatNumber!),
        }))
        .filter((p) => p.parsed !== null) as Array<{
        ticket: ITicketForDetection;
        parsed: IParsedSeat;
      }>;

      parsed.sort((a, b) => this.compareSeats(a.parsed, b.parsed));

      // Fenêtre glissante : trouver séquences de longueur `quantity`
      const sequences = this.findConsecutiveSequences(parsed, quantity);

      for (const seq of sequences) {
        groups.push(this.buildVirtualGroup(seq, quantity));
      }
    }

    // Trier par prix total croissant
    return groups.sort((a, b) => a.totalPrice - b.totalPrice);
  }

  // ─── Parsing ───────────────────────────────────────────────────────────────

  /**
   * Parse un `seatNumber` en structure normalisée.
   * Retourne null si le format est inconnu/non-comparable.
   */
  private static parseSeatNumber(raw: string): IParsedSeat | null {
    const s = raw.trim();

    // ── Pattern 1 : "Siège N" ou "SIEGE N" (ex: "Siège 8", "Siège 147")
    const siegeMatch = s.match(/^si[eè]ge\s+(\d+)$/i);
    if (siegeMatch) {
      return { seat: parseInt(siegeMatch[1], 10), original: s };
    }

    // ── Pattern 2 : "Rang X Siège Y" / "Rang X, Siège Y"
    const rangSiegeMatch = s.match(/rang\s*(\d+)[,\s]+si[eè]ge\s*(\d+)/i);
    if (rangSiegeMatch) {
      return {
        row: parseInt(rangSiegeMatch[1], 10),
        seat: parseInt(rangSiegeMatch[2], 10),
        original: s,
      };
    }

    // ── Pattern 3 : "R5 S23" / "R5S23"
    const rSMatch = s.match(/^R(\d+)\s*S(\d+)$/i);
    if (rSMatch) {
      return {
        row: parseInt(rSMatch[1], 10),
        seat: parseInt(rSMatch[2], 10),
        original: s,
      };
    }

    // ── Pattern 4 : Nombre pur (ex: "147", "8", "22")
    if (/^\d+$/.test(s)) {
      return { seat: parseInt(s, 10), original: s };
    }

    // ── Pattern 5 : Lettre + Nombre (ex: "A12", "B23") → rangée lettre, siège num
    const letterNumMatch = s.match(/^([A-Z])(\d+)$/i);
    if (letterNumMatch) {
      return {
        row: letterNumMatch[1].toUpperCase(),
        seat: parseInt(letterNumMatch[2], 10),
        original: s,
      };
    }

    // ── Pattern 6 : Nombre + Lettre (ex: "12A", "12B") → siège num, variante lettre
    // Consécutivité : 12A → 12B → 12C
    const numLetterMatch = s.match(/^(\d+)([A-Z])$/i);
    if (numLetterMatch) {
      // On encode comme string pour comparer les lettres
      return {
        seat: s.toUpperCase(), // garder "12A" comme string (comparaison spéciale)
        original: s,
      };
    }

    // Format inconnu → skip
    return null;
  }

  // ─── Tri ───────────────────────────────────────────────────────────────────

  private static compareSeats(a: IParsedSeat, b: IParsedSeat): number {
    // Comparer rangs si présents
    if (a.row !== undefined && b.row !== undefined) {
      const rowCmp =
        typeof a.row === 'number' && typeof b.row === 'number'
          ? a.row - b.row
          : String(a.row).localeCompare(String(b.row));
      if (rowCmp !== 0) return rowCmp;
    }

    // Comparer sièges
    if (typeof a.seat === 'number' && typeof b.seat === 'number') {
      return a.seat - b.seat;
    }
    return String(a.seat).localeCompare(String(b.seat));
  }

  // ─── Algorithme fenêtre glissante ─────────────────────────────────────────

  private static findConsecutiveSequences(
    parsed: Array<{ ticket: ITicketForDetection; parsed: IParsedSeat }>,
    length: number
  ): Array<Array<{ ticket: ITicketForDetection; parsed: IParsedSeat }>> {
    const sequences: Array<Array<{ ticket: ITicketForDetection; parsed: IParsedSeat }>> = [];
    const used = new Set<string>(); // éviter d'utiliser un billet dans 2 groupes

    for (let i = 0; i <= parsed.length - length; i++) {
      const window = parsed.slice(i, i + length);

      // Vérifier qu'aucun billet n'est déjà assigné
      if (window.some((w) => used.has(w.ticket.id))) continue;

      if (this.areConsecutive(window.map((w) => w.parsed))) {
        sequences.push(window);
        // Marquer les billets comme utilisés
        window.forEach((w) => used.add(w.ticket.id));
        i += length - 1; // avancer la fenêtre (pas de chevauchement)
      }
    }

    return sequences;
  }

  /**
   * Vérifie que des sièges parsés forment une séquence strictement consécutive.
   */
  private static areConsecutive(seats: IParsedSeat[]): boolean {
    // Tous doivent avoir le même rang (ou tous sans rang)
    const rows = seats.map((s) => s.row).filter((r) => r !== undefined);
    if (rows.length > 0 && rows.length !== seats.length) {
      return false; // Certains ont un rang, d'autres non → incompatibles
    }
    if (rows.length > 0) {
      const first = rows[0];
      if (!rows.every((r) => r === first)) return false;
    }

    // Vérifier consécutivité des sièges
    for (let i = 0; i < seats.length - 1; i++) {
      const cur = seats[i].seat;
      const nxt = seats[i + 1].seat;

      if (typeof cur === 'number' && typeof nxt === 'number') {
        // Nombres : strictement consécutifs
        if (nxt !== cur + 1) return false;
      } else if (typeof cur === 'string' && typeof nxt === 'string') {
        // Strings : format "12A" → "12B"
        const curNum = cur.match(/^(\d+)/)?.[1];
        const nxtNum = nxt.match(/^(\d+)/)?.[1];
        const curLetter = cur.match(/([A-Z])$/i)?.[1]?.toUpperCase();
        const nxtLetter = nxt.match(/([A-Z])$/i)?.[1]?.toUpperCase();

        if (!curNum || !nxtNum || !curLetter || !nxtLetter) return false;
        if (curNum !== nxtNum) return false; // Numéros de base différents
        if (nxtLetter.charCodeAt(0) !== curLetter.charCodeAt(0) + 1) return false;
      } else {
        return false; // Types mixtes incomparables
      }
    }

    return true;
  }

  // ─── Construction groupe virtuel ──────────────────────────────────────────

  private static buildVirtualGroup(
    sequence: Array<{ ticket: ITicketForDetection; parsed: IParsedSeat }>,
    quantity: number
  ): IAdjacentGroup {
    const tickets = sequence.map((s) => s.ticket);
    const totalPrice = tickets.reduce((sum, t) => sum + Number(t.price), 0);

    return {
      id: `virtual-${tickets.map((t) => t.id).join('-')}`,
      ticketIds: tickets.map((t) => t.id),
      section: tickets[0].section!,
      seats: sequence.map((s) => s.parsed.original),
      totalPrice: Math.round(totalPrice * 100) / 100,
      pricePerTicket: Math.round((totalPrice / quantity) * 100) / 100,
      quantity,
      seller: tickets[0].seller,
    };
  }

  // ─── Utilitaires ──────────────────────────────────────────────────────────

  private static groupBy<T>(
    array: T[],
    keyFn: (item: T) => string
  ): Record<string, T[]> {
    return array.reduce(
      (acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, T[]>
    );
  }
}
