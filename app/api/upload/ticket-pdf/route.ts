/**
 * POST /api/upload/ticket-pdf
 * Upload d'un billet PDF vers Supabase Storage.
 * Contourne la restriction FileTypeForbiddenError d'Uploadcare.
 *
 * Returns: { uuid, name, size, mimeType, cdnUrl, originalUrl }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server-client';
import { randomUUID } from 'crypto';

const BUCKET = 'ticket-pdfs';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  // Auth : l'utilisateur doit être connecté
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Récupérer le fichier
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
  }

  // Validation type MIME
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 });
  }

  // Validation taille
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Le fichier ne doit pas dépasser 5 MB' }, { status: 400 });
  }

  // Créer le bucket s'il n'existe pas (idempotent)
  await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ['application/pdf'],
    fileSizeLimit: MAX_SIZE_BYTES,
  }).catch(() => { /* bucket existe déjà — OK */ });

  // Générer un chemin unique
  const uuid = randomUUID();
  const ext = '.pdf';
  const storagePath = `${user.id}/${uuid}${ext}`;

  // Upload vers Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    console.error('[upload/ticket-pdf] Supabase Storage error:', uploadError);
    return NextResponse.json(
      { error: `Erreur lors de l'upload : ${uploadError.message}` },
      { status: 500 }
    );
  }

  // Récupérer l'URL publique
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({
    uuid,
    name: file.name,
    size: file.size,
    mimeType: 'application/pdf',
    cdnUrl: publicUrl,
    originalUrl: publicUrl,
  });
}
