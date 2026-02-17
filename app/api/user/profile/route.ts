/**
 * @api {get} /api/user/profile Get User Profile
 * @description Récupère le profil de l'utilisateur authentifié
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le profil via Prisma
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        kycStatus: true,
        stripeAccountId: true,
        trustScore: true,
      },
    });

    if (!profile) {
      // Créer le profil s'il n'existe pas
      const newProfile = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || null,
          phone: user.phone || null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          kycStatus: true,
          stripeAccountId: true,
          trustScore: true,
        },
      });

      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}
