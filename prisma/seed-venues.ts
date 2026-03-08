/**
 * Seed: Venues & Seatmaps réalistes pour les principales salles françaises
 *
 * Exécuter avec : npx tsx prisma/seed-venues.ts
 *
 * Contient :
 *  - Accor Arena (Paris Bercy) — Config Frontale
 *  - Accor Arena — Module 360° (Coldplay / Taylor Swift)
 *  - Stade de France — Config Concert (Frontale)
 *  - Zénith de Paris
 *
 * Les paths SVG sont des approximations fidèles des vraies géométries,
 * destinées à être remplacées par les SVG officiels Ticketmaster si disponibles.
 */

import { PrismaClient, SectionCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Accor Arena — Configuration Frontale (1000×680) ─────────────────────────
//
// Layout (haut→bas) :
//   Scène (trapèze haut-centre)
//   Carré Or / Tribune A NW-NE / Tribune B W-E
//   Parterre Debout (grande zone centrale, U autour du Carré Or)
//   Tribune A Ouest + Tribune A Est (ailes)
//   Tribune B Sud (arc bas)
//   Gradin Supérieur (arc extérieur)
//
const ACCOR_ARENA_FRONTAL = [
  {
    sectionCode: 'SCENE',
    officialName: 'Scène',
    category: 'STAGE' as const,
    svgPath: 'M 300,20 Q 500,8 700,20 L 710,108 Q 500,92 290,108 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 60,
    capacity: null,
    sortOrder: 0,
    aliases: ['scene', 'stage', 'scène'],
  },
  {
    sectionCode: 'CARRE_OR',
    officialName: 'Carré Or',
    category: 'VIP_PREMIUM' as const,
    svgPath: 'M 385,112 L 615,112 L 618,215 Q 500,225 382,215 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 164,
    capacity: 300,
    sortOrder: 1,
    aliases: ['carré or', 'carre or', 'vip', 'golden circle', 'or', 'premium'],
  },
  {
    sectionCode: 'PARTERRE_DEBOUT',
    officialName: 'Parterre Debout',
    category: 'STANDING_PIT' as const,
    // U-shape : rectangle avec encoche rectangulaire en haut (Carré Or)
    svgPath: 'M 242,112 L 385,112 L 382,215 Q 500,225 618,215 L 615,112 L 758,112 L 758,362 L 242,362 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 302,
    capacity: 4000,
    sortOrder: 2,
    aliases: ['parterre', 'parterre debout', 'fosse', 'fosse debout', 'pit', 'standing', 'debout', 'ga'],
  },
  {
    sectionCode: 'TRIBUNE_A_OUEST',
    officialName: 'Tribune A Ouest',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 120,110 L 238,110 L 242,362 L 212,384 L 90,352 Q 82,234 120,110 Z',
    fillRule: 'nonzero' as const,
    labelX: 164, labelY: 252,
    capacity: 1200,
    sortOrder: 3,
    aliases: ['tribune a ouest', 'tribune a o', 'balcon ouest', 'côté gauche'],
  },
  {
    sectionCode: 'TRIBUNE_A_EST',
    officialName: 'Tribune A Est',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 762,110 L 880,110 Q 918,234 910,352 L 788,384 L 758,362 L 762,110 Z',
    fillRule: 'nonzero' as const,
    labelX: 836, labelY: 252,
    capacity: 1200,
    sortOrder: 4,
    aliases: ['tribune a est', 'tribune a e', 'balcon est', 'côté droit'],
  },
  {
    sectionCode: 'TRIBUNE_B_NW',
    officialName: 'Tribune B Nord-Ouest',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 42,22 L 298,20 Q 300,20 290,108 L 118,110 Q 90,88 62,80 L 42,60 Z',
    fillRule: 'nonzero' as const,
    labelX: 178, labelY: 65,
    capacity: 800,
    sortOrder: 5,
    aliases: ['tribune b nord-ouest', 'tribune b nw', 'nord-ouest'],
  },
  {
    sectionCode: 'TRIBUNE_B_NE',
    officialName: 'Tribune B Nord-Est',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 702,20 L 958,22 L 958,60 L 938,80 Q 910,88 882,110 L 710,108 Q 700,20 702,20 Z',
    fillRule: 'nonzero' as const,
    labelX: 822, labelY: 65,
    capacity: 800,
    sortOrder: 6,
    aliases: ['tribune b nord-est', 'tribune b ne', 'nord-est'],
  },
  {
    sectionCode: 'TRIBUNE_B_OUEST',
    officialName: 'Tribune B Ouest',
    category: 'MIDDLE_TIER' as const,
    svgPath: 'M 42,60 L 62,80 Q 90,88 118,110 Q 82,234 90,352 L 62,368 Q 24,288 42,60 Z',
    fillRule: 'nonzero' as const,
    labelX: 54, labelY: 222,
    capacity: 600,
    sortOrder: 7,
    aliases: ['tribune b ouest', 'tribune b o'],
  },
  {
    sectionCode: 'TRIBUNE_B_EST',
    officialName: 'Tribune B Est',
    category: 'MIDDLE_TIER' as const,
    svgPath: 'M 958,60 L 976,288 Q 958,368 938,368 L 910,352 Q 918,234 882,110 Q 910,88 938,80 Z',
    fillRule: 'nonzero' as const,
    labelX: 946, labelY: 222,
    capacity: 600,
    sortOrder: 8,
    aliases: ['tribune b est', 'tribune b e'],
  },
  {
    sectionCode: 'TRIBUNE_B_SUD',
    officialName: 'Tribune B Sud',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 62,368 L 90,352 L 212,384 L 788,384 L 910,352 L 938,368 Q 904,464 814,508 Q 500,532 186,508 Q 96,464 62,368 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 444,
    capacity: 2000,
    sortOrder: 9,
    aliases: ['tribune b sud', 'tribune b s', 'sud', 'parterre arrière'],
  },
  {
    sectionCode: 'GRADIN_SUPERIEUR',
    officialName: 'Gradin Supérieur',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 96,464 Q 500,532 904,464 Q 936,554 856,598 Q 500,624 144,598 Q 64,554 96,464 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 548,
    capacity: 3000,
    sortOrder: 10,
    aliases: ['gradin supérieur', 'gradin superieur', 'gradin', 'upper tier', 'hauteur', 'haut'],
  },
];

// ─── Accor Arena — Module 360° (1000×1000) ────────────────────────────────────
//
// Layout concentrique :
//   Scène centrale (cercle r=92, centre 500,500)
//   Carré Or / Golden Circle (anneau r=92→160, evenodd)
//   Parterre Debout (anneau r=160→262, evenodd)
//   4 gradins directionnels (secteurs r=262→438)
//   Gradin Supérieur (arc extérieur r>438)
//
// Coordonnées clés pour r=262 :
//   Top (90°):    (500, 238)
//   45°:          (685, 315)
//   Right (0°):   (762, 500)
//   315°:         (685, 685)
//   Bottom (270°):(500, 762)
//   225°:         (315, 685)
//   Left (180°):  (238, 500)
//   135°:         (315, 315)
//
// Pour r=438 :
//   Top:    (500, 62)
//   45°:    (810, 190)
//   Right:  (938, 500)
//   315°:   (810, 810)
//   Bottom: (500, 938)
//   225°:   (190, 810)
//   Left:   (62, 500)
//   135°:   (190, 190)
//
const ACCOR_ARENA_360 = [
  {
    sectionCode: 'SCENE_CENTRALE',
    officialName: 'Scène Centrale',
    category: 'STAGE' as const,
    // Cercle plein r=92 centré en (500,500)
    svgPath: 'M 408,500 A 92,92 0 1,0 592,500 A 92,92 0 1,0 408,500 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 500,
    capacity: null,
    sortOrder: 0,
    aliases: ['scene', 'stage', 'scène centrale'],
  },
  {
    sectionCode: 'CARRE_OR',
    officialName: 'Carré Or / Golden Circle',
    category: 'VIP_PREMIUM' as const,
    // Anneau r=92→160, fill-rule evenodd
    svgPath:
      'M 340,500 A 160,160 0 1,0 660,500 A 160,160 0 1,0 340,500 Z ' +
      'M 408,500 A 92,92 0 1,1 592,500 A 92,92 0 1,1 408,500 Z',
    fillRule: 'evenodd' as const,
    labelX: 500, labelY: 374,
    capacity: 500,
    sortOrder: 1,
    aliases: ['carré or', 'golden circle', 'carre or', 'vip', 'fosse vip', 'premium'],
  },
  {
    sectionCode: 'PARTERRE_DEBOUT',
    officialName: 'Parterre Debout',
    category: 'STANDING_PIT' as const,
    // Anneau r=160→262, fill-rule evenodd
    svgPath:
      'M 238,500 A 262,262 0 1,0 762,500 A 262,262 0 1,0 238,500 Z ' +
      'M 340,500 A 160,160 0 1,1 660,500 A 160,160 0 1,1 340,500 Z',
    fillRule: 'evenodd' as const,
    labelX: 500, labelY: 282,
    capacity: 3500,
    sortOrder: 2,
    aliases: ['parterre', 'fosse', 'standing', 'debout', 'parterre debout', 'pit'],
  },
  {
    sectionCode: 'GRADIN_NORD',
    officialName: 'Gradin Nord',
    category: 'UPPER_TIER' as const,
    // Secteur r=262→438, de 135° à 45° (arc du haut)
    svgPath: 'M 315,315 A 262,262 0 0,1 685,315 L 810,190 A 438,438 0 0,0 190,190 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 152,
    capacity: 1800,
    sortOrder: 3,
    aliases: ['gradin nord', 'nord', 'north', 'gradin n'],
  },
  {
    sectionCode: 'GRADIN_EST',
    officialName: 'Gradin Est',
    category: 'UPPER_TIER' as const,
    // Secteur r=262→438, de 45° à 315° (arc de droite)
    svgPath: 'M 685,315 A 262,262 0 0,1 685,685 L 810,810 A 438,438 0 0,0 810,190 Z',
    fillRule: 'nonzero' as const,
    labelX: 848, labelY: 500,
    capacity: 1800,
    sortOrder: 4,
    aliases: ['gradin est', 'est', 'east', 'gradin e', 'droite'],
  },
  {
    sectionCode: 'GRADIN_SUD',
    officialName: 'Gradin Sud',
    category: 'UPPER_TIER' as const,
    // Secteur r=262→438, de 315° à 225° (arc du bas)
    svgPath: 'M 685,685 A 262,262 0 0,1 315,685 L 190,810 A 438,438 0 0,0 810,810 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 848,
    capacity: 1800,
    sortOrder: 5,
    aliases: ['gradin sud', 'sud', 'south', 'gradin s'],
  },
  {
    sectionCode: 'GRADIN_OUEST',
    officialName: 'Gradin Ouest',
    category: 'UPPER_TIER' as const,
    // Secteur r=262→438, de 225° à 135° (arc de gauche)
    svgPath: 'M 315,685 A 262,262 0 0,1 315,315 L 190,190 A 438,438 0 0,0 190,810 Z',
    fillRule: 'nonzero' as const,
    labelX: 152, labelY: 500,
    capacity: 1800,
    sortOrder: 6,
    aliases: ['gradin ouest', 'ouest', 'west', 'gradin o', 'gauche'],
  },
];

// ─── Stade de France — Config Concert Frontale (1000×900) ────────────────────
//
// Tribunes nommées d'après le SdF réel :
//  - Denis Bergkamp (nord, derrière scène)
//  - Marcel Desailly (est, côté long)
//  - Jean Bouin / Michel Platini (ouest, côté long)
//  - Claude Simonnet (sud, face scène)
//
const STADE_DE_FRANCE = [
  {
    sectionCode: 'SCENE_SDF',
    officialName: 'Scène',
    category: 'STAGE' as const,
    svgPath: 'M 260,22 Q 500,8 740,22 L 748,95 Q 500,82 252,95 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 58,
    capacity: null,
    sortOrder: 0,
    aliases: ['scene', 'stage', 'scène'],
  },
  {
    sectionCode: 'PELOUSE_DEBOUT',
    officialName: 'Pelouse Debout',
    category: 'STANDING_PIT' as const,
    // Pelouse = grande zone floor
    svgPath: 'M 218,100 L 388,100 L 388,200 L 612,200 L 612,100 L 782,100 L 782,435 L 218,435 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 342,
    capacity: 6000,
    sortOrder: 1,
    aliases: ['pelouse', 'pelouse debout', 'fosse', 'parterre', 'pit', 'floor', 'debout', 'standing'],
  },
  {
    sectionCode: 'CARRE_OR_SDF',
    officialName: 'Carré Or',
    category: 'VIP_PREMIUM' as const,
    svgPath: 'M 388,100 L 612,100 L 612,200 L 388,200 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 150,
    capacity: 400,
    sortOrder: 2,
    aliases: ['carré or', 'carre or', 'vip', 'golden circle', 'premium'],
  },
  // Tribunes Bergkamp (Nord, derrière scène) — côté gauche et droit de la scène
  {
    sectionCode: 'BERGKAMP_INF_OG',
    officialName: 'Tribune Bergkamp Inférieure Côté Gauche',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 115,22 L 255,22 L 252,95 L 218,100 L 95,96 Q 85,62 115,22 Z',
    fillRule: 'nonzero' as const,
    labelX: 178, labelY: 62,
    capacity: 900,
    sortOrder: 3,
    aliases: ['bergkamp gauche', 'tribune bergkamp og', 'tribune nord gauche inf', 'nord gauche'],
  },
  {
    sectionCode: 'BERGKAMP_INF_OD',
    officialName: 'Tribune Bergkamp Inférieure Côté Droit',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 745,22 L 885,22 Q 915,62 905,96 L 782,100 L 748,95 Z',
    fillRule: 'nonzero' as const,
    labelX: 822, labelY: 62,
    capacity: 900,
    sortOrder: 4,
    aliases: ['bergkamp droit', 'tribune bergkamp od', 'tribune nord droit inf', 'nord droit'],
  },
  // Tribunes latérales inférieures
  {
    sectionCode: 'DESAILLY_INF',
    officialName: 'Tribune Desailly Inférieure',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 786,100 L 908,96 Q 932,252 922,438 L 786,438 L 782,435 L 782,100 Z',
    fillRule: 'nonzero' as const,
    labelX: 858, labelY: 268,
    capacity: 1800,
    sortOrder: 5,
    aliases: ['desailly', 'tribune desailly inf', 'tribune est', 'est inf'],
  },
  {
    sectionCode: 'PLATINI_INF',
    officialName: 'Tribune Platini Inférieure',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 78,96 L 214,100 L 218,435 L 218,438 L 78,438 Q 68,252 78,96 Z',
    fillRule: 'nonzero' as const,
    labelX: 142, labelY: 268,
    capacity: 1800,
    sortOrder: 6,
    aliases: ['platini', 'tribune platini inf', 'tribune ouest', 'ouest inf'],
  },
  // Tribune Sud Inférieure (face à la scène)
  {
    sectionCode: 'SIMONNET_INF',
    officialName: 'Tribune Simonnet Inférieure',
    category: 'LOWER_TIER' as const,
    svgPath: 'M 78,438 L 218,438 L 222,510 L 778,510 L 782,438 L 922,438 Q 912,548 848,582 Q 500,606 152,582 Q 88,548 78,438 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 526,
    capacity: 2200,
    sortOrder: 7,
    aliases: ['simonnet', 'tribune simonnet', 'tribune sud', 'sud inf', 'sud'],
  },
  // Tribunes supérieures (coins nord)
  {
    sectionCode: 'BERGKAMP_SUP_OG',
    officialName: 'Tribune Bergkamp Supérieure CG',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 48,18 L 115,22 Q 85,62 95,96 L 50,100 Q 24,62 48,18 Z',
    fillRule: 'nonzero' as const,
    labelX: 78, labelY: 58,
    capacity: 400,
    sortOrder: 8,
    aliases: ['bergkamp sup gauche', 'nord gauche sup'],
  },
  {
    sectionCode: 'BERGKAMP_SUP_OD',
    officialName: 'Tribune Bergkamp Supérieure CD',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 885,22 L 952,18 Q 976,62 950,100 L 905,96 Q 915,62 885,22 Z',
    fillRule: 'nonzero' as const,
    labelX: 922, labelY: 58,
    capacity: 400,
    sortOrder: 9,
    aliases: ['bergkamp sup droit', 'nord droit sup'],
  },
  // Tribunes supérieures latérales
  {
    sectionCode: 'DESAILLY_SUP',
    officialName: 'Tribune Desailly Supérieure',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 908,96 L 952,100 Q 968,258 958,440 L 922,440 L 922,438 Q 932,252 908,96 Z',
    fillRule: 'nonzero' as const,
    labelX: 942, labelY: 268,
    capacity: 900,
    sortOrder: 10,
    aliases: ['desailly sup', 'est sup', 'tribune est sup'],
  },
  {
    sectionCode: 'PLATINI_SUP',
    officialName: 'Tribune Platini Supérieure',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 48,100 L 78,96 Q 68,252 78,438 L 42,440 Q 32,258 48,100 Z',
    fillRule: 'nonzero' as const,
    labelX: 58, labelY: 268,
    capacity: 900,
    sortOrder: 11,
    aliases: ['platini sup', 'ouest sup', 'tribune ouest sup'],
  },
  // Tribune Supérieure Sud (virage, face scène)
  {
    sectionCode: 'SIMONNET_SUP',
    officialName: 'Tribune Simonnet Supérieure',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 42,440 L 78,438 Q 88,548 152,582 Q 500,606 848,582 Q 912,548 922,438 L 958,440 Q 968,562 892,622 Q 500,652 108,622 Q 32,562 42,440 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 600,
    capacity: 2400,
    sortOrder: 12,
    aliases: ['simonnet sup', 'sud sup', 'tribune sud sup'],
  },
];

// ─── Zénith de Paris — Config Frontale (1000×640) ─────────────────────────────
const ZENITH_PARIS = [
  {
    sectionCode: 'SCENE_ZENITH',
    officialName: 'Scène',
    category: 'STAGE' as const,
    svgPath: 'M 310,22 Q 500,10 690,22 L 698,98 Q 500,88 302,98 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 58,
    capacity: null,
    sortOrder: 0,
    aliases: ['scene', 'stage'],
  },
  {
    sectionCode: 'CARRE_OR_ZENITH',
    officialName: 'Carré Or',
    category: 'VIP_PREMIUM' as const,
    svgPath: 'M 400,104 L 600,104 L 600,192 L 400,192 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 148,
    capacity: 200,
    sortOrder: 1,
    aliases: ['carré or', 'carre or', 'vip', 'golden circle'],
  },
  {
    sectionCode: 'PARTERRE_ZENITH',
    officialName: 'Parterre Debout',
    category: 'STANDING_PIT' as const,
    svgPath: 'M 252,104 L 400,104 L 400,192 L 600,192 L 600,104 L 748,104 L 748,348 L 252,348 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 292,
    capacity: 2500,
    sortOrder: 2,
    aliases: ['parterre', 'fosse', 'pit', 'standing', 'debout'],
  },
  {
    sectionCode: 'GRADIN_HAUT_NW',
    officialName: 'Gradin Haut Nord-Ouest',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 52,22 L 308,22 L 302,98 L 118,104 Q 90,82 65,70 L 52,50 Z',
    fillRule: 'nonzero' as const,
    labelX: 185, labelY: 62,
    capacity: 500,
    sortOrder: 3,
    aliases: ['gradin nord-ouest', 'gradin nw', 'nord-ouest'],
  },
  {
    sectionCode: 'GRADIN_HAUT_NE',
    officialName: 'Gradin Haut Nord-Est',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 692,22 L 948,22 L 948,50 L 935,70 Q 910,82 882,104 L 698,98 Z',
    fillRule: 'nonzero' as const,
    labelX: 815, labelY: 62,
    capacity: 500,
    sortOrder: 4,
    aliases: ['gradin nord-est', 'gradin ne', 'nord-est'],
  },
  {
    sectionCode: 'GRADIN_OUEST',
    officialName: 'Gradin Ouest',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 52,50 L 65,70 Q 90,82 118,104 Q 84,228 92,352 L 64,364 Q 26,282 52,50 Z',
    fillRule: 'nonzero' as const,
    labelX: 56, labelY: 218,
    capacity: 450,
    sortOrder: 5,
    aliases: ['gradin ouest', 'west', 'gauche'],
  },
  {
    sectionCode: 'GRADIN_EST',
    officialName: 'Gradin Est',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 935,70 L 948,50 Q 974,282 936,364 L 908,352 Q 916,228 882,104 Q 910,82 935,70 Z',
    fillRule: 'nonzero' as const,
    labelX: 944, labelY: 218,
    capacity: 450,
    sortOrder: 6,
    aliases: ['gradin est', 'east', 'droite'],
  },
  {
    sectionCode: 'GRADIN_SUD',
    officialName: 'Gradin Sud',
    category: 'UPPER_TIER' as const,
    svgPath: 'M 64,364 L 92,352 L 252,348 L 748,348 L 908,352 L 936,364 Q 906,458 818,494 Q 500,516 182,494 Q 94,458 64,364 Z',
    fillRule: 'nonzero' as const,
    labelX: 500, labelY: 432,
    capacity: 1600,
    sortOrder: 7,
    aliases: ['gradin sud', 'south', 'parterre arrière', 'zone arrière'],
  },
];

// ─── Main Seeder ────────────────────────────────────────────────────────────

async function seedVenues() {
  console.log('🏟️  Seeding venues & seatmaps...\n');

  // ── Accor Arena ──────────────────────────────────────────────────────────
  const accorArena = await prisma.venue.upsert({
    where: { ticketmasterId: 'KovZpZAEdFtJ' },
    update: { name: 'Accor Arena', city: 'Paris' },
    create: {
      name: 'Accor Arena',
      ticketmasterId: 'KovZpZAEdFtJ',
      city: 'Paris',
      address: '8 Boulevard de Bercy, 75012 Paris',
      capacity: 20300,
      venueType: 'ARENA',
    },
  });
  console.log(`✅ Venue: ${accorArena.name}`);

  // Config frontale
  const accorFrontal = await prisma.venueSeatmap.upsert({
    where: { id: 'accor-frontal' },
    update: {},
    create: {
      id: 'accor-frontal',
      venueId: accorArena.id,
      stageSetup: 'FRONTAL',
      configurationName: 'Configuration Concert Frontale',
      viewboxWidth: 1000,
      viewboxHeight: 680,
      isDefault: true,
    },
  });
  await upsertSections(accorFrontal.id, ACCOR_ARENA_FRONTAL);
  console.log(`  ↳ Seatmap FRONTAL: ${ACCOR_ARENA_FRONTAL.length} sections`);

  // Config 360°
  const accor360 = await prisma.venueSeatmap.upsert({
    where: { id: 'accor-360' },
    update: {},
    create: {
      id: 'accor-360',
      venueId: accorArena.id,
      stageSetup: 'ROUND_360',
      configurationName: 'Module Concert 360°',
      viewboxWidth: 1000,
      viewboxHeight: 1000,
      isDefault: false,
    },
  });
  await upsertSections(accor360.id, ACCOR_ARENA_360);
  console.log(`  ↳ Seatmap 360°: ${ACCOR_ARENA_360.length} sections`);

  // ── Stade de France ──────────────────────────────────────────────────────
  const sdf = await prisma.venue.upsert({
    where: { ticketmasterId: 'KovZpZAE6ktA' },
    update: { name: 'Stade de France', city: 'Saint-Denis' },
    create: {
      name: 'Stade de France',
      ticketmasterId: 'KovZpZAE6ktA',
      city: 'Saint-Denis',
      address: 'Rue Francis de Pressensé, 93216 Saint-Denis',
      capacity: 81338,
      venueType: 'STADIUM',
    },
  });
  console.log(`✅ Venue: ${sdf.name}`);

  const sdfFrontal = await prisma.venueSeatmap.upsert({
    where: { id: 'sdf-frontal' },
    update: {},
    create: {
      id: 'sdf-frontal',
      venueId: sdf.id,
      stageSetup: 'FRONTAL',
      configurationName: 'Configuration Concert',
      viewboxWidth: 1000,
      viewboxHeight: 900,
      isDefault: true,
    },
  });
  await upsertSections(sdfFrontal.id, STADE_DE_FRANCE);
  console.log(`  ↳ Seatmap FRONTAL: ${STADE_DE_FRANCE.length} sections`);

  // ── Zénith de Paris ──────────────────────────────────────────────────────
  const zenith = await prisma.venue.upsert({
    where: { ticketmasterId: 'KovZpZAJeAEA' },
    update: { name: 'Zénith de Paris', city: 'Paris' },
    create: {
      name: 'Zénith de Paris',
      ticketmasterId: 'KovZpZAJeAEA',
      city: 'Paris',
      address: '211 Avenue Jean Jaurès, 75019 Paris',
      capacity: 6291,
      venueType: 'ARENA',
    },
  });
  console.log(`✅ Venue: ${zenith.name}`);

  const zenithFrontal = await prisma.venueSeatmap.upsert({
    where: { id: 'zenith-frontal' },
    update: {},
    create: {
      id: 'zenith-frontal',
      venueId: zenith.id,
      stageSetup: 'FRONTAL',
      configurationName: 'Configuration Standard',
      viewboxWidth: 1000,
      viewboxHeight: 640,
      isDefault: true,
    },
  });
  await upsertSections(zenithFrontal.id, ZENITH_PARIS);
  console.log(`  ↳ Seatmap FRONTAL: ${ZENITH_PARIS.length} sections`);

  console.log('\n✅ Seed terminé avec succès !');
  console.log('💡 Pour importer un seatmap Ticketmaster réel :');
  console.log('   TICKETMASTER_API_KEY=<key> npx tsx scripts/import-ticketmaster-seatmap.ts <venue-id>');
}

interface ISeedSection {
  sectionCode: string;
  officialName: string;
  category: SectionCategory;
  svgPath: string;
  fillRule: string;
  labelX: number;
  labelY: number;
  capacity: number | null;
  sortOrder: number;
  aliases: string[];
}

async function upsertSections(seatmapId: string, sections: ISeedSection[]) {
  for (const s of sections) {
    await prisma.venueSection.upsert({
      where: { seatmapId_sectionCode: { seatmapId, sectionCode: s.sectionCode } },
      update: {
        officialName: s.officialName,
        svgPath: s.svgPath,
        fillRule: s.fillRule,
        labelX: s.labelX,
        labelY: s.labelY,
        capacity: s.capacity ?? null,
        sortOrder: s.sortOrder,
        aliases: s.aliases,
      },
      create: {
        seatmapId,
        sectionCode: s.sectionCode,
        officialName: s.officialName,
        category: s.category,
        svgPath: s.svgPath,
        fillRule: s.fillRule,
        labelX: s.labelX,
        labelY: s.labelY,
        capacity: s.capacity ?? null,
        sortOrder: s.sortOrder,
        aliases: s.aliases,
      },
    });
  }
}

seedVenues()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
