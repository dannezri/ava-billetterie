import { NextRequest, NextResponse } from 'next/server';
import { createConnectAccount } from '@/services/stripe-connect';
import { isDevelopment } from '@/config/env';
import prisma from '@/lib/db/prisma';

/**
 * Route de TEST pour créer un compte Stripe Connect
 * ⚠️ DÉSACTIVÉE EN PRODUCTION - Bypass l'authentification
 */
export async function POST(req: NextRequest) {
  // Vérifier qu'on est en développement
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'Cette route de test n\'est disponible qu\'en développement' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { 
      userId = 'test-user-id',
      email = 'test-seller@example.com',
      country = 'FR',
      businessType = 'individual'
    } = body;

    // 1. Créer ou mettre à jour l'utilisateur de test dans la base de données
    // Cela évite l'erreur Prisma "Record to update not found"
    await prisma.user.upsert({
      where: { email },
      update: {
        id: userId, // S'assurer que l'ID correspond
      },
      create: {
        id: userId,
        email,
        name: 'Test Seller',
        kycStatus: 'PENDING',
        verifiedIdentity: false,
      },
    });

    console.log(`✅ Test user ensured in DB: ${userId} (${email})`);

    // 2. Créer le compte Connect
    const accountId = await createConnectAccount({
      userId,
      email,
      country,
      businessType,
    });

    return NextResponse.json({
      success: true,
      accountId,
      message: 'Compte Stripe Connect de test créé avec succès',
      warning: 'Ceci est une route de test - désactivée en production',
    });
  } catch (error) {
    console.error('Error creating test Connect account:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du compte Connect de test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
