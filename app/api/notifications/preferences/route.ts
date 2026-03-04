/**
 * GET  /api/notifications/preferences  - Récupère les préférences
 * POST /api/notifications/preferences  - Met à jour les préférences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import prisma from '@/lib/db/prisma';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let prefs = await prisma.notificationPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreferences.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error('[API] GET /notifications/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    const prefs = await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: {
        emailTransactions: body.emailTransactions ?? undefined,
        emailDisputes: body.emailDisputes ?? undefined,
        emailPriceAlerts: body.emailPriceAlerts ?? undefined,
        emailSystem: body.emailSystem ?? undefined,
        pushEnabled: body.pushEnabled ?? undefined,
        pushSound: body.pushSound ?? undefined,
        dailyDigest: body.dailyDigest ?? undefined,
        digestTime: body.digestTime ?? undefined,
        priceAlertFrequency: body.priceAlertFrequency ?? undefined,
      },
      create: { userId: user.id, ...body },
    });

    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error('[API] POST /notifications/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
