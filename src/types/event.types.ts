/**
 * Event Types - Marketplace Événements
 * Types TypeScript pour événements et billets
 */

export interface IEvent {
  id: string;
  title: string;
  artist: string | null;
  category: string | null;
  venue: string;
  city: string;
  country: string;
  eventDate: Date;
  doorsOpenTime: string | null;
  imageUrl: string | null;
  officialUrl: string | null;
  description: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventWithStats extends IEvent {
  ticketsAvailable: number;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface ITicket {
  id: string;
  eventId: string;
  sellerId: string;
  status: string;
  originalPrice: number | null;
  price: number;
  section: string | null;
  row: string | null;
  seatNumber: string | null;
  pdfUrl: string | null;
  verificationStatus: string;
  createdAt: Date;
}

export interface ITicketWithSeller extends ITicket {
  seller: {
    id: string;
    name: string | null;
    trustScore: number;
    totalSales: number;
  };
}

export interface IPriceStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  priceDistribution: Array<{
    range: string;
    count: number;
  }>;
}
