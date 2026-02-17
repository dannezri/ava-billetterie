/**
 * Test endpoint for Stripe Connect
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stripe-test
 * Test route to verify routing works
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Stripe test route works!',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
