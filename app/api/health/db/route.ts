/**
 * Database health check endpoint
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as result`;
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'connected',
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL (Supabase)',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_CONNECTION_FAILED',
          message: error instanceof Error ? error.message : 'Cannot connect to database',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 503 }
    );
  }
}
