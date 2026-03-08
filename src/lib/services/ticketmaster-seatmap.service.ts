/**
 * Ticketmaster Discovery API — Seatmap Service
 *
 * Fetches official venue seatmaps from Ticketmaster and parses
 * SVG section geometries to populate VenueSection records.
 *
 * Required env var: TICKETMASTER_API_KEY
 * Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 *
 * Install required parsing deps:
 *   npm install cheerio svg-path-parser
 *   npm install --save-dev @types/cheerio
 */

export interface ITMSection {
  sectionCode: string;
  officialName: string;
  svgPath: string;
  fillRule: 'nonzero' | 'evenodd';
  labelX: number;
  labelY: number;
  category: TMSectionCategory;
  capacity?: number;
  aliases: string[];
}

export type TMSectionCategory =
  | 'STAGE'
  | 'STANDING_PIT'
  | 'SEATED_FLOOR'
  | 'LOWER_TIER'
  | 'MIDDLE_TIER'
  | 'UPPER_TIER'
  | 'VIP_PREMIUM'
  | 'VIP_LOGES'
  | 'ACCESSIBLE';

export interface ITMSeatmapResult {
  staticUrl: string | null;
  viewboxWidth: number;
  viewboxHeight: number;
  sections: ITMSection[];
}

/** Known Ticketmaster venue IDs for major French venues */
export const TM_VENUE_IDS = {
  ACCOR_ARENA: 'KovZpZAEdFtJ',
  STADE_DE_FRANCE: 'KovZpZAE6ktA',
  ZENITH_PARIS: 'KovZpZAJeAEA',
  OLYMPIA: 'KovZpZAFnJ6A',
  GRAND_REX: 'KovZpZAFnAaA',
} as const;

/**
 * Fetch seatmap metadata from Ticketmaster Discovery API.
 * Returns the staticUrl of the official SVG plan + raw section data.
 */
export async function fetchTMVenueSeatmap(
  ticketmasterId: string
): Promise<ITMSeatmapResult | null> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.warn('[TM Seatmap] TICKETMASTER_API_KEY not set — skipping API call');
    return null;
  }

  const url = new URL(
    `https://app.ticketmaster.com/discovery/v2/venues/${ticketmasterId}/seatmap.json`
  );
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('locale', 'fr-FR');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 }, // Cache 24h
  });

  if (!res.ok) {
    console.error(`[TM Seatmap] HTTP ${res.status} for venue ${ticketmasterId}`);
    return null;
  }

  const data = await res.json();
  const seatmap = data._embedded?.seatmaps?.[0];

  if (!seatmap) return null;

  return {
    staticUrl: seatmap.staticUrl ?? null,
    viewboxWidth: seatmap.canvas?.width ?? 1000,
    viewboxHeight: seatmap.canvas?.height ?? 700,
    sections: (seatmap.sections ?? []).map(parseTMSection),
  };
}

/**
 * Parse a raw Ticketmaster section object into our ITMSection shape.
 */
function parseTMSection(raw: Record<string, unknown>): ITMSection { // eslint-disable-line @typescript-eslint/no-explicit-any
  const code = String(raw.sectionId ?? raw.id ?? 'UNKNOWN').toUpperCase();
  const name = formatSectionName(code);
  const category = inferCategory(code, String(raw.type ?? ''));

  return {
    sectionCode: code,
    officialName: name,
    svgPath: String(raw.path ?? ''),
    fillRule: 'nonzero',
    labelX: Number((raw.centroid as Record<string, unknown>)?.x ?? raw.labelX ?? 0),
    labelY: Number((raw.centroid as Record<string, unknown>)?.y ?? raw.labelY ?? 0),
    category,
    capacity: raw.rowCount != null ? Number(raw.rowCount) * 20 : undefined,
    aliases: buildAliases(code, name),
  };
}

/**
 * Parse an SVG string (fetched from staticUrl) and extract <path> and <polygon>
 * elements as VenueSection records.
 *
 * NOTE: requires `cheerio` to be installed.
 *   npm install cheerio && npm install --save-dev @types/cheerio
 */
export async function parseSeatmapSVG(svgUrl: string): Promise<ITMSection[]> {
  // Dynamic import — cheerio must be installed: npm install cheerio
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cheerio: any;
  try {
    cheerio = await import('cheerio');
  } catch {
    console.warn('[TM Seatmap] cheerio not installed — cannot parse SVG');
    return [];
  }

  const res = await fetch(svgUrl);
  if (!res.ok) {
    console.error(`[TM Seatmap] Could not fetch SVG: ${svgUrl}`);
    return [];
  }

  const svg = await res.text();
  const $ = cheerio.load(svg, { xmlMode: true });

  // Infer viewbox dimensions
  const viewBox = $('svg').attr('viewBox')?.split(/\s+/).map(Number) ?? [0, 0, 1000, 700];
  const vbW = viewBox[2] ?? 1000;
  const vbH = viewBox[3] ?? 700;

  const sections: ITMSection[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $('path[id], polygon[id], rect[id]').each((_: number, el: any) => {
    const id = $(el).attr('id');
    if (!id || id === 'background' || id === 'stage') return;

    const code = id.toUpperCase();
    const pathD = $(el).attr('d');
    const points = $(el).attr('points');

    let svgPath: string;
    if (pathD) {
      svgPath = pathD;
    } else if (points) {
      // Convert polygon points to path
      const pts = points.trim().split(/[\s,]+/);
      const pairs: string[] = [];
      for (let i = 0; i < pts.length - 1; i += 2) {
        pairs.push(`${i === 0 ? 'M' : 'L'} ${pts[i]},${pts[i + 1]}`);
      }
      svgPath = pairs.join(' ') + ' Z';
    } else {
      // rect fallback
      const x = Number($(el).attr('x') ?? 0);
      const y = Number($(el).attr('y') ?? 0);
      const w = Number($(el).attr('width') ?? 0);
      const h = Number($(el).attr('height') ?? 0);
      svgPath = `M ${x},${y} L ${x + w},${y} L ${x + w},${y + h} L ${x},${y + h} Z`;
    }

    const centroid = estimateCentroid(svgPath, vbW, vbH);
    const name = formatSectionName(code);
    const category = inferCategory(code, '');

    sections.push({
      sectionCode: code,
      officialName: name,
      svgPath,
      fillRule: 'nonzero',
      labelX: centroid.x,
      labelY: centroid.y,
      category,
      aliases: buildAliases(code, name),
    });
  });

  return sections;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatSectionName(code: string): string {
  return code
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferCategory(code: string, type: string): TMSectionCategory {
  const c = code.toLowerCase();
  const t = type.toLowerCase();

  if (c.includes('scene') || c.includes('stage') || t === 'stage') return 'STAGE';
  if (c.includes('loge')) return 'VIP_LOGES';
  if (c.includes('carre_or') || c.includes('carreor') || c.includes('golden') || c.includes('premium')) return 'VIP_PREMIUM';
  if (c.includes('parterre') || c.includes('fosse') || c.includes('pit') || c.includes('standing')) return 'STANDING_PIT';
  if (c.includes('sup') || c.includes('haute') || c.includes('gradin') || c.includes('upper')) return 'UPPER_TIER';
  if (c.includes('inf') || c.includes('basse') || c.includes('lower')) return 'LOWER_TIER';
  if (c.includes('milieu') || c.includes('middle') || c.includes('mid')) return 'MIDDLE_TIER';
  if (c.includes('pmr') || c.includes('accessible')) return 'ACCESSIBLE';
  if (c.includes('assis') || c.includes('seated') || c.includes('floor')) return 'SEATED_FLOOR';

  return 'LOWER_TIER';
}

function buildAliases(code: string, name: string): string[] {
  const base = [name.toLowerCase(), code.toLowerCase(), code.replace(/_/g, ' ').toLowerCase()];

  const extra: string[] = [];
  if (code.includes('PARTERRE')) extra.push('fosse', 'parterre', 'pit', 'debout');
  if (code.includes('CARRE_OR')) extra.push('carré or', 'carre or', 'vip', 'golden circle');
  if (code.includes('GRADIN')) extra.push('gradin', 'gradin supérieur', 'upper tier');
  if (code.includes('TRIBUNE')) extra.push('tribune', 'balcon');

  return [...new Set([...base, ...extra])];
}

/**
 * Estimate the centroid of an SVG path by sampling M and L commands.
 * Good enough for label positioning.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function estimateCentroid(path: string, _vbW: number, _vbH: number): { x: number; y: number } {
  const coordPattern = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match: RegExpExecArray | null;
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  while ((match = coordPattern.exec(path)) !== null) {
    sumX += parseFloat(match[1]);
    sumY += parseFloat(match[2]);
    count++;
  }

  if (count === 0) return { x: 500, y: 350 };
  return { x: Math.round(sumX / count), y: Math.round(sumY / count) };
}
