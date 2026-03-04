/**
 * POST /api/tickets/extract-pdf
 * Flow :
 * 1. Extraction texte + Gemini via PDFExtractionService
 * 2. Multi-pages : mupdf (WASM) split chaque page en PDF individuel + upload Supabase Storage
 * 3. Une page : URL Supabase Storage initiale réutilisée
 */

import { PDFExtractionService } from '@/lib/services/pdf-extraction.service';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const BUCKET = 'ticket-pdfs';

// ─── Split une page d'un PDF (potentiellement chiffré) via mupdf WASM ──────────
// mupdf est un paquet ESM avec top-level await → import() dynamique obligatoire.
// Déclaré dans serverExternalPackages + config.externals (next.config.mjs) pour
// éviter que webpack tente de le bundler.

async function extractSinglePagePdf(pdfBuffer: Buffer, pageIndex: number): Promise<Buffer> {
  const mupdf = await import('mupdf');

  const srcDoc = new mupdf.PDFDocument(pdfBuffer);

  if (srcDoc.needsPassword()) {
    srcDoc.authenticatePassword('');
  }

  const newDoc = new mupdf.PDFDocument();
  newDoc.graftPage(0, srcDoc, pageIndex);

  // saveToBuffer() retourne un mupdf.Buffer (pas un Node.js Buffer)
  // → utiliser .asUint8Array() pour la conversion
  const mupdfBuffer = newDoc.saveToBuffer('garbage=2,compress');
  return Buffer.from(mupdfBuffer.asUint8Array());
}

// ─── Upload générique d'un buffer vers Supabase Storage ───────────────────────

async function uploadBufferToSupabase(
  buffer: Buffer,
  filename: string,
  userId: string,
): Promise<{ uuid: string; cdnUrl: string }> {
  const uuid = randomUUID();
  const storagePath = `${userId}/${uuid}.pdf`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: false });

  if (error) throw new Error(`Supabase Storage upload échoué : ${error.message}`);

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
  return { uuid, cdnUrl: publicUrl };
}

// ─── Route principale ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    // UUID + URL Supabase du fichier déjà uploadé via /api/upload/ticket-pdf
    const storageUuid    = (formData.get('storageUuid')    as string | null) ?? null;
    const storageCdnUrl  = (formData.get('storageCdnUrl')  as string | null) ?? null;

    if (!file) return NextResponse.json({ error: 'Champ "file" requis' }, { status: 400 });
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf'))
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'PDF trop volumineux (max 5 MB)' }, { status: 413 });

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    const baseName = file.name.replace(/\.pdf$/i, '');

    // Extraction texte + Gemini
    const result = await PDFExtractionService.extractFromBuffer(pdfBuffer);
    const ticketCount = result.extractedData.tickets?.length ?? 0;
    const numpages = ticketCount > 1 ? ticketCount : 1;

    let perPageFiles: Array<{ pdfUrl: string; pdfUuid: string }> = [];

    if (numpages === 1) {
      if (storageUuid && storageCdnUrl) {
        // Réutiliser l'URL Supabase déjà uploadée — pas de nouvel upload
        perPageFiles = [{ pdfUuid: storageUuid, pdfUrl: storageCdnUrl }];
      } else {
        const uploaded = await uploadBufferToSupabase(pdfBuffer, `${baseName}-billet-1.pdf`, user.id);
        perPageFiles = [{ pdfUrl: uploaded.cdnUrl, pdfUuid: uploaded.uuid }];
      }
    } else {
      // Multi-pages : mupdf extrait chaque page et upload individuellement vers Supabase Storage
      for (let pageIndex = 0; pageIndex < numpages; pageIndex++) {
        const pageBuffer = await extractSinglePagePdf(pdfBuffer, pageIndex);
        const uploaded = await uploadBufferToSupabase(
          pageBuffer,
          `${baseName}-billet-${pageIndex + 1}.pdf`,
          user.id,
        );
        perPageFiles.push({ pdfUrl: uploaded.cdnUrl, pdfUuid: uploaded.uuid });
      }
    }

    const tickets = (result.extractedData.tickets ?? []).map((ticket, i) => ({
      ...ticket,
      pdfUrl: perPageFiles[i]?.pdfUrl ?? perPageFiles[0]?.pdfUrl,
      pdfUuid: perPageFiles[i]?.pdfUuid ?? perPageFiles[0]?.pdfUuid,
    }));

    return NextResponse.json({
      success: true,
      pdfHash: result.pdfHash,
      pdfSizeBytes: result.pdfSizeBytes,
      confidence: result.confidence,
      warnings: result.warnings,
      extractedData: {
        eventName: result.extractedData.eventName,
        eventDate: result.extractedData.eventDate?.toISOString() ?? null,
        venueName: result.extractedData.venueName,
        city: result.extractedData.city,
        originalPrice: result.extractedData.originalPrice,
        seatCategory: result.extractedData.seatCategory,
        row: result.extractedData.row,
        seatNumber: result.extractedData.seatNumber,
        barcode: result.extractedData.barcode,
        barcodeType: result.extractedData.barcodeType,
        tickets,
      },
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[extract-pdf] Erreur:', err);
    if (err.message?.includes('GEMINI_API_KEY') || err.message?.includes('[Gemini]'))
      return NextResponse.json({ error: 'Gemini indisponible.', code: 'GEMINI_UNAVAILABLE' }, { status: 503 });
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
