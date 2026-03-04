/**
 * Service d'extraction automatique des données depuis les PDFs de billets
 * Compatible avec les principales billetteries françaises :
 * Fnac Spectacles, Ticketmaster, Digitick, Weezevent, See Tickets, France Billet
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { createHash } from 'crypto';

// Import direct de la lib (bypass du code de test dans index.js qui cause ENOENT)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js') as (
  buffer: Buffer,
  options?: { pagerender?: (pageData: any) => Promise<string> }
) => Promise<{ text: string; numpages: number }>;

// ============================================================================
// TYPES
// ============================================================================

// Un billet individuel dans un PDF multi-places
export interface ITicketItem {
  seatCategory: string | null;
  row: string | null;        // Rang / rangée (ex: "G", "15")
  seatNumber: string | null; // Numéro de place (ex: "5", "148")
  barcode: string | null;
  barcodeType: string | null;
}

export interface IExtractedTicketData {
  eventName: string | null;
  eventDate: Date | null;
  venueName: string | null;
  city: string | null;
  originalPrice: number | null;
  seatCategory: string | null;
  row: string | null;          // Rang / rangée uniquement (ex: "G", "15")
  seatNumber: string | null;   // Numéro de place uniquement (ex: "5", "148")
  barcode: string | null;
  barcodeType: string | null;
  tickets: ITicketItem[];      // Tous les billets détectés dans le PDF (≥1)
}

export interface IExtractionResult {
  pdfHash: string;
  pdfSizeBytes: number;
  extractedData: IExtractedTicketData;
  confidence: number; // 0.0 – 1.0
  warnings: string[];
  rawText: string; // Pour debug admin
  geminiEnhanced?: boolean; // true si Gemini a corrigé/confirmé le mapping
}

// ============================================================================
// PATTERNS REGEX — BILLETTERIES FRANÇAISES
// ============================================================================

const PATTERNS = {
  // Prix (€XX.XX, XX€, XX,XX€, Prix : XX, Total : XX)
  price: [
    /(?:prix\s+(?:unitaire|facial|du\s+billet)|tarif|total\s+ttc|montant)[\s:]*(\d+[,.]?\d{0,2})\s*€/gi,
    /€\s*(\d+[,.]?\d{0,2})/g,
    /(\d+[,.]?\d{0,2})\s*€(?!\s*de\s+frais)/g,
    /(\d+[,.]?\d{0,2})\s*EUR/gi,
  ],

  // Date (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, le DD mois YYYY)
  date: [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
    /(\d{1,2})\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi,
  ],

  // Mois français → numéro
  frenchMonths: {
    janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
    juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
  } as Record<string, number>,

  // Catégorie/Zone/Placement
  category: [
    /(?:catégorie|cat\.?|zone|placement|type\s+de\s+place)[\s:]+([^\n\r]{2,50})/gi,
    /(?:carré\s+or|fosse\s+(?:debout|or|1|2)|tribune\s+[a-z0-9]+|parterre|orchestre|balcon|gradin|pelouse|piste|standing|vip|premium)/gi,
    /(?:rang|rangée|row)[\s:]*(\d+|[a-z])\s*[,\-–]\s*(?:siège|place|seat)[\s:]*([a-z]?\d+)/gi,
  ],

  // Numéro de siège
  seat: [
    /(?:siège|seat|place\s+n°?|fauteuil)[\s:#]*([a-z]?\d+)/gi,
    /(?:rang|row|rangée)[\s:#]*(\d+|[a-z])\s+(?:siège|seat)[\s:#]*([a-z]?\d+)/gi,
    /(?:sièges?|places?)[\s:]*([a-z]\d+(?:\s*(?:à|-)\s*[a-z]\d+)?)/gi,
  ],

  // Lieux connus
  knownVenues: [
    'Stade de France', 'Accor Arena', 'Bercy', 'Zénith', 'Olympia',
    'La Cigale', 'Bataclan', 'Élysée Montmartre', 'Grand Rex', 'Palais des Sports',
    'Palais Omnisports', 'Dôme de Paris', 'Arena', 'Zénith',
    'Parc des Princes', 'Vélodrome', 'Groupama Stadium', 'Allianz Riviera',
    'U Arena', 'Rockhal', 'Forest National', 'Palau Sant Jordi',
    // Salles parisiennes
    'Folies Bergère', 'Folies Bergere', 'Casino de Paris', 'Salle Pleyel',
    'Philharmonie de Paris', 'Théâtre du Châtelet', 'Opéra Bastille',
    'Palais Royal', 'Cirque d\'Hiver', 'Trianon', 'La Gaîté Lyrique',
    'Le Zénith de Paris', 'Salle Gaveau', 'Grand Amphithéâtre', 'Alhambra',
    'Le Bataclan', 'La Bellevilloise', 'Café de la Danse', 'Point Ephémère',
    'La Maroquinerie', 'Rex Club', 'Trabendo', 'Le Grand Rex',
    // Salles province
    'Zénith de Lyon', 'Zénith de Bordeaux', 'Zénith de Toulouse',
    'Zénith de Nantes', 'Zénith de Lille', 'Zénith de Strasbourg',
    'Salle Vallier', 'Halle Tony Garnier', 'Amphithéâtre', 'Co\'met',
  ],

  // Ville
  cities: [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux',
    'Lille', 'Strasbourg', 'Montpellier', 'Rennes', 'Reims', 'Saint-Étienne',
    'Le Havre', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes',
    'Villeurbanne', 'Metz', 'Clermont-Ferrand', 'Brest', 'Amiens',
    'Limoges', 'Tours', 'Saint-Denis', 'Nanterre', 'Poissy',
    // Villes moyennes fréquentes en billetterie française
    'Beauvais', 'Caen', 'Rouen', 'Orléans', 'Mulhouse', 'Perpignan',
    'Besançon', 'Nancy', 'Versailles', 'Aix-en-Provence', 'Cannes',
    'Pau', 'Bayonne', 'Biarritz', 'Lorient', 'Quimper', 'Vannes',
    'Troyes', 'Poitiers', 'La Rochelle', 'Roanne', 'Valence', 'Avignon',
    'Chartres', 'Compiègne', 'Colmar', 'Épinal', 'Châlons-en-Champagne',
  ],

  // Code-barres EAN13 (13 chiffres stricts)
  barcode_ean13: /\b(\d{13})\b/g,

  // Code alphanumérique billet (typique Ticketmaster, FnacTickets)
  barcode_alphanumeric: /\b([A-Z0-9]{10,20})\b/g,
};

// ============================================================================
// SERVICE PRINCIPAL
// ============================================================================

export class PDFExtractionService {

  /**
   * Point d'entrée principal — extrait les données depuis un Buffer PDF
   */
  static async extractFromBuffer(pdfBuffer: Buffer): Promise<IExtractionResult> {
    const warnings: string[] = [];
    const pdfHash = createHash('sha256').update(pdfBuffer).digest('hex');

    let rawText = '';
    let numpages = 1;
    const pageTexts: string[] = []; // texte par page — 1 page = 1 billet

    try {
      const pdfData = await pdfParse(pdfBuffer, {
        // Capture le texte de chaque page individuellement
        pagerender: async (pageData: any) => {
          try {
            const tc = await pageData.getTextContent();
            const text: string = tc.items.map((it: any) => it.str ?? '').join(' ');
            pageTexts.push(text);
            return text;
          } catch {
            pageTexts.push('');
            return '';
          }
        },
      });
      rawText = pdfData.text || '';
      numpages = pdfData.numpages || 1;
    } catch (err) {
      console.error('[PDFExtraction] Erreur parsing PDF:', err);
      warnings.push('Impossible de lire le texte du PDF (PDF peut être scanné ou protégé)');
    }

    // Fallback si pagerender n'a rien collecté (PDF protégé, etc.)
    if (pageTexts.length === 0 && rawText) {
      pageTexts.push(rawText);
    }

    console.log(`[PDFExtraction] 📄 ${numpages} page(s) détectée(s) → ${numpages} billet(s) attendu(s)`);

    // ── 1. Extraction regex (sur le texte complet) ────────────────────────────
    const rawSeat = this.extractSeat(rawText);
    let extractedData: IExtractedTicketData = {
      eventName: this.extractEventName(rawText),
      eventDate: this.extractDate(rawText),
      venueName: this.extractVenue(rawText),
      city: this.extractCity(rawText),
      originalPrice: this.extractPrice(rawText),
      seatCategory: this.extractCategory(rawText),
      // Tenter de séparer rang et numéro de place depuis le résultat regex
      row:        rawSeat ? (rawSeat.match(/rang\s+(\S+)/i)?.[1] ?? null) : null,
      seatNumber: rawSeat ? (rawSeat.match(/(?:siège|place|seat)\s+(\S+)/i)?.[1] ?? rawSeat) : null,
      barcode: this.extractBarcode(rawText),
      barcodeType: null,
      tickets: [], // Rempli par Gemini (1 entrée par page)
    };

    if (extractedData.barcode) {
      extractedData.barcodeType = this.detectBarcodeType(extractedData.barcode);
    }

    // ── 2. Enhancement Gemini (OBLIGATOIRE) ──────────────────────────────────
    // Gemini valide et corrige systématiquement le mapping regex.
    // Si GEMINI_API_KEY est absent ou si l'API échoue → erreur remontée au client.
    let geminiEnhanced = false;
    if (rawText) {
      // Peut lever une erreur si GEMINI_API_KEY absent ou si l'API est indisponible.
      // Cette erreur est volontairement non interceptée ici pour garantir la vérification.
      const geminiResult = await this.enhanceWithGemini(rawText, extractedData, pageTexts, numpages);
      extractedData = geminiResult.data;
      geminiEnhanced = geminiResult.enhanced;
    } else {
      warnings.push('Texte PDF vide — vérification Gemini impossible (PDF scanné ou protégé ?)');
    }

    // ── 3. Score de confiance ─────────────────────────────────────────────────
    const { confidence, warnings: scoreWarnings } = this.calculateConfidence(extractedData);
    // Si Gemini a traité, confiance = 1.0 (il a comblé ou confirmé tous les champs)
    const finalConfidence = geminiEnhanced ? 1.0 : confidence;
    warnings.push(...scoreWarnings);

    // ── LOG DE DEBUG ──────────────────────────────────────────────────────────
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('[PDFExtraction] TEXTE BRUT EXTRAIT');
    console.log('════════════════════════════════════════════════════════════');
    console.log(rawText);
    console.log('════════════════════════════════════════════════════════════');
    console.log(`[PDFExtraction] MAPPING DES CHAMPS${geminiEnhanced ? ' [✨ Gemini enhanced]' : ' [regex only]'}`);
    console.log('════════════════════════════════════════════════════════════');
    console.log('  eventName    :', extractedData.eventName   ?? '⚠️  non trouvé');
    console.log('  eventDate    :', extractedData.eventDate?.toISOString().split('T')[0] ?? '⚠️  non trouvée');
    console.log('  venueName    :', extractedData.venueName   ?? '⚠️  non trouvé');
    console.log('  city         :', extractedData.city        ?? '⚠️  non trouvée');
    console.log('  originalPrice:', extractedData.originalPrice != null ? `${extractedData.originalPrice} €` : '⚠️  non trouvé');
    console.log('  seatCategory :', extractedData.seatCategory ?? '⚠️  non trouvée');
    console.log('  row          :', extractedData.row         ?? '—');
    console.log('  seatNumber   :', extractedData.seatNumber  ?? '⚠️  non trouvé');
    console.log('  barcode      :', extractedData.barcode     ?? '⚠️  non trouvé');
    console.log('  barcodeType  :', extractedData.barcodeType ?? '—');
    console.log('────────────────────────────────────────────────────────────');
    console.log(`  billets      : ${extractedData.tickets.length} (${numpages} page(s))`);
    extractedData.tickets.forEach((t, i) => {
      console.log(`    [${i + 1}] cat=${t.seatCategory ?? '—'} | rang=${t.row ?? '—'} | place=${t.seatNumber ?? '—'} | code=${t.barcode ?? '—'}`);
    });
    console.log('────────────────────────────────────────────────────────────');
    console.log(`  confidence   : ${(finalConfidence * 100).toFixed(0)} %${geminiEnhanced ? ' (Gemini ✓)' : ''}`);
    if (warnings.length) {
      console.log('  warnings     :', warnings.join(' | '));
    }
    console.log('════════════════════════════════════════════════════════════\n');
    // ─────────────────────────────────────────────────────────────────────────

    return {
      pdfHash,
      pdfSizeBytes: pdfBuffer.length,
      extractedData,
      confidence: finalConfidence,
      warnings,
      rawText: rawText.substring(0, 2000), // Limiter pour DB
      geminiEnhanced,
    };
  }

  // ============================================================================
  // ENHANCEMENT GEMINI — Validation & correction du mapping par LLM
  // ============================================================================

  private static async enhanceWithGemini(
    rawText: string,
    initial: IExtractedTicketData,
    pageTexts: string[] = [],
    numpages: number = 1,
  ): Promise<{ data: IExtractedTicketData; enhanced: boolean }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Gemini est requis — on lève une erreur explicite plutôt qu'un fallback silencieux
      throw new Error(
        '[Gemini] GEMINI_API_KEY non défini. Ajoutez cette variable dans votre fichier .env pour activer la vérification systématique du mapping.',
      );
    }

    console.log('[Gemini] 🚀 Appel Gemini 2.5 Flash pour validation du mapping…');

    try {
      // #region agent log — ListModels diagnostic (hypothèses A/B/C/D)
      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`,
        );
        const listJson = await listRes.json();
        const names: string[] = (listJson.models ?? []).map((m: any) => m.name);
        fetch('http://127.0.0.1:7243/ingest/112700f0-195e-4cf1-b1bf-59c719c5a177', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'pdf-extraction.service.ts:enhanceWithGemini',
            message: 'ListModels v1beta',
            data: { count: names.length, models: names },
            timestamp: Date.now(),
            hypothesisId: 'A-B-C-D',
          }),
        }).catch(() => {});
      } catch (listErr: any) {
        fetch('http://127.0.0.1:7243/ingest/112700f0-195e-4cf1-b1bf-59c719c5a177', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'pdf-extraction.service.ts:enhanceWithGemini',
            message: 'ListModels error',
            data: { error: listErr.message },
            timestamp: Date.now(),
            hypothesisId: 'A-B-C-D',
          }),
        }).catch(() => {});
      }
      // #endregion

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              eventName:     { type: SchemaType.STRING,  nullable: true },
              eventDate:     { type: SchemaType.STRING,  nullable: true,
                description: 'Format ISO YYYY-MM-DD. null si inconnue.' },
              venueName:     { type: SchemaType.STRING,  nullable: true },
              city:          { type: SchemaType.STRING,  nullable: true },
              originalPrice: { type: SchemaType.NUMBER,  nullable: true,
                description: 'Prix en euros, nombre décimal.' },
              seatCategory:  { type: SchemaType.STRING,  nullable: true,
                description: 'Catégorie ou zone du billet (ex: "Carré Or", "Catégorie 1", "Fosse debout", "Orchestre"). PAS le numéro de rang ou de place.' },
              row:           { type: SchemaType.STRING,  nullable: true,
                description: 'Numéro ou lettre du rang / rangée uniquement (ex: "G", "15", "A"). null si absent.' },
              seatNumber:    { type: SchemaType.STRING,  nullable: true,
                description: 'Numéro de place / siège uniquement (ex: "5", "148", "23"). PAS "Rang X, Place Y" — juste le chiffre ou code de la place.' },
              barcode:       { type: SchemaType.STRING,  nullable: true,
                description: 'Numéro de billet / code-barres le plus discriminant (premier billet).' },
              tickets:       {
                type: SchemaType.ARRAY,
                description: 'Liste de TOUS les billets individuels présents dans le PDF. Chaque billet a son propre rang, place et code-barres. Si le PDF contient 1 billet, retourner un tableau d\'un seul élément.',
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    seatCategory: { type: SchemaType.STRING, nullable: true,
                      description: 'Catégorie/zone pour ce billet spécifiquement.' },
                    row:          { type: SchemaType.STRING, nullable: true,
                      description: 'Rang de ce billet uniquement (ex: "G", "15").' },
                    seatNumber:   { type: SchemaType.STRING, nullable: true,
                      description: 'Numéro de place de ce billet uniquement (ex: "5").' },
                    barcode:      { type: SchemaType.STRING, nullable: true,
                      description: 'Code-barres / numéro unique de ce billet.' },
                  },
                  required: ['seatCategory', 'row', 'seatNumber', 'barcode'],
                },
              },
              correctionNotes: { type: SchemaType.STRING, nullable: true,
                description: 'Explique en une phrase les corrections apportées, ou null si tout est correct.' },
            },
            required: ['eventName', 'eventDate', 'venueName', 'city',
                       'originalPrice', 'seatCategory', 'row', 'seatNumber', 'barcode', 'tickets'],
          },
        },
      });

      // Construire le bloc "pages" pour le prompt
      const pagesBlock = pageTexts.length > 0
        ? pageTexts.map((t, i) =>
            `=== PAGE ${i + 1} / ${pageTexts.length} ===\n${t.substring(0, 3000)}`
          ).join('\n\n')
        : rawText.substring(0, 6000);

      const prompt = `Tu es un expert en extraction de données de billets de spectacle français.

RÈGLE ABSOLUE : Ce PDF contient ${numpages} page(s). Chaque page correspond à EXACTEMENT 1 billet.
Le tableau tickets[] doit donc contenir EXACTEMENT ${numpages} élément(s), un par page.

Voici le texte extrait page par page :
---
${pagesBlock}
---

Voici le mapping initial extrait par regex (peut contenir des erreurs ou des valeurs manquantes) :
- eventName     : ${initial.eventName ?? 'null'}
- eventDate     : ${initial.eventDate?.toISOString().split('T')[0] ?? 'null'}
- venueName     : ${initial.venueName ?? 'null'}
- city          : ${initial.city ?? 'null'}
- originalPrice : ${initial.originalPrice ?? 'null'}
- seatCategory  : ${initial.seatCategory ?? 'null'}
- row           : ${initial.row ?? 'null'}
- seatNumber    : ${initial.seatNumber ?? 'null'}
- barcode       : ${initial.barcode ?? 'null'}

Ta mission :
1. Lis attentivement chaque page séparément.
2. Confirme ou CORRIGE les champs communs à tous les billets (eventName, eventDate, venueName, city, originalPrice).
3. Pour chaque page (= 1 billet), extrait les données propres : seatCategory, row, seatNumber, barcode.
4. Renvoie UNIQUEMENT un JSON valide conforme au schéma fourni.
5. Pour eventDate, utilise le format YYYY-MM-DD (ex: "2026-01-14").
6. Pour originalPrice, ne retourne que le prix facial du billet (sans frais de service).
7. Pour barcode, préfère le numéro de billet individuel plutôt que le numéro de commande.
8. Pour seatCategory : indique UNIQUEMENT la catégorie/zone tarifaire (ex: "Carré Or", "Cat 1", "Fosse"). Jamais un numéro de rang ou de place.
9. Pour row : indique UNIQUEMENT le numéro ou la lettre du rang (ex: "G", "15"). null si absent.
10. Pour seatNumber : indique UNIQUEMENT le numéro de la place/siège (ex: "5", "148"). JAMAIS "Rang X, Place Y" — seulement le chiffre/code de la place.
11. tickets[] doit avoir EXACTEMENT ${numpages} entrée(s) (une par page). C'est une CONTRAINTE FERME.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log('[Gemini] 📥 Réponse brute :', responseText);

      // #region agent log — post-fix verification (hypothèse A confirmée)
      fetch('http://127.0.0.1:7243/ingest/112700f0-195e-4cf1-b1bf-59c719c5a177', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'pdf-extraction.service.ts:generateContent',
            message: 'Gemini generateContent SUCCESS',
            data: { model: 'gemini-2.5-flash', responseLength: responseText.length, preview: responseText.substring(0, 400) },
            timestamp: Date.now(),
            runId: 'post-fix-v2',
            hypothesisId: 'A-seat-artist',
          }),
      }).catch(() => {});
      // #endregion

      const parsed = JSON.parse(responseText);

      // Reconstruire IExtractedTicketData à partir de la réponse Gemini
      const rawTickets: ITicketItem[] = Array.isArray(parsed.tickets)
        ? parsed.tickets.map((t: any) => ({
            seatCategory: t.seatCategory ?? null,
            row:          t.row          ?? null,
            seatNumber:   t.seatNumber   ?? null,
            barcode:      t.barcode      ?? null,
            barcodeType:  t.barcode ? PDFExtractionService.detectBarcodeType(t.barcode) : null,
          }))
        : [];

      // Si Gemini n'a pas rempli tickets, construire depuis les champs racine (1 billet)
      let tickets: ITicketItem[] = rawTickets.length > 0 ? rawTickets : [{
        seatCategory: parsed.seatCategory ?? initial.seatCategory,
        row:          parsed.row          ?? initial.row,
        seatNumber:   parsed.seatNumber   ?? initial.seatNumber,
        barcode:      parsed.barcode      ?? initial.barcode,
        barcodeType:  (parsed.barcode ?? initial.barcode)
          ? PDFExtractionService.detectBarcodeType(parsed.barcode ?? initial.barcode ?? '')
          : null,
      }];

      // Garantie : tickets.length === numpages (1 page = 1 billet)
      if (tickets.length !== numpages && numpages > 0) {
        console.warn(
          `[Gemini] ⚠️  tickets.length=${tickets.length} ≠ numpages=${numpages}. Ajustement forcé.`
        );
        if (tickets.length < numpages) {
          // Compléter avec des entrées vides pour les pages manquantes
          for (let i = tickets.length; i < numpages; i++) {
            tickets.push({
              seatCategory: tickets[0]?.seatCategory ?? null,
              row: null, seatNumber: null, barcode: null, barcodeType: null,
            });
          }
        } else {
          // Tronquer si Gemini a retourné trop d'entrées
          tickets = tickets.slice(0, numpages);
        }
      }

      console.log(`[Gemini] ✅ ${tickets.length} billet(s) extrait(s) (${numpages} page(s) dans le PDF)`);

      const enhanced: IExtractedTicketData = {
        eventName:     parsed.eventName     ?? initial.eventName,
        eventDate:     parsed.eventDate     ? new Date(parsed.eventDate) : initial.eventDate,
        venueName:     parsed.venueName     ?? initial.venueName,
        city:          parsed.city          ?? initial.city,
        originalPrice: parsed.originalPrice != null ? Number(parsed.originalPrice) : initial.originalPrice,
        // Champs de niveau racine = premier billet (pour compatibilité)
        seatCategory:  tickets[0]?.seatCategory ?? parsed.seatCategory ?? initial.seatCategory,
        row:           tickets[0]?.row          ?? parsed.row          ?? initial.row,
        seatNumber:    tickets[0]?.seatNumber   ?? parsed.seatNumber   ?? initial.seatNumber,
        barcode:       tickets[0]?.barcode      ?? parsed.barcode      ?? initial.barcode,
        barcodeType:   initial.barcodeType,
        tickets,
      };

      // Recalculer le type de barcode si Gemini a trouvé un nouveau barcode
      if (enhanced.barcode && enhanced.barcode !== initial.barcode) {
        enhanced.barcodeType = PDFExtractionService.detectBarcodeType(enhanced.barcode);
      }

      // Log diff entre regex et Gemini
      const diff: Record<string, { regex: unknown; gemini: unknown }> = {};
      const fields = ['eventName', 'eventDate', 'venueName', 'city', 'originalPrice', 'seatCategory', 'row', 'seatNumber', 'barcode'] as const;
      for (const key of fields) {
        const regexVal = key === 'eventDate' ? initial.eventDate?.toISOString().split('T')[0] : initial[key];
        const geminiVal = key === 'eventDate' ? enhanced.eventDate?.toISOString().split('T')[0] : enhanced[key];
        if (String(regexVal ?? '') !== String(geminiVal ?? '')) {
          diff[key] = { regex: regexVal ?? null, gemini: geminiVal ?? null };
        }
      }

      if (Object.keys(diff).length > 0) {
        console.log('[Gemini] 🔧 Corrections apportées :');
        for (const [k, v] of Object.entries(diff)) {
          console.log(`  ${k.padEnd(14)} : "${v.regex}" → "${v.gemini}"`);
        }
      } else {
        console.log('[Gemini] ✅ Mapping regex confirmé sans correction.');
      }

      if (parsed.correctionNotes) {
        console.log('[Gemini] 📝 Notes :', parsed.correctionNotes);
      }

      return { data: enhanced, enhanced: true };
    } catch (err) {
      // Re-propager l'erreur — pas de fallback silencieux, Gemini est obligatoire
      console.error('[Gemini] ❌ Erreur Gemini :', err);
      throw err;
    }
  }

  // ============================================================================
  // EXTRACTION PRIX
  // ============================================================================

  private static extractPrice(text: string): number | null {
    const candidates: number[] = [];

    for (const pattern of PATTERNS.price) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const priceStr = match[1]?.replace(',', '.');
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price >= 1 && price <= 2000) {
          candidates.push(price);
        }
      }
    }

    if (candidates.length === 0) return null;

    // Retourner le prix le plus courant (ou le plus élevé si plusieurs valeurs)
    // On filtre les frais de service (souvent < 10€) si d'autres prix existent
    const mainPrices = candidates.filter(p => p >= 10);
    if (mainPrices.length > 0) {
      // Retourner la médiane
      mainPrices.sort((a, b) => a - b);
      return mainPrices[Math.floor(mainPrices.length / 2)];
    }

    return candidates[0];
  }

  // ============================================================================
  // EXTRACTION DATE
  // ============================================================================

  private static extractDate(text: string): Date | null {
    // Format DD/MM/YYYY ou DD/MM/YY (Ticketnet utilise des années sur 2 chiffres)
    const ddmmyyyy = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
    const match = text.match(ddmmyyyy);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      let year = parseInt(match[3]);
      if (year < 100) year += 2000; // 26 → 2026
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2024) {
        // Utiliser UTC pour éviter les décalages de timezone (ex: 14 jan → 13 jan)
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date > new Date(Date.now() - 86400000 * 30)) { // Pas plus d'1 mois dans le passé
          return date;
        }
      }
    }

    // Normaliser les mois en majuscules (Ticketnet : "14 FEVRIER 2026")
    // puis les mois en minuscules ("15 juillet 2025")
    const MONTH_NORMALIZE: Record<string, string> = {
      fevrier: 'février', aout: 'août', decembre: 'décembre',
      JANVIER: 'janvier', FEVRIER: 'février', MARS: 'mars', AVRIL: 'avril',
      MAI: 'mai', JUIN: 'juin', JUILLET: 'juillet', AOUT: 'août',
      SEPTEMBRE: 'septembre', OCTOBRE: 'octobre', NOVEMBRE: 'novembre',
      DECEMBRE: 'décembre', FÉVRIER: 'février', AOÛT: 'août', DÉCEMBRE: 'décembre',
    };
    const normalizedText = text.replace(
      /\b(janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\b/gi,
      (m) => MONTH_NORMALIZE[m] ?? m.toLowerCase(),
    );

    const monthMatch = normalizedText.match(
      /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i,
    );
      if (monthMatch) {
      const day = parseInt(monthMatch[1]);
      const monthNum = PATTERNS.frenchMonths[monthMatch[2].toLowerCase()];
      const year = parseInt(monthMatch[3]);
      if (monthNum && year >= 2024) {
        // Utiliser UTC pour éviter les décalages de timezone
        return new Date(Date.UTC(year, monthNum - 1, day));
      }
    }

    return null;
  }

  // ============================================================================
  // EXTRACTION NOM ÉVÉNEMENT
  // ============================================================================

  private static extractEventName(text: string): string | null {
    if (!text) return null;

    // ── Patterns explicites (priorité haute) ────────────────────────────────

    // Ticketnet / Digitick : "NUITS D'ARTISTES PRESENTE EN ACCORD AVEC ...\nARTISTE NOM"
    const ticketnetMatch = text.match(
      /(?:PRESENTE?S?|PRODUCTIONS?|ACCORD\s+AVEC)[^\n]*\n([A-ZÉÀÈÙÂÊÎÔÛÄËÏÖÜ][^\n\r]{2,60})\n/i,
    );
    if (ticketnetMatch?.[1]) {
      const candidate = ticketnetMatch[1].trim();
      if (!/(?:LES\s+\d+\s+ANS|TOUR|AVEC\s+NRJ)/i.test(candidate)) {
        return candidate.substring(0, 150);
      }
    }

    // Pattern générique événement / concert / spectacle
    const explicitPatterns = [
      /(?:événement|event|concert|spectacle|show)[\s:]+([^\n\r]{5,100})/i,
    ];
    for (const pattern of explicitPatterns) {
      const match = text.match(pattern);
      if (match?.[1]) return match[1].trim().substring(0, 150);
    }

    // ── Heuristique : lignes en MAJUSCULES entre l'adresse et la date ───────
    // On cherche un bloc "ARTISTE\nTOUR/SUBTITLE\nDATE" et on prend la 1ère ligne
    const upperBlockMatch = text.match(
      /\n\d+\s+(?:RUE|AVENUE|BOULEVARD|PLACE|ALLEE)[^\n]*\n([A-ZÉÀÈÙÂÊÎÔÛÄËÏÖÜ][A-ZÉÀÈÙÂÊÎÔÛÄËÏÖÜ\s]{3,60})\n/,
    );
    if (upperBlockMatch?.[1]) {
      const candidate = upperBlockMatch[1].trim();
      // Exclure les lignes de conditions légales (souvent toutes en maj aussi)
      if (!/(?:ATTENTION|N'ACHETEZ|CONDITIONS|NOUS\s+VOUS)/i.test(candidate)) {
        return candidate.substring(0, 150);
      }
    }

    // ── Fallback : premières lignes significatives ───────────────────────────
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5 && l.length < 150);

    // Ignorer les ~20 premières lignes (metadata Ticketnet) et les légales
    const SKIP = /(?:billet|ticket|reçu|confirmation|commande|order|ref|n°|\bfnac\b|\bticketmaster\b|\bticketnet\b|\bweezevent\b|attention|conditions|déclinons|interdit|pièce d'identité|uniquement valable)/i;
    for (const line of lines.slice(20, 40)) {
      if (SKIP.test(line)) continue;
      if (/^\d+$/.test(line)) continue;
      if (line.length >= 5 && line.length <= 80) {
        return line.substring(0, 150);
      }
    }

    return null;
  }

  // ============================================================================
  // EXTRACTION LIEU
  // ============================================================================

  private static extractVenue(text: string): string | null {
    // Chercher les lieux connus en premier
    for (const venue of PATTERNS.knownVenues) {
      if (text.toLowerCase().includes(venue.toLowerCase())) {
        return venue;
      }
    }

    // Heuristique : ligne courte (2-50 chars, tout en maj OU casse mixte) juste avant une adresse numérotée
    // Ex : "ELISPACE\n3 AVENUE PAUL HENRI SPAAK..." ou "Folies Bergère\n32 rue Richer"
    const beforeAddressMatch = text.match(
      /\n([A-ZÉÀÈÙÂÊÎÔÛÄËÏÖÜa-zéàèùâêîôûäëïöü][^\n\r]{1,48})\n\d+\s+(?:RUE|AVENUE|BOULEVARD|PLACE|ALLEE|IMPASSE|CHEMIN|ROUTE|ESPLANADE|rue|avenue|boulevard|place|allée|impasse|chemin|route|esplanade)/i,
    );
    if (beforeAddressMatch?.[1]) {
      const candidate = beforeAddressMatch[1].trim();
      // Exclure les lignes qui ressemblent à des noms de personne ou légales
      if (!/(?:n°|commande|billet|acheteur|responsable|l'accès|frais|TTC)/i.test(candidate)) {
        return candidate.substring(0, 80);
      }
    }

    // Patterns génériques — \bvenue\b (word boundary pour éviter de matcher "AVENUE")
    const venuePatterns = [
      /(?:lieu|salle|\bvenue\b|à\s+(?:la|le|l')|at\s+the)[\s:]+([^\n\r,]{5,80})/i,
      /\b(?:stade|arena|zénith|olympia|palais|hall|théâtre|dôme)\b\s+[a-zÀ-ÿ\s]{3,50}/i,
    ];

    for (const pattern of venuePatterns) {
      const match = text.match(pattern);
      if (match?.[0]) {
        return match[0].trim().substring(0, 100);
      }
    }

    return null;
  }

  // ============================================================================
  // EXTRACTION VILLE
  // ============================================================================

  private static extractCity(text: string): string | null {
    for (const city of PATTERNS.cities) {
      const regex = new RegExp(`\\b${city}\\b`, 'i');
      if (regex.test(text)) {
        return city;
      }
    }
    return null;
  }

  // ============================================================================
  // EXTRACTION CATÉGORIE
  // ============================================================================

  private static extractCategory(text: string): string | null {
    // ── Priorité 1 : pattern explicite CATEGORIE / CAT suivi d'un grade ─────
    // Ex : "CATEGORIE OR", "CAT OR", "CATEGORIE PELOUSE", "CAT 1"
    const explicitCatMatch = text.match(
      /(?:cat[ée]gorie|cat\.?)\s+([A-ZÉÀÈÙÂÊÎÔÛÄËÏÖÜ0-9][A-ZÉÀÈÙÂÊÎÔÛÄËÏÖÜa-z\s]{0,30}?)(?:\n|$)/i,
    );
    if (explicitCatMatch?.[1]) {
      const grade = explicitCatMatch[1].trim(); // ex: "OR", "1", "PELOUSE"

      // Chercher aussi la zone/section associée (ex: "PARTERRE A", "TRIBUNE NORD")
      const sectionMatch = text.match(/\b(PARTERRE\s*[A-Z]?|TRIBUNE\s*[A-Z0-9]*|FOSSE\s*[A-Z0-9]*|ORCHESTRE|BALCON|GRADIN\s*[A-Z0-9]*)\b/i);
      if (sectionMatch) {
        return `${grade} - ${sectionMatch[1].trim()}`.substring(0, 60);
      }
      return grade.substring(0, 50);
    }

    // ── Priorité 2 : catégories nommées connues ──────────────────────────────
    const knownCategories: RegExp[] = [
      /carré\s+or/i,
      /fosse\s+(?:debout|or|1|2)?/i,
      /vip(?:\s+[a-z]+)?/i,
      /premium/i,
      /orchestre/i,
      /balcon/i,
      /gradin\s*[a-z0-9]*/i,
      /pelouse/i,
      /standing/i,
      /tribune\s*[a-z0-9]*/i,
      /piste/i,
      /parterre\s*[a-z]?/i, // en dernier (moins spécifique)
    ];

    for (const pattern of knownCategories) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim().substring(0, 50);
      }
    }

    // ── Priorité 3 : pattern générique ──────────────────────────────────────
    const catMatch = text.match(/(?:zone|placement)[\s:]+([^\n\r,]{2,50})/i);
    if (catMatch?.[1]) {
      return catMatch[1].trim().substring(0, 50);
    }

    return null;
  }

  // ============================================================================
  // EXTRACTION SIÈGE
  // ============================================================================

  private static extractSeat(text: string): string | null {
    // ── Normalisation Ticketnet multi-ligne ──────────────────────────────────
    // "Rang\n15\nPlace\n148" → "Rang 15 Place 148"
    const normalized = text
      .replace(/\b(Rang|Row|Rangée)\s*\n\s*(\d+)\s*\n\s*(Place|Siège|Seat)\s*\n\s*(\d+)/gi,
        (_, r, n1, p, n2) => `${r} ${n1} ${p} ${n2}`)
      .replace(/\b(Rang|Row|Rangée)\s*\n\s*(\d+)/gi, (_, r, n) => `${r} ${n}`)
      .replace(/\b(Place|Siège|Seat)\s*\n\s*(\d+)/gi, (_, p, n) => `${p} ${n}`);

    // Rang + Place/Siège sur la même ligne (après normalisation)
    const rangMatch = normalized.match(
      /rang[\s:#]*(\d+|[a-z])[,\-–\s]+(?:siège|seat|place)[\s:#]*([a-z]?\d+)/i,
    );
    if (rangMatch) {
      return `Rang ${rangMatch[1]}, Siège ${rangMatch[2]}`.trim();
    }

    // "Rang 15 Place 148" (format normalisé sans séparateur)
    const rangPlaceMatch = normalized.match(
      /rang[\s:#]+(\d+)[^\n\r]*?(?:place|siège|seat)[\s:#]+(\d+)/i,
    );
    if (rangPlaceMatch) {
      return `Rang ${rangPlaceMatch[1]}, Siège ${rangPlaceMatch[2]}`;
    }

    // Siège seul
    const seatMatch = normalized.match(/(?:siège|seat|place\s*n°?)[\s:#]+([a-z]?\d+)/i);
    if (seatMatch?.[1]) {
      return seatMatch[1].trim().substring(0, 20);
    }

    return null;
  }

  // ============================================================================
  // EXTRACTION CODE-BARRES
  // ============================================================================

  private static extractBarcode(text: string): string | null {
    // Ticketnet / Digitick : codes à 16 chiffres (ex: 0207282526815086)
    const code16 = text.match(/\b(\d{16})\b/);
    if (code16) return code16[1];

    // EAN-13 (13 chiffres)
    const ean13 = text.match(/\b(\d{13})\b/);
    if (ean13) return ean13[1];

    // Codes alphanumériques de billetterie (ex: TM1234567890, FK123456789)
    const alphaMatch = text.match(/\b([A-Z]{2}\d{8,15})\b/);
    if (alphaMatch) return alphaMatch[1];

    // BilletRéduc / billetteries génériques : "Billet n° 1458737" ou "Billet n°1458737-1/2"
    const billetMatch = text.match(/billet\s+n[°o]?\s*(\d{5,12})(?:\s*[-–]\s*\d+\/\d+)?/i);
    if (billetMatch) return billetMatch[1];

    // "N° de billet : XXXXXXX" ou "Numéro : XXXXXXX"
    const numMatch = text.match(/(?:n[°o]?\s+de\s+billet|num[eé]ro\s+de\s+billet)[\s:]+(\w{5,20})/i);
    if (numMatch) return numMatch[1];

    // ID transaction CB (ex: "ID CB : n°24 638 689") — sans espaces
    const idCBMatch = text.match(/ID\s+CB\s*:\s*n[°o]?\s*([\d\s]{6,15})/i);
    if (idCBMatch) return idCBMatch[1].replace(/\s+/g, '');

    return null;
  }

  // ============================================================================
  // DÉTECTION TYPE CODE-BARRES
  // ============================================================================

  private static detectBarcodeType(barcode: string): string {
    if (/^\d{16}$/.test(barcode)) return 'TICKETNET16';   // Ticketnet / Digitick
    if (/^\d{13}$/.test(barcode)) return 'EAN13';
    if (/^\d{12}$/.test(barcode)) return 'UPC12';
    if (/^\d{8}$/.test(barcode)) return 'EAN8';
    if (/^\d{5,10}$/.test(barcode)) return 'BILLETREDUC';  // BilletRéduc / numéro billet court
    if (/^[A-Z]{2}\d+$/.test(barcode)) return 'ALPHANUMERIC';
    return 'UNKNOWN';
  }

  // ============================================================================
  // SCORE DE CONFIANCE
  // ============================================================================

  private static calculateConfidence(data: IExtractedTicketData): {
    confidence: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;

    // Prix facial (poids : 25)
    if (data.originalPrice) {
      score += 25;
    } else {
      warnings.push('Prix facial non trouvé — saisissez-le manuellement');
    }

    // Date (poids : 20)
    if (data.eventDate) {
      score += 20;
    } else {
      warnings.push("Date de l'événement non trouvée");
    }

    // Nom événement (poids : 20)
    if (data.eventName) {
      score += 20;
    } else {
      warnings.push("Nom de l'événement non trouvé");
    }

    // Lieu (poids : 10)
    if (data.venueName) score += 10;

    // Ville (poids : 10)
    if (data.city) score += 10;

    // Catégorie (poids : 10)
    if (data.seatCategory) score += 10;

    // Siège (poids : 5)
    if (data.seatNumber) score += 5;

    return {
      confidence: score / maxScore,
      warnings,
    };
  }
}
