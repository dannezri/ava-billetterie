import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? [];

/**
 * POST /api/admin/uploadcare/store
 * Force le stockage permanent d'un fichier Uploadcare via l'API REST (secret key).
 * Nécessaire car l'upload client avec public key seule n'est pas suffisant
 * si "Auto-store" est désactivé dans le projet Uploadcare.
 */
export async function POST(req: NextRequest) {
  try {
    // Auth admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { uuid } = await req.json();
    if (!uuid || typeof uuid !== 'string' || !/^[0-9a-f-]{36}$/.test(uuid)) {
      return NextResponse.json({ error: 'UUID invalide' }, { status: 400 });
    }

    const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
    const secretKey = process.env.UPLOADCARE_SECRET_KEY;

    if (!publicKey || !secretKey) {
      return NextResponse.json({ error: 'Configuration Uploadcare manquante' }, { status: 500 });
    }

    const authHeader = `Uploadcare.Simple ${publicKey}:${secretKey}`;
    const ucHeaders = {
      Authorization: authHeader,
      Accept: 'application/vnd.uploadcare-v0.7+json',
    };

    // 1. Stocker définitivement le fichier
    const storeRes = await fetch(`https://api.uploadcare.com/files/${uuid}/storage/`, {
      method: 'PUT',
      headers: ucHeaders,
    });

    if (!storeRes.ok) {
      const errorText = await storeRes.text();
      return NextResponse.json(
        { error: `Uploadcare store failed: ${storeRes.status}`, detail: errorText },
        { status: 502 }
      );
    }

    // 2. Récupérer les infos du fichier pour obtenir l'URL CDN réelle du projet
    // (le projet peut utiliser un domaine CDN custom différent de ucarecdn.com)
    const infoRes = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
      headers: ucHeaders,
    });

    if (!infoRes.ok) {
      return NextResponse.json(
        { error: `Uploadcare file info failed: ${infoRes.status}` },
        { status: 502 }
      );
    }

    const info = await infoRes.json();
    // original_file_url contient le vrai domaine CDN du projet
    const cdnUrl = info.original_file_url ?? `https://ucarecdn.com/${uuid}/`;

    return NextResponse.json({
      success: true,
      uuid: info.uuid,
      cdnUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
