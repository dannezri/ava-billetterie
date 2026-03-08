import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { passwordResetLimiter, applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Rate limit par email (pas par IP, pour éviter de bloquer un WiFi public)
    const rateLimitResponse = await applyRateLimit(passwordResetLimiter, email.toLowerCase());
    if (rateLimitResponse) return rateLimitResponse;

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
