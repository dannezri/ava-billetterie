#!/usr/bin/env ts-node
/**
 * Script d'import des plans de salle officiels Ticketmaster
 *
 * Usage:
 *   node --env-file=.env.local ./node_modules/.bin/ts-node --esm prisma/import-ticketmaster-venues.ts
 *
 * Options:
 *   --dry-run      Affiche ce qui serait importé sans écrire en base
 *   --venue <id>   N'importe qu'une seule venue (ex: --venue ACCOR_ARENA)
 *   --force        Réimporte même si la salle est déjà en base
 *
 * Requiert:
 *   TICKETMASTER_API_KEY dans .env.local
 *
 * Flux:
 *   1. Pour chaque venue cible, cherche un événement actif via l'API TM
 *   2. Récupère le seatmap.staticUrl de l'événement
 *   3. Télécharge et parse le SVG (cheerio)
 *   4. Upsert Venue + VenueSeatmap + VenueSection en base
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// ─── Configuration des salles à importer ────────────────────────────────────

interface IVenueConfig {
  tmVenueId: string;
  name: string;
  city: string;
  address?: string;
  country: string;
  capacity?: number;
  venueType: 'ARENA' | 'STADIUM' | 'THEATER' | 'CLUB' | 'OUTDOOR';
  stageSetup: 'FRONTAL' | 'ROUND_360' | 'ARENA' | 'THEATER' | 'FESTIVAL';
  configurationName: string;
  isDefault: boolean;
}

const TARGET_VENUES: IVenueConfig[] = [
  {
    tmVenueId: 'KovZpZAEdFtJ',
    name: 'Accor Arena',
    city: 'Paris',
    address: '8 Bd de Bercy, 75012 Paris',
    country: 'France',
    capacity: 20300,
    venueType: 'ARENA',
    stageSetup: 'FRONTAL',
    configurationName: 'Accor Arena — Scène Frontale',
    isDefault: true,
  },
  {
    tmVenueId: 'KovZpZAE6ktA',
    name: 'Stade de France',
    city: 'Saint-Denis',
    address: 'Rue Francis de Pressensé, 93216 Saint-Denis',
    country: 'France',
    capacity: 81338,
    venueType: 'STADIUM',
    stageSetup: 'FRONTAL',
    configurationName: 'Stade de France — Configuration Concert',
    isDefault: true,
  },
  {
    tmVenueId: 'KovZpZAJeAEA',
    name: 'Zénith de Paris',
    city: 'Paris',
    address: '211 Av. Jean Jaurès, 75019 Paris',
    country: 'France',
    capacity: 6291,
    venueType: 'ARENA',
    stageSetup: 'FRONTAL',
    configurationName: 'Zénith de Paris — Scène Frontale',
    isDefault: true,
  },
  {
    tmVenueId: 'KovZpZAFnJ6A',
    name: 'L\'Olympia',
    city: 'Paris',
    address: '28 Bd des Capucines, 75009 Paris',
    country: 'France',
    capacity: 2000,
    venueType: 'THEATER',
    stageSetup: 'FRONTAL',
    configurationName: 'L\'Olympia — Configuration Standard',
    isDefault: true,
  },
  {
    tmVenueId: 'KovZpZAFnAaA',
    name: 'Le Grand Rex',
    city: 'Paris',
    address: '1 Bd Poissonnière, 75002 Paris',
    country: 'France',
    capacity: 2800,
    venueType: 'THEATER',
    stageSetup: 'THEATER',
    configurationName: 'Le Grand Rex — Grande Salle',
    isDefault: true,
  },
];

// ─── API Ticketmaster ────────────────────────────────────────────────────────

interface ITMEvent {
  id: string;
  name: string;
  seatmap?: { staticUrl: string };
}

interface ITMSearchResponse {
  _embedded?: { events?: ITMEvent[] };
  page?: { totalElements: number };
}

async function searchEvents(tmVenueId: string, apiKey: string, extra: Record<string, string> = {}): Promise<ITMEvent[]> {
  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('venueId', tmVenueId);
  url.searchParams.set('size', '50');
  url.searchParams.set('sort', 'date,asc');
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    console.warn(`  ⚠️  TM API ${res.status} pour venue ${tmVenueId}`);
    return [];
  }
  const data: ITMSearchResponse = await res.json();
  return data._embedded?.events ?? [];
}

async function findEventWithSeatmap(tmVenueId: string, apiKey: string): Promise<string | null> {
  // Pass 1 — upcoming events, all classifications
  let events = await searchEvents(tmVenueId, apiKey);

  // Pass 2 — include TBA/TBD events that are often hidden by default
  if (!events.some((e) => e.seatmap?.staticUrl)) {
    console.log(`  ↩  Aucun seatmap dans les événements à venir — tentative avec includeTBA`);
    await new Promise((r) => setTimeout(r, 500));
    events = [
      ...events,
      ...(await searchEvents(tmVenueId, apiKey, { includeTBA: 'yes', includeTBD: 'yes' })),
    ];
  }

  for (const event of events) {
    if (event.seatmap?.staticUrl) {
      console.log(`  ✓ Event trouvé : "${event.name}" — seatmap disponible`);
      return event.seatmap.staticUrl;
    }
  }

  console.warn(`  ⚠️  Aucun event avec seatmap trouvé pour venue ${tmVenueId}`);
  return null;
}

// ─── Parsing SVG ─────────────────────────────────────────────────────────────

type SectionCategory =
  | 'STAGE' | 'STANDING_PIT' | 'SEATED_FLOOR' | 'LOWER_TIER'
  | 'MIDDLE_TIER' | 'UPPER_TIER' | 'VIP_PREMIUM' | 'VIP_LOGES' | 'ACCESSIBLE';

interface IParsedSection {
  sectionCode: string;
  officialName: string;
  category: SectionCategory;
  svgPath: string;
  fillRule: 'nonzero' | 'evenodd';
  labelX: number;
  labelY: number;
  aliases: string[];
  sortOrder: number;
}

async function parseSeatmapSVG(svgUrl: string): Promise<{
  sections: IParsedSection[];
  viewboxWidth: number;
  viewboxHeight: number;
}> {
  console.log(`  ↓ Téléchargement SVG : ${svgUrl}`);
  const res = await fetch(svgUrl);
  if (!res.ok) throw new Error(`SVG fetch failed: ${res.status}`);

  const svgText = await res.text();
  const $ = cheerio.load(svgText, { xmlMode: true });

  // Parse viewBox
  const viewBoxAttr = $('svg').attr('viewBox') ?? $('svg').attr('viewbox') ?? '0 0 1000 700';
  const vb = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
  const viewboxWidth  = vb[2] ?? 1000;
  const viewboxHeight = vb[3] ?? 700;

  const sections: IParsedSection[] = [];
  let sortOrder = 0;

  $('path[id], polygon[id], rect[id], g[id] > path').each((_, el) => {
    const $el = $(el);
    const elTag = el.type === 'tag' ? el.name : '';

    // Prefer ID from element or parent <g>
    const id = $el.attr('id') ?? $($el.parent()).attr('id') ?? '';
    if (!id) return;

    // Skip background/decorative elements
    const idLower = id.toLowerCase();
    if (['background', 'bg', 'border', 'logo', 'text'].some((skip) => idLower.includes(skip))) return;

    // Extract path data
    let svgPath = '';
    if (elTag === 'path') {
      svgPath = $el.attr('d') ?? '';
    } else if (elTag === 'polygon') {
      const pts = ($el.attr('points') ?? '').trim().split(/[\s,]+/);
      const pairs: string[] = [];
      for (let i = 0; i + 1 < pts.length; i += 2) {
        pairs.push(`${i === 0 ? 'M' : 'L'}${pts[i]},${pts[i + 1]}`);
      }
      svgPath = pairs.join(' ') + ' Z';
    } else if (elTag === 'rect') {
      const x = Number($el.attr('x') ?? 0);
      const y = Number($el.attr('y') ?? 0);
      const w = Number($el.attr('width') ?? 0);
      const h = Number($el.attr('height') ?? 0);
      svgPath = `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`;
    }

    if (!svgPath) return;

    // Detect fill-rule from element or parent
    const fillRule = ($el.attr('fill-rule') ?? $($el.parent()).attr('fill-rule') ?? 'nonzero') === 'evenodd'
      ? 'evenodd' : 'nonzero';

    const code = id.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const name = formatSectionName(code);
    const category = inferCategory(code, $el.attr('class') ?? '');
    const centroid  = estimateCentroid(svgPath, viewboxWidth, viewboxHeight);

    sections.push({
      sectionCode: code,
      officialName: name,
      category,
      svgPath,
      fillRule: fillRule as 'nonzero' | 'evenodd',
      labelX: centroid.x,
      labelY: centroid.y,
      aliases: buildAliases(code, name),
      sortOrder: sortOrder++,
    });
  });

  console.log(`  ✓ ${sections.length} sections extraites (${viewboxWidth}×${viewboxHeight})`);
  return { sections, viewboxWidth, viewboxHeight };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSectionName(code: string): string {
  return code
    .replace(/_+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferCategory(code: string, cssClass: string): SectionCategory {
  const c = `${code} ${cssClass}`.toLowerCase();
  if (c.match(/scene|stage/))                                   return 'STAGE';
  if (c.match(/loge/))                                          return 'VIP_LOGES';
  if (c.match(/carre_or|carreor|golden|premium|vip/))           return 'VIP_PREMIUM';
  if (c.match(/parterre|fosse|pit|standing|debout/))            return 'STANDING_PIT';
  if (c.match(/gradin|sup|upper|haut/))                         return 'UPPER_TIER';
  if (c.match(/inf|lower|bas/))                                 return 'LOWER_TIER';
  if (c.match(/mid|milieu|moyen/))                              return 'MIDDLE_TIER';
  if (c.match(/pmr|access|handicap/))                           return 'ACCESSIBLE';
  if (c.match(/assis|seated|floor|parterre/))                   return 'SEATED_FLOOR';
  return 'LOWER_TIER';
}

function buildAliases(code: string, name: string): string[] {
  const base = [name.toLowerCase(), code.toLowerCase(), code.replace(/_/g, ' ').toLowerCase()];
  const extra: string[] = [];
  if (code.includes('PARTERRE') || code.includes('FOSSE')) extra.push('fosse', 'pit', 'debout', 'standing');
  if (code.includes('CARRE') || code.includes('VIP'))      extra.push('carré or', 'carre or', 'vip', 'golden');
  if (code.includes('GRADIN'))                             extra.push('gradin', 'upper', 'hauteur');
  if (code.includes('TRIBUNE'))                            extra.push('tribune', 'balcon');
  return [...new Set([...base, ...extra])];
}

function estimateCentroid(path: string, vbW: number, vbH: number): { x: number; y: number } {
  const re = /[ML]\s*([\d.+-]+)[,\s]+([\d.+-]+)/gi;
  let m: RegExpExecArray | null;
  let sx = 0, sy = 0, n = 0;
  while ((m = re.exec(path)) !== null) {
    sx += parseFloat(m[1]); sy += parseFloat(m[2]); n++;
  }
  if (n === 0) return { x: vbW / 2, y: vbH / 2 };
  return { x: Math.round(sx / n), y: Math.round(sy / n) };
}

// ─── DB upsert ───────────────────────────────────────────────────────────────

async function upsertVenueAndSeatmap(
  config: IVenueConfig,
  sections: IParsedSection[],
  viewboxWidth: number,
  viewboxHeight: number,
  svgUrl: string,
  dryRun: boolean
): Promise<void> {
  if (dryRun) {
    console.log(`  [DRY-RUN] Upsert: Venue="${config.name}" — ${sections.length} sections`);
    sections.slice(0, 5).forEach((s) =>
      console.log(`    · ${s.sectionCode} (${s.category}) @ (${s.labelX}, ${s.labelY})`)
    );
    if (sections.length > 5) console.log(`    ... et ${sections.length - 5} autres`);
    return;
  }

  // 1. Venue
  const venue = await prisma.venue.upsert({
    where: { ticketmasterId: config.tmVenueId },
    create: {
      name: config.name,
      ticketmasterId: config.tmVenueId,
      city: config.city,
      address: config.address,
      country: config.country,
      capacity: config.capacity,
      venueType: config.venueType,
    },
    update: {
      name: config.name,
      city: config.city,
      address: config.address,
      capacity: config.capacity,
    },
  });

  // 2. VenueSeatmap — find or create (no compound @@unique on venueId+stageSetup)
  const existingSeatmap = await prisma.venueSeatmap.findFirst({
    where: { venueId: venue.id, stageSetup: config.stageSetup as any },
    select: { id: true },
  });

  const seatmapData = {
    configurationName: config.configurationName,
    seatmapSvgUrl: svgUrl,
    viewboxWidth,
    viewboxHeight,
    isDefault: config.isDefault,
  };

  const seatmap = existingSeatmap
    ? await prisma.venueSeatmap.update({ where: { id: existingSeatmap.id }, data: seatmapData })
    : await prisma.venueSeatmap.create({
        data: { ...seatmapData, venueId: venue.id, stageSetup: config.stageSetup as any },
      });

  // 3. VenueSection (delete + recreate for clean state)
  await prisma.venueSection.deleteMany({ where: { seatmapId: seatmap.id } });

  await prisma.venueSection.createMany({
    data: sections.map((s) => ({
      seatmapId:    seatmap.id,
      sectionCode:  s.sectionCode,
      officialName: s.officialName,
      category:     s.category as any,
      svgPath:      s.svgPath,
      fillRule:     s.fillRule,
      labelX:       s.labelX,
      labelY:       s.labelY,
      aliases:      s.aliases,
      sortOrder:    s.sortOrder,
    })),
  });

  console.log(`  ✅ Venue="${config.name}" — ${sections.length} sections sauvegardées (seatmap: ${seatmap.id})`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun    = args.includes('--dry-run');
  const forceFlag = args.includes('--force');
  const venueArg  = args.find((_, i) => args[i - 1] === '--venue');

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.error('❌ TICKETMASTER_API_KEY manquant dans les variables d\'environnement');
    console.error('   Ajoutez-le dans .env.local : TICKETMASTER_API_KEY=votre_clé');
    process.exit(1);
  }

  const venues = venueArg
    ? TARGET_VENUES.filter((v) => v.name.toUpperCase().includes(venueArg.toUpperCase()) || v.tmVenueId === venueArg)
    : TARGET_VENUES;

  if (venues.length === 0) {
    console.error(`❌ Aucune venue trouvée pour --venue "${venueArg}"`);
    console.error('   Valeurs valides: ACCOR, STADE, ZENITH, OLYMPIA, REX');
    process.exit(1);
  }

  console.log(`\n🎭 Import seatmaps Ticketmaster${dryRun ? ' [DRY-RUN]' : ''}`);
  console.log(`   ${venues.length} salle(s) à traiter\n`);

  let imported = 0, skipped = 0, failed = 0;

  for (const [idx, config] of venues.entries()) {
    if (idx > 0) await new Promise((r) => setTimeout(r, 1000));
    console.log(`\n📍 ${config.name} (TM ID: ${config.tmVenueId})`);

    try {
      // Check if already imported
      if (!forceFlag) {
        const existing = await prisma.venue.findUnique({
          where: { ticketmasterId: config.tmVenueId },
          include: { seatmaps: { include: { _count: { select: { sections: true } } } } },
        });
        if (existing && existing.seatmaps.some((s) => s._count.sections > 0)) {
          console.log(`  ⏭  Déjà importé (${existing.seatmaps[0]._count.sections} sections) — utilisez --force pour réimporter`);
          skipped++;
          continue;
        }
      }

      // Fetch seatmap SVG URL from TM API
      const svgUrl = await findEventWithSeatmap(config.tmVenueId, apiKey);
      if (!svgUrl) {
        console.warn(`  ⏭  Seatmap SVG non disponible via l'API — salle ignorée`);
        skipped++;
        continue;
      }

      // Parse SVG
      const { sections, viewboxWidth, viewboxHeight } = await parseSeatmapSVG(svgUrl);
      if (sections.length === 0) {
        console.warn(`  ⚠️  0 sections extraites du SVG — salle ignorée`);
        skipped++;
        continue;
      }

      // Save to DB
      await upsertVenueAndSeatmap(config, sections, viewboxWidth, viewboxHeight, svgUrl, dryRun);
      imported++;

    } catch (err) {
      console.error(`  ❌ Erreur pour ${config.name}:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`✅ Importés  : ${imported}`);
  console.log(`⏭  Ignorés   : ${skipped}`);
  console.log(`❌ Échoués   : ${failed}`);
  console.log(`─────────────────────────────────────\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
