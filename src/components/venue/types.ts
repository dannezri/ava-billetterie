// ─── Section catégories ──────────────────────────────────────────────────────

export type SectionCategory =
  | 'STAGE'
  | 'STANDING_PIT'
  | 'SEATED_FLOOR'
  | 'LOWER_TIER'
  | 'MIDDLE_TIER'
  | 'UPPER_TIER'
  | 'VIP_PREMIUM'
  | 'VIP_LOGES'
  | 'ACCESSIBLE';

export type StageSetup = 'FRONTAL' | 'ROUND_360' | 'ARENA' | 'THEATER' | 'FESTIVAL';

// ─── Seatmap (from DB or static fallback) ───────────────────────────────────

export interface IVenueSection {
  section_id: string;      // matches sectionCode in DB
  name: string;            // officialName
  category: SectionCategory;
  svg_path: string;
  fill_rule: 'nonzero' | 'evenodd';
  label_x: number;
  label_y: number;
  aliases: string[];
  capacity?: number | null;
}

export interface ISeatmap {
  id: string;
  stageSetup: StageSetup;
  configurationName: string;
  viewboxWidth: number;
  viewboxHeight: number;
  sections: IVenueSection[];
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface ISectionPrice {
  section_id: string;
  min_price: number;
  max_price: number;
  tickets_count: number;
}

// ─── Ticket ──────────────────────────────────────────────────────────────────

export interface IVenueTicket {
  id: string;
  section: string | null;
  seatNumber: string | null;
  row: string | null;
  price: number;
  status: string;
  seller: {
    id: string;
    name: string | null;
    trustScore: number;
    verifiedIdentity: boolean;
    kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  };
  resolved_section_id: string | null;
}
